import ChatbotMapsRoute from '../components/ChatbotMapsRoute'

export default function TryPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Chatbot Maps Route</h1>
        <ChatbotMapsRoute apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} />
      </div>
    </div>
  )
}

