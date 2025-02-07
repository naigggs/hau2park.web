import { createClient } from "@/utils/supabase/server"
import ChatInterface from "@/components/guest/chat-bot/chat-bot-interface"

export default async function GuestChatBotPage() {
  const supabase = await createClient()

  const { data: checkActiveQR, error } = await supabase
    .from("guest_qr_codes")
    .select("*")
    .eq("user_id", "2eb76e8a-7ae0-48f8-8c65-f322f696ce39") // change to actual user id

  if (error) {
    console.error("Error fetching guest qr codes:", error)
    return <div>Error: Unable to verify access</div>
  }

  if (checkActiveQR?.length === 0) {
    return <div>No Access: Please scan a valid QR code to use the chatbot.</div>
  }

  return (
    <div className="container mx-auto p-10">
      <ChatInterface />
    </div>
  )
}

