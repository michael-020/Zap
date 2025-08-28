import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  try{
    const chats = await prisma.chat.findMany({
      where: {
        projectId
      }
    })
    
    return NextResponse.json(chats)
  }
  catch(e) {
    console.error(`Error while fetching chats for project-${projectId}: `, e)
    return NextResponse.json(
      { msg: "Internal server error" },
      { status: 500 }
    )
  }
}