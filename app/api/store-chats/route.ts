import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import cloudinary from "@/lib/server/cloudinary";
import { authOptions } from "@/lib/server/authOptions";

const chatSchema = z.object({
  prompt: z.string(),
  response: z.array(z.string()),
  projectId: z.string(),
  images: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { msg: "You are not authorised to access this endpoint" },
        { status: 401 }
      );
    }

    const validatedSchema = chatSchema.safeParse(await req.json());

    if (!validatedSchema.success) {
      return NextResponse.json(
        { msg: "Invalid Inputs", errors: validatedSchema.error.errors },
        { status: 400 }
      );
    }

    const { prompt, response, projectId, images } = validatedSchema.data;

    let imageUrls: string[] = [];
    if(images){
      imageUrls = await Promise.all(
        images.map(async (image) => {
          const uploadResponse = await cloudinary.uploader.upload(image);
          return uploadResponse.secure_url;
        })
      );
    }

    await prisma.chat.create({
      data: {
        prompt,
        response: response.join("\n"),
        projectId,
        images: imageUrls
      },
    });

    return NextResponse.json(
      { msg: "Chats stored successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while storing chats", error);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}
