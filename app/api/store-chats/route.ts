import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const { prompt, response, projectId } = await req.json()

        await prisma.chat.create({
            data: {
                prompt, 
                response,
                projectId
            }
        })

    } catch (error) {
        console.error("Error while storing chats", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}