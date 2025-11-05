/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma"; 
import { authOptions } from "@/lib/server/authOptions";

const DOWNLOAD_LIMIT = 5;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isPremium) {
      return NextResponse.json({
        allowed: true,
        remaining: "Unlimited",
      });
    }

    if (user.downloadCount >= DOWNLOAD_LIMIT) {
      return NextResponse.json(
        {
          allowed: false,
          error: "You have reached your download limit of 5 projects.",
          remaining: 0,
        },
        { status: 403 } 
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        downloadCount: user.downloadCount + 1,
      },
    });

    const remaining = DOWNLOAD_LIMIT - (user.downloadCount + 1);

    return NextResponse.json({
      allowed: true,
      remaining: remaining,
    });
  } catch (error) {
    console.error("Download check failed:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}