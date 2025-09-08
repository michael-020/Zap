import { getServerSession } from 'next-auth'
import { User } from '@/components/user'
import { LoginButton, LogoutButton } from '@/components/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/server/authOptions'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if(!session)
    redirect("/")

  return (
    <main className='p-4 bg-neutral-700 h-screen text-white space-y-4'>
      <LoginButton />
      <LogoutButton  />
      <h2>Server Session</h2>
      <pre>{JSON.stringify(session.user.id)}</pre>
      <h2>Client Call</h2>
      <User />
      <div className='bg-amber-200 select-none border rounded-full size-12 p-2 flex items-center justify-center'>
        <div className='text-xl'>
          {(session?.user?.email as string).toString()[0].toUpperCase()}
        </div>
      </div>
      <br />
      <br />
      <Link href={"/profile"}>
        go to profile
      </Link>

      <br />
      <br />
      <Link href={"/chat"}>
        go to chat
      </Link>
    </main>
  )
}