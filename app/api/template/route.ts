import { NextRequest, NextResponse } from "next/server";
import { BASE_PROMPT } from "@/lib/prompts";
import { basePrompt as reactBasePrompt } from "@/defaults/react";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { openai } from "@/lib/server/openai";

const templateSchema = z.object({
  prompt: 
    z.object({
      role: z.enum(["user", "system", "assistant"]),
      content: z.string()
    })

});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if(!session || !session.user){
            return NextResponse.json(
                { msg: "You are not authorised to access this endpoint" },
                { status: 401}
            )
        }
        const validatedSchema = templateSchema.safeParse(await req.json())
        if(!validatedSchema.success){
            return NextResponse.json(
            { msg: "Invalid Inputs" },
            { status: 400 }
            )
        }
        const prompt = validatedSchema.data.prompt

        const response = await openai.chat.completions.create({
            model: process.env.BASE_MODEL!,
            messages: [
                {
                    role: "system",
                    content: `You are tasked with processing the following prompt and extracting information.
            
                    First, check if the prompt contains any URL, domain, or link. A valid URL or domain includes anything like 'example.com', 'https://example.com', or 'mikexdev.in'. If such a URL or domain is present, extract it. If no URL is found, respond with "not a url" and generate a relevant title based on the content of the prompt.

                    Secondly, based on the content of the prompt, assign a relevant title that briefly summarizes the core idea. If no URL is present, create a title that describes the main concept of the prompt. For example:
                    - "Create a Social Media Website" → "Social Media Website"
                    - "Build a website like netflix.com for streaming" → "A Website Like netflix.com"

                    The format of your response should be:
                    url: <extracted_url> or "not a url"
                    title: <assigned_title>`
                },
                prompt
            ],
        });

        const messageContent = response.choices[0]?.message?.content;
        if (!messageContent) {
            throw new Error("Invalid response format from OpenAI");
        }

        // Split the content into lines and extract url and title
        const lines = messageContent.split('\n');
        const url = lines.find(line => line.startsWith('url:'))?.replace('url:', '').trim() || 'not a url';
        const title = lines.find(line => line.startsWith('title:'))?.replace('title:', '').trim() || 'Untitled';

        console.log('Extracted URL:', url);
        console.log('Assigned Title:', title);

        return NextResponse.json(
            {
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [reactBasePrompt],
                url,
                title
            },
            { status: 200 }
        )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error while generating template: ", error)
        if (error?.status === 429) {
            return NextResponse.json(
            { msg: "RATE_LIMITED" },
            { status: 429 }
            )
        }
  
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500}
        )
    }
}