import { NextRequest, NextResponse } from "next/server";
import { BASE_PROMPT } from "@/lib/prompts";
import { basePrompt as reactBasePrompt } from "@/defaults/react";
import { basePrompt as nodeBasePrompt } from "@/defaults/node";
import { openai } from "@/lib/server/openai";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

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
      const { prompt } = validatedSchema.data

      const response = await openai.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
              {
                  role: "system",
                  content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
              },
              prompt
          ],
          max_completion_tokens: 2000,
      });

      const answer = response.choices[0].message.content;

      if(answer === "react"){ 
          return NextResponse.json(
              {
                  prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                  uiPrompts: [reactBasePrompt]
              },
              { status: 200 }
          )
      }

      if(answer === "node"){
          return NextResponse.json(
              {
                  prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                  uiPrompts: [nodeBasePrompt]
              },
              { status: 200 }
          )
      }

      return NextResponse.json(
          { msg: "Model response did not match expected output. Expected 'node' or 'react', but got something else." },
          { status: 400 }
      )
    } catch (error) {
      console.error("Error while generating template: ", error)
      return NextResponse.json(
          { msg: "Internal Server Error" },
          { status: 500}
      )
    }
}