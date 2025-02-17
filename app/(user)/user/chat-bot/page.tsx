import { createClient } from "@/utils/supabase/server"
import ChatInterface from "@/components/guest/chat-bot/chat-bot-interface"
import { headers } from "next/headers"

export default async function UserChatBotPage() {
  const headersList = await headers();
  const userId = headersList.get("user_id"); 

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
          <div className="text-lg font-medium">Loading...</div>
          <div className="text-sm text-gray-500">Waiting for authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-10">
      <ChatInterface />
    </div>
  )
}

