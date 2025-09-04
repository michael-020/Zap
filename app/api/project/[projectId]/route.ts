import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

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
            }
        })

        if(!project){
            return NextResponse.json(
                { msg: "Project not found" },
                { status: 400 }
            )
        }

        await prisma.project.delete({
            where: {
                id: projectId
            }
        })

        return NextResponse.json(
            { msg: "Project deleted successfully" }
        )
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

        const newName = await req.json();
        const { projectId } = await params

        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })

        if(!project){
            return NextResponse.json(
                { msg: "Project not found" },
                { status: 400 }
            )
        }

        await prisma.project.update({
            where: {
                id: projectId
            }, 
            data: {
                name: newName
            }
        })

        return NextResponse.json(
            { msg: "Project renamed successfully" }
        )
    } catch (error) {
        console.error("Error while renaming project: ", error)
        return NextResponse.json(
            { msg: "Internal server error" },
            { status: 500 }
        )
    }
}