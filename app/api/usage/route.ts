import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { msg: "You must be logged in to view usage." },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        const now = new Date();
        const today = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        );

        const usage = await prisma.usage.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today, 
                },
            },
        });

        if (!usage) {
            return NextResponse.json({ currentUsage: 0 }, { status: 200 });
        }

        return NextResponse.json(
            { currentUsage: usage.chatCount },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error while getting usage: ", error);
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { msg: "You must be logged in to update usage." },
                { status: 401 }
            );
        }

        if(session.user.isPremium){
            return NextResponse.json(
                { msg: "Premium user"}
            )
        }

        const userId = session.user.id;
        const now = new Date();
        const today = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        );

        const updatedUsage = await prisma.usage.upsert({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            update: {
                chatCount: {
                    increment: 1, 
                },
            },
            create: {
                userId,
                date: today,
                chatCount: 1, 
            },
        });

        return NextResponse.json(
            {
                msg: "Usage updated successfully.",
                updatedUsage: updatedUsage,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error while updating usage: ", error);
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        );
    }
}