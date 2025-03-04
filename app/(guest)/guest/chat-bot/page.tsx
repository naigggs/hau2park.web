import { createClient } from "@/utils/supabase/server";
import ChatInterface from "@/components/guest/chat-bot/chat-bot-interface";
import { headers } from "next/headers";

export default async function GuestChatBotPage() {
  const headersList = await headers();
  const userId = headersList.get("user_id"); // note: using kebab-case header name

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
          <div className="text-lg font-medium">Loading...</div>
          <div className="text-sm text-gray-500">
            Waiting for authentication...
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: checkActiveQR, error } = await supabase
    .from("guest_qr_codes")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "Open")
    .eq("is_used", true)
    .single();

  if (error) {
    return (
      <div className="flex items-center justify-center my-10">
        <div className="max-w-md w-full bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden shadow-lg">
          {/* Ticket Header */}
          <div className="bg-red-600 text-white py-3 relative">
            <h2 className="text-center font-bold text-xl">NO ACCESS NOTICE</h2>
            <p className="text-center text-xs opacity-75">HAU2PARK SYSTEM</p>
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            <div className="border-b-2 border-dashed border-gray-200 pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  TICKET #:
                </span>
                <span className="font-mono font-medium">
                  {new Date().getTime().toString().slice(-6)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">DATE:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">TIME:</span>
                <span className="font-medium">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-md font-bold mb-2">
                ACCESS DENIED
              </div>
              <p className="text-gray-700">
                Please scan a valid QR code to use the chatbot.
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-500 mt-4">
              <p className="text-center italic">
                This is a system-generated notice.
              </p>
              <p className="text-center font-bold mt-1">
                Please contact support if you believe this is an error.
              </p>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-red-600 py-2 px-4 flex justify-center relative">
            <p className="text-white text-xs opacity-75">
              HAU2PARK © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-10">
      <ChatInterface />
    </div>
  );
}
