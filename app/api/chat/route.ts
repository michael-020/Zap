import { getSystemPrompt } from "@/lib/prompts";
import { openai } from "@/lib/server/openai";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { prisma } from "@/lib/prisma";

const chatStreamSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1)
    })
  ),
  prompt: z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1)
  }),
  images: z.array(
    z.union([
      z.string(), 
      z.instanceof(File), 
      z.object({ 
        data: z.instanceof(ArrayBuffer).or(z.instanceof(Uint8Array)),
        type: z.string(),
        name: z.string().optional()
      })
    ])
  ).optional(),
});

async function convertWebPToBase64(imageData: File | ArrayBuffer | Uint8Array, mimeType: string = 'image/webp'): Promise<string> {
  let buffer: ArrayBuffer;
  
  if (imageData instanceof File) {
    buffer = await imageData.arrayBuffer();
  } else if (imageData instanceof Uint8Array) {
    buffer = imageData.buffer as ArrayBuffer;
  } else {
    buffer = imageData;
  }
  
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

async function createImageContent(images: (string | File | { data: ArrayBuffer | Uint8Array, type: string, name?: string })[]): Promise<Array<{ type: "image_url"; image_url: { url: string; detail: "high" } }>> {
  const imageContents = await Promise.all(
    images.map(async (image) => {
      let imageUrl: string;
      
      if (typeof image === 'string') {
        imageUrl = image;
      } else if (image instanceof File) {
        imageUrl = await convertWebPToBase64(image, image.type);
      } else {
        imageUrl = await convertWebPToBase64(image.data, image.type);
      }
      
      return {
        type: "image_url" as const,
        image_url: {
          url: imageUrl,
          detail: "high" as const
        }
      };
    })
  );
  
  return imageContents;
}

async function formatMessagesWithImages(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  prompt: { role: "user" | "assistant" | "system"; content: string },
  images?: (string | File | { data: ArrayBuffer | Uint8Array, type: string, name?: string })[]
): Promise<ChatCompletionMessageParam[]> {
  
  const inputMessages: ChatCompletionMessageParam[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }));

  let finalPrompt: ChatCompletionMessageParam;
  
  if (images && images.length > 0) {
    const imageContents = await createImageContent(images);
    
    finalPrompt = {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt.content
        },
        ...imageContents
      ]
    };
  } else {
    finalPrompt = {
      role: prompt.role,
      content: prompt.content
    };
  }

  return [
    {
      role: "system",
      content: getSystemPrompt()
    },
    ...inputMessages,
    finalPrompt
  ];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { msg: "You are not authorised to access this endpoint" },
        { status: 401 }
      );
    }

    if (!session.user.isPremium) {
      const usageRecord = await prisma.usage.findFirst({
        where: {
          userId: session.user.id,
          date: new Date(),
        },
      });

      if (usageRecord && usageRecord.chatCount >= 5) {
        return NextResponse.json(
          { msg: "Daily chat limit exceeded. Please try again tomorrow." },
          { status: 429 }
        );
      }

      if (usageRecord) {
        await prisma.usage.update({
          where: { id: usageRecord.id },
          data: { chatCount: usageRecord.chatCount + 1 },
        });
      } else {
        await prisma.usage.create({
          data: {
            userId: session.user.id,
            date: new Date(),
            chatCount: 1,
          },
        });
      }
    }
    
    let parsedData;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const messagesStr = formData.get('messages') as string;
      const promptStr = formData.get('prompt') as string;
      
      const messages = JSON.parse(messagesStr);
      const prompt = JSON.parse(promptStr);
      
      const images: File[] = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('image_') && value instanceof File) {
          images.push(value);
        }
      }
      
      parsedData = { messages, prompt, images };
    } else {
      parsedData = await req.json();
    }
    
    const validatedSchema = chatStreamSchema.safeParse(parsedData);
    if (!validatedSchema.success) {
      console.error("Validation error:", validatedSchema.error);
      return NextResponse.json(
        { msg: "Invalid Inputs", errors: validatedSchema.error.errors },
        { status: 400 }
      );
    }
    
    const { messages, prompt, images } = validatedSchema.data;
    
    
    if (images && images.length > 0) {
      const base64Images = images.filter(img => typeof img === 'string');
      const invalidBase64Images = base64Images.filter(image => {
        return !image.startsWith('data:image/') || !image.includes('base64,');
      });
      
      if (invalidBase64Images.length > 0) {
        return NextResponse.json(
          { msg: "Invalid image format. Base64 images must be data URLs." },
          { status: 400 }
        );
      }
      
      const fileImages = images.filter(img => img instanceof File);
      const invalidWebPImages = fileImages.filter(file => {
        return !['image/webp', 'image/jpeg', 'image/png'].includes(file.type);
      });
      
      if (invalidWebPImages.length > 0) {
        return NextResponse.json(
          { msg: "Invalid image format. Only WebP, JPEG, and PNG images are supported." },
          { status: 400 }
        );
      }
      
      if (images.length > 10) {
        return NextResponse.json(
          { msg: "Too many images. Maximum 10 images allowed." },
          { status: 400 }
        );
      }
    }

    const formattedMessages = await formatMessagesWithImages(messages, prompt, images);
    
    const completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: formattedMessages,
      stream: true,
      max_completion_tokens: 100_000
    });

    console.log("completion: ", completion);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0].delta.content;
            if (content) {
              console.log(content);
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (streamError) {
          console.error("Error in stream:", streamError);
          controller.error(streamError);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked"
      }
    });
    
  } catch (error) {
    console.error("Error while chatting: ", error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { msg: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
      if (error.message.includes('invalid_request')) {
        return NextResponse.json(
          { msg: "Invalid request format or content." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}