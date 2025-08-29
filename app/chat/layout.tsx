"use client"

import type React from "react"
import { useWebContainer } from "@/hooks/useWebContainer"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useAuthStore } from "@/stores/authStore/useAuthStore"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useWebContainer()
  const {data: session} = useSession({ required: true })
  const { setAuthUser } = useAuthStore()
  
  useEffect(() => {
    if(session){
      setAuthUser({
        id: session.user.id,  
        email: session.user.email
      })
    }
  }, [session, setAuthUser])

  return <>{children}</>
}
