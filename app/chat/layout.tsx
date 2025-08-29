"use client"

import type React from "react"
import { useWebContainer } from "@/hooks/useWebContainer"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useWebContainer()

  return <>{children}</>
}
