import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/server/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
 ) {
  const session = await getServerSession(authOptions)
  if(!session || !session.user){
      return NextResponse.json(
          { msg: "You are not authorised to access this endpoint" },
          { status: 401}
      )
  }
  
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