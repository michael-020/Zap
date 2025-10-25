import { Suspense } from 'react'
import SignIn from "@/components/signin";

// No "use client" here. This is now a Server Component.
export default function SignInPage() {
  
  // This page doesn't need searchParams. 
  // The <SignIn /> component will get them itself using the useSearchParams hook.
  
  return (
    <Suspense fallback={<div>Loading...</div>}> 
      {/* You can put a real skeleton/spinner component in fallback */}
      <SignIn />
    </Suspense>
  )
}