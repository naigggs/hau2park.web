import { createClient } from "@/utils/supabase/server"
import ChatInterface from "@/components/guest/chat-bot/chat-bot-interface"
import { headers } from "next/headers"

export default async function GuestChatBotPage() {
  const headersList = await headers();
  const userId = headersList.get("user_id"); // note: using kebab-case header name

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

  const supabase = await createClient()

  const { data: checkActiveQR, error } = await supabase
    .from("guest_qr_codes")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "Open")
    .single()

  if (error) {
    console.error("Error fetching guest qr codes:", error)
    return <div>Error: Unable to verify access</div>
  }

  if (!checkActiveQR) {
    return <div>No Access: Please scan a valid QR code to use the chatbot.</div>
  }

  return (
    <div className="container mx-auto p-10">
      <ChatInterface />
    </div>
  )
}

