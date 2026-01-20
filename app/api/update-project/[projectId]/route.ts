import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { msg: "You are not authorised to access this endpoint" },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { msg: "Project ID is required" },
        { status: 400 }
      );
    }

    const parsedBody = updateProjectSchema.safeParse(await req.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        { msg: "Invalid inputs" },
        { status: 400 }
      );
    }

    const { name } = parsedBody.data;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { msg: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name },
    });

    return NextResponse.json({
      name: updatedProject.name,
    });
  } catch (error) {
    console.error("Error while updating project", error);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}
