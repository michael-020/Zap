import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()
        const session = await getServerSession(authOptions)

        if(!session || !session.user){
            return NextResponse.json(
                { msg: "You are not authorised to access this endpoint" },
                { status: 401}
            )
        }

        // const user = await prisma.user.findUnique({
        //     where: {
        //         email: session.user.email
        //     }
        // })

        // if(!user){
        //     return NextResponse.json(
        //         { msg: "User not found" },
        //         { status: 403 }
        //     )
        // }

        await prisma.project.create({
            data: {
                name: prompt,
                userId: session.user.id
            }
        })

        return NextResponse.json(
            { msg: "Project created Successfully" }
        )
    } catch (error) {
        console.error("Error while storing chats", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}