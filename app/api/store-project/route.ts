import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

export const projectSchema = z.object({
  prompt: z.string().min(1)
})

export async function POST(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions)

      if(!session || !session.user){
          return NextResponse.json(
              { msg: "You are not authorised to access this endpoint" },
              { status: 401}
          )
      }
      
      const validatedSchema = projectSchema.safeParse(await req.json())
      if(!validatedSchema.success){
        return NextResponse.json(
          { msg: "Invalid Inputs" },
          { status: 400 }
        )
      }
      const { prompt } = validatedSchema.data

      const newProject = await prisma.project.create({
          data: {
              name: prompt,
              userId: session.user.id
          }
      })

      return NextResponse.json(
          { 
              msg: "Project created Successfully",
              projectId: newProject.id
          }
      )
    } catch (error) {
      console.error("Error while creating project", error)
      return NextResponse.json(
          { msg: "Internal Server Error" },
          { status: 500 }
      )
    }
}