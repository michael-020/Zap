import { Suspense } from 'react'
import SignIn from "@/components/signin";
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  
  return (
    <Suspense 
      fallback={<div className='w-screen h-screen flex items-center justify-center'>
        <Loader2 className='text-neutral-950 dark:text-neutral-100 size-12 animate-spin' />
      </div>}> 
      <SignIn />
    </Suspense>
  )
}