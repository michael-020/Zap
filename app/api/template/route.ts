import { NextRequest, NextResponse } from "next/server";
import { BASE_PROMPT } from "@/lib/prompts";
import { basePrompt as reactBasePrompt } from "@/defaults/react";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";

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

        return NextResponse.json(
            {
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [reactBasePrompt]
            },
            { status: 200 }
        )
    } catch (error) {
      console.error("Error while generating template: ", error)
      return NextResponse.json(
          { msg: "Internal Server Error" },
          { status: 500}
      )
    }
}