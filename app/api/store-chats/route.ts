import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
  prompt: z.string(),
  response: z.array(z.string()),
  projectId: z.string(),
})

export async function POST(req: NextRequest) {
    try {
        const validatedSchema = chatSchema.safeParse(await req.json())
        
        if(!validatedSchema.success){
          return NextResponse.json(
            { msg: "Invlid Inputs" },
            { status: 400 }
          )
        }
        
        const { prompt, response, projectId } = validatedSchema.data

        await prisma.chat.create({
            data: {
                prompt, 
                response: response.join("\n"),
                projectId
            }
        })
        
        // await prisma.files.createMany({
        //   data: files.map((file: { path: string; code: string }) => ({
        //     path: file.path,
        //     code: file.code,
        //     projectId: projectId
        //   }))
        // });

        return NextResponse.json(
          { msg: "Chats stored successfully" },
          { status: 200 }
        )

    } catch (error) {
        console.error("Error while storing chats", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}