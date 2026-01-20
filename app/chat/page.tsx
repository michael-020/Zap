import ChatPageClient from "@/components/chatpage-client";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageClient />
    </Suspense>
  );
}
