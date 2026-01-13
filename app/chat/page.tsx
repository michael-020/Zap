"use client";

import { ProjectInitializer } from "@/components/project-initializer";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ChatPage() {
  const { data: session, update, status } = useSession();
  const searchParams = useSearchParams();
  const hasUpdated = useRef(false);
  const router = useRouter()

  useEffect(() => {
    if (hasUpdated.current) return;

    if (status !== "authenticated") return;

    if (searchParams.get("paid") === "true") {
      hasUpdated.current = true;

      console.log("updating session");

      update({
        user: {
          ...session!.user,
        },
      });

      setTimeout(() => {
        router.replace("/chat")
      }, 2000)
    }
  }, [status, searchParams, session, update, router]);

  return <ProjectInitializer />;
}
