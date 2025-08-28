import { getSystemPrompt } from "@/lib/prompts";
import { openai } from "@/lib/server/openai";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

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
  })
});

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
      return NextResponse.json(
        { msg: "Invalid Inputs" },
        { status: 400 }
      )
    }
    const { messages, prompt } = validatedSchema.data

      
    const inputMessages: ChatCompletionMessageParam[] = messages.map((msg: { role: "user" | "assistant" | "system"; content: string }) => ({
      role: msg.role,
      content: msg.content
    }));

    const formatedMessages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: getSystemPrompt()
        },
        ...inputMessages,
        prompt,
    ]
    
    const completion = await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: formatedMessages,
        stream: true,
        max_completion_tokens: 800000
    });
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            for await (const chunk of completion) {
                console.log(chunk.choices[0].delta.content);
                const content = chunk.choices[0].delta.content;
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain",
            "Transfer-Encoding": "chunked"
        }
    });
  } catch (error) {
      console.error("Error while chatting: ", error)
      return NextResponse.json(
          { msg: "Internal Server Error" },
          { status: 500 }
      )
  }
}