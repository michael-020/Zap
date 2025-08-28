import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if(!session ||!session.user){
      return NextResponse.json(
        { msg: "Unauthorised" },
        { status: 401 }
      )
    }
    
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(projects)
  }
  catch (e) {
    console.error("Error while fetching previous chats", e)
    return NextResponse.json(
      { msg: "Internal server error" },
      { status: 500 }
    )
  }
}