import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1)
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

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isPremium: true },
      });

      if (!user) {
        return NextResponse.json(
          { msg: "User not found" },
          { status: 404 }
        );
      }

      const projectCount = await prisma.project.count({
        where: { userId: session.user.id },
      });

      if (!user.isPremium && projectCount >= 5) {
        return NextResponse.json(
          { msg: "You've reached the limit of 5 projects for your account.\nUpgrade to Pro to create more projects." },
          { status: 403 }
        );
      }
      
      const validatedSchema = projectSchema.safeParse(await req.json())
      if(!validatedSchema.success){
        return NextResponse.json(
          { msg: "Invalid Inputs" },
          { status: 400 }
        )
      }
      const { name } = validatedSchema.data

      const newProject = await prisma.project.create({
          data: {
              name,
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