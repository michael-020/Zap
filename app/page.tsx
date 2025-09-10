import { authOptions } from '@/lib/server/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function Landing() {
  const session = await getServerSession(authOptions)
  if(session)
    redirect("/home")

  return (
    <main className='p-4 space-y-4'>
      LANDING PAGE
    </main>
  )
}