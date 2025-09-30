import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        const chats = await prisma.project.findMany({
            where: {
                isPublic: true
            }
        })

        if(!chats){
            return NextResponse.json(
                { msg: "No chats found" },
                { status: 400 }
            )
        }

        return NextResponse.json(chats)
    } catch (error) {
        console.error("Error while fetching projects: ", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}