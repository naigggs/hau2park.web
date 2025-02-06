"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send } from "lucide-react"

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { text: "Welcome to HAU2PARK! How can I assist you with your parking needs today?", isBot: true },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isBot: false }])
      setInput("")
      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your inquiry. I'm processing your request and will provide you with the most relevant parking information shortly.",
            isBot: true,
          },
        ])
      }, 1000)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-14 h-14 p-0 shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
      {isOpen && (
        <Card className="w-96 shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle>HAU2PARK Assistant</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-primary-foreground"
            >
              <span className="sr-only">Close</span>
              &times;
            </Button>
          </CardHeader>
          <CardContent className="h-80 overflow-y-auto space-y-4 p-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${message.isBot ? "bg-muted" : "bg-primary text-primary-foreground"}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

