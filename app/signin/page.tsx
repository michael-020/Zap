import { Suspense } from 'react'
import SignIn from "@/components/signin";

export default function SignInPage() {
  
  return (
    <Suspense fallback={<div>Loading...</div>}> 
      <SignIn />
    </Suspense>
  )
}