import { getSystemPrompt } from "@/lib/prompts";
import { openai } from "@/lib/server/openai";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import axios from "axios";
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const chatStreamSchema = z.object({
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
  images: z.array(z.string()).optional(),
  url: z.string()
});

function generateUniqueFilename() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.-]/g, '_');  // Format to 'YYYY-MM-DDTHH_MM_SS'
  return `screenshot_${timestamp}.png`;
}

// Helper function to create image content objects
function createImageContent(images: string[]) {
  return images.map(image => ({
    type: "image_url" as const,
    image_url: {
      url: image,
      detail: "high" as const
    }
  }));
}

// Helper function to format messages with images
function formatMessagesWithImages(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  prompt: { role: "user" | "assistant" | "system"; content: string },
  images?: string[]
): ChatCompletionMessageParam[] {
  
  const inputMessages: ChatCompletionMessageParam[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }));

  // Create the final prompt message with images if provided
  let finalPrompt: ChatCompletionMessageParam;
  
  if (images && images.length > 0) {
    // If images are provided, format the prompt message to include both text and images
    finalPrompt = {
      // OpenAI only allows the "user" role to send images
      role: "user",
      content: [
        {
          type: "text",
          text: prompt.content
        },
        ...createImageContent(images)
      ]
    };
  } else {
    // No images, just use text content
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

export async function POST(req: NextRequest){
  try {
    const session = await getServerSession(authOptions)
    if(!session || !session.user){
        return NextResponse.json(
            { msg: "You are not authorised to access this endpoint" },
            { status: 401}
        )
    }
    
    const validatedSchema = chatStreamSchema.safeParse(await req.json())
    if(!validatedSchema.success){
      console.error("Validation error:", validatedSchema.error);
      return NextResponse.json(
        { msg: "Invalid Inputs", errors: validatedSchema.error.errors },
        { status: 400 }
      )
    }
    
    const { messages, prompt, images, url } = validatedSchema.data

    console.log("url: ", url)
    
    if(url.replace(/\n/g, '').trim() === "not a url".toLowerCase()){
      // Validate images if provided
      if (images && images.length > 0) {
        const invalidImages = images.filter(image => {
          // Basic validation for base64 data URLs
          return !image.startsWith('data:image/') || !image.includes('base64,');
        });
        
        if (invalidImages.length > 0) {
          return NextResponse.json(
            { msg: "Invalid image format. Images must be base64 data URLs." },
            { status: 400 }
          );
        }
        
        // Optional: Check image count limit
        if (images.length > 10) {
          return NextResponse.json(
            { msg: "Too many images. Maximum 10 images allowed." },
            { status: 400 }
          );
        }
      }

      const formattedMessages = formatMessagesWithImages(messages, prompt, images);
      
      const completion = await openai.chat.completions.create({
          model: "gemini-2.5-pro",
          messages: formattedMessages,
          stream: true,
          max_completion_tokens: 800_000
      });
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
          async start(controller) {
              try {
                for await (const chunk of completion) {
                  const content = chunk.choices[0].delta.content;
                  if (content) {
                    console.log("Chunk content:", content);
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
    }
    else {
      try {
        // Check if the URL starts with 'https://', if not, add it
        let correctUrl = url
        if (!url.startsWith("https://")) {
          correctUrl = `https://${url}`;
        }

        const res = await axios.get(correctUrl);

        // If the URL returns a 404, handle that
        if (res.status === 404) {
          console.log("URL not found:", res.data);
          return NextResponse.json(
            { msg: "Url not found" },
            { status: 404 }
          );
        }

        // console.log("Response data:", res.data);
        const browser = await puppeteer.launch({
          headless: false,
        });
        const page = await browser.newPage();

        await page.goto(correctUrl);
        const ss = await page.screenshot({
          fullPage: true,
        });

        const filename = generateUniqueFilename();

        const filePath = path.join(process.cwd(), 'public/screenshots', filename);

         // Write the screenshot to the file system
        fs.writeFileSync(filePath, ss);

        console.log("Screenshot saved at:", filePath);

        return NextResponse.json({
          msg: "chatting",
          filePath 
        });
      } catch (error) {
        console.error("Error while fetching URL:", error);

        // Check for network-related errors (like ENOTFOUND)
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === 'ENOTFOUND'
        ) {
          return NextResponse.json(
            { msg: `URL not found (DNS resolution error)` },
            { status: 404 }
          );
        }

        // Handle other potential errors (timeouts, connection errors, etc.)
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === 'ECONNABORTED'
        ) {
          return NextResponse.json(
            { msg: "Request Timeout: Unable to reach the URL" },
            { status: 408 }
          );
        }
      }
    }
  } catch (error) {
      console.error("Error while chatting: ", error);
      
      // More specific error handling
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
      )
  }
}