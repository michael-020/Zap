import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
 ) {
   const { projectId } = await params
  try{
    if(!projectId){
      return NextResponse.json(
        { msg: "Project Id is not provided" },
        { status: 403 }
      )
    }
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