"use client";

import { useState, useCallback } from "react";
import { Chat } from "@/components/ui/chat";
import type { Message } from "@/components/ui/chat-message";

const suggestions = [
  "Is there any available parking?",
  "Where is my parked car?",
  "What's the status of parking space A1?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleMessage = useCallback(async (prompt: string) => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const { response: aiResponse } = await response.json();
      return aiResponse;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      if (!input.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        role: "user",
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const aiResponse = await handleMessage(input);

      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        content: aiResponse,
        role: "assistant",
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    [input, handleMessage]
  );

  const append = useCallback(
    async (message: { role: "user"; content: string }) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message.content,
        role: "user",
      };
      setMessages((prev) => [...prev, userMessage]);

      const aiResponse = await handleMessage(message.content);

      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        content: aiResponse,
        role: "assistant",
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    [handleMessage]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  return (
    <div className="flex h-[calc(100vh-120px)] w-full">
      <Chat
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isGenerating}
        append={append}
        suggestions={suggestions}
      />
    </div>
  );
}
