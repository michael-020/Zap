import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
    req: NextResponse,
    { params }: { params: Promise<{ projectId: string }> }
){
    try {
        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            return NextResponse.json(
                { msg: "You are not authorised to access this endpoint" },
                { status: 401}
            )
        }

        const { projectId } = await params

         const project = await prisma.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                chats: true 
            }
        });

        if (!project) {
            return NextResponse.json(
                { msg: "Project not found" },
                { status: 400 }
            );
        }

        if (project.chats.length > 0) {
            await prisma.chat.deleteMany({
                where: {
                    projectId
                }
            });
        }

        await prisma.project.delete({
            where: {
                id: projectId
            }
        });

        return NextResponse.json(
            { msg: "Project deleted successfully" }
        );
    } catch (error) {
        console.error("Error while deleting project", error)
        return NextResponse.json(
            { msg: "Internal server error" },
            { status: 500 }
        )
    }
}


export async function PUT(
    req: NextResponse,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            return NextResponse.json(
                { msg: "You are not authorised to access this endpoint" },
                { status: 401}
            )
        }

        const { name: newName, previewUrl: newPreviewUrl } = await req.json()
        const { projectId } = await params;

        const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        });

        if (!project) {
        return NextResponse.json(
            { msg: "Project not found" },
            { status: 400 }
        );
        }

        const updatedData: { name?: string; previewUrl?: string } = {};

        if (newName !== undefined && newName !== null) {
        updatedData.name = newName;
        }

        if (newPreviewUrl !== undefined && newPreviewUrl !== null) {
        updatedData.previewUrl = newPreviewUrl;
        }

        if (Object.keys(updatedData).length === 0) {
        return NextResponse.json(
            { msg: "No data to update" },
            { status: 400 }
        );
        }

        await prisma.project.update({
        where: {
            id: projectId,
        },
        data: updatedData,
        });

        return NextResponse.json(
        { msg: "Project updated successfully" }
        );
    } catch (error) {
        console.error("Error while renaming project: ", error)
        return NextResponse.json(
            { msg: "Internal server error" },
            { status: 500 }
        )
    }
}