import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
  prompt: z.string(),
  response: z.string(),
  projectId: z.string(),
})

export async function POST(req: NextRequest) {
    try {
        const validatedSchema = chatSchema.safeParse(await req.json())
        
        if(!validatedSchema.success){
          return NextResponse.json(
            { msg: "Invlid inputs" },
            { status: 400 }
          )
        }
        
        const { prompt, response, projectId } = validatedSchema.data

        await prisma.chat.create({
            data: {
                prompt, 
                response,
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

    } catch (error) {
        console.error("Error while storing chats", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}