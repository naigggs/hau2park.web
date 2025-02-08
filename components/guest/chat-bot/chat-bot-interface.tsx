"use client";

import { useState, useCallback } from "react";
import { Chat } from "@/components/ui/chat";
import type { Message } from "@/components/ui/chat-message";
import { ChatContextManager } from "@/utils/supabase/chat-context";

const ENTRANCES = {
  Main: { lat: 15.133697555616646, lng: 120.59028871717273 },
  Side: { lat: 15.133148647059924, lng: 120.5914340202961 },
};

const PARKING_DESTINATION = { lat: 15.132573845065755, lng: 120.58929898215513 };

const suggestions = [
  "Is there any available parking?",
  "Where is my parked car?",
  "What's the status of parking space A1?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  const handleMessage = useCallback(async (prompt: string) => {
    setIsGenerating(true);

    try {
      const context = ChatContextManager.getContext();
      setConversationHistory(prev => [...prev, prompt]);

      // Check for parking space selection
      if (prompt.toLowerCase().includes("park in")) {
        const parkingSpace = prompt.match(/park in (P\d+)/i)?.[1];
        if (parkingSpace) {
          // First, check availability through the API
          const availabilityResponse = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              prompt: `Check availability of ${parkingSpace}`,
              context: { checkAvailability: true }
            }),
          });

          if (!availabilityResponse.ok) {
            throw new Error("Failed to check parking availability");
          }

          const { response: availabilityStatus } = await availabilityResponse.json();
          const isOccupied = availabilityStatus.toLowerCase().includes("occupied");

          if (isOccupied) {
            return `${parkingSpace} is currently occupied. Please choose another parking space.`;
          }

          // If not occupied, update context and ask for entrance
          ChatContextManager.updateContext({
            selectedParking: parkingSpace,
            lastParkingQuery: prompt,
          });
          return "What entrance are you coming from? (Main Entrance or Side Entrance)";
        }
      }

      // Check for entrance selection
      const entranceMatch = prompt.toLowerCase().match(/(main|side) entrance/i);
      if (entranceMatch && context.selectedParking) {
        const entrance = entranceMatch[1].charAt(0).toUpperCase() + entranceMatch[1].slice(1) as 'Main' | 'Side';
        ChatContextManager.updateContext({ entrance });
        return `Here's the route to ${context.selectedParking} from ${entrance} Entrance`;
      }

      // Make API call with updated context and conversation history
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          context: ChatContextManager.getContext(),
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const { response: aiResponse } = await response.json();
      return aiResponse;
    } finally {
      setIsGenerating(false);
    }
  }, [conversationHistory]);

  const createMessage = useCallback((response: string, isAi = false) => {
    const context = ChatContextManager.getContext();
    const showMap = context.selectedParking && 
                   context.entrance && 
                   response.includes(`Here's the route to ${context.selectedParking} from ${context.entrance} Entrance`);

    const message: Message = {
      id: `${Date.now()}-${isAi ? 'ai' : 'user'}`,
      content: response,
      role: isAi ? "assistant" : "user",
      experimental_attachments: showMap && isAi ? [
        {
          name: "map",
          contentType: "application/json",
          url: "data:application/json,{}", // Minimal valid data URL
          mapData: {
            origin: ENTRANCES[context.entrance!],
            destination: PARKING_DESTINATION,
          }
        }
      ] : undefined
    };

    return message;
  }, []);

  const handleSubmit = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      if (!input.trim()) return;

      const userMessage = createMessage(input);
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const aiResponse = await handleMessage(input);
      const aiMessage = createMessage(aiResponse, true);
      setMessages((prev) => [...prev, aiMessage]);
    },
    [input, handleMessage, createMessage]
  );

  const append = useCallback(
    async (message: { role: "user"; content: string }) => {
      const userMessage = createMessage(message.content);
      setMessages((prev) => [...prev, userMessage]);

      const aiResponse = await handleMessage(message.content);
      const aiMessage = createMessage(aiResponse, true);
      setMessages((prev) => [...prev, aiMessage]);
    },
    [handleMessage, createMessage]
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