"use client";

import { useState, useCallback, useEffect } from "react";
import { Chat } from "@/components/ui/chat";
import type { Message } from "@/components/ui/chat-message";
import { ChatContextManager } from "@/utils/supabase/chat-context";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/app/context/user-context";

// Define custom event types
interface ParkingTakenEvent extends CustomEvent {
  detail: {
    parkingSpace: string;
    location: string;
  };
}

interface ParkingVerifiedEvent extends CustomEvent {
  detail: {
    parkingSpace: string;
    location: string;
    verified: boolean;
  };
}

const ENTRANCES = {
  Main: { lat: 15.133697555616646, lng: 120.59028871717273 },
  Side: { lat: 15.133148647059924, lng: 120.5914340202961 },
};

const PARKING_DESTINATION = { lat: 15.132573845065755, lng: 120.58929898215513 };

const suggestions = [
  "Is there any available parking?",
  "Where is my parked car?",
  "What's the status of parking space P1?",
];

export default function ChatPage() {
  const { userId, firstName, lastName } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [awaitingParkingConfirmation, setAwaitingParkingConfirmation] = useState<string | null>(null);

  // Move createMessage before it's used in useEffect
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

  useEffect(() => {
    const handleParkingTaken = (event: ParkingTakenEvent) => {
      const message = createMessage(
        `Your reserved parking at ${event.detail.parkingSpace} (${event.detail.location}) was taken by an unauthorized vehicle. Admin has been notified. Would you like me to help you find another available parking space?`,
        true
      );
      setMessages((prev) => [...prev, message]);
      
      // Use empty strings instead of null
      ChatContextManager.updateContext({
        selectedParking: "",
        lastParkingQuery: ""
      });
    };

    const handleParkingVerified = (event: ParkingVerifiedEvent) => {
      const message = createMessage(
        `Thank you for verifying your parking at ${event.detail.parkingSpace}. Your car is now properly registered as parked. Is there anything else you need help with?`,
        true
      );
      setMessages((prev) => [...prev, message]);
    };

    window.addEventListener('parkingTaken', handleParkingTaken as EventListener);
    window.addEventListener('parkingVerified', handleParkingVerified as EventListener);

    return () => {
      window.removeEventListener('parkingTaken', handleParkingTaken as EventListener);
      window.removeEventListener('parkingVerified', handleParkingVerified as EventListener);
    };
  }, [createMessage]);

  const handleMessage = useCallback(async (prompt: string) => {
    setIsGenerating(true);

    try {
      const context = ChatContextManager.getContext();
      setConversationHistory(prev => [...prev, prompt]);

      // Check for parking space selection first
      if (prompt.toLowerCase().includes("park in") || prompt.toLowerCase().includes("i want to park in")) {
        const parkingSpaceMatch = prompt.toLowerCase().match(/park in (p\d+)/i);
        if (parkingSpaceMatch) {
          const parkingSpace = parkingSpaceMatch[1].toUpperCase();
          
          if (!userId) {
            return 'You must be logged in to reserve a parking space.';
          }

          // Check the current status of the parking space
          const supabase = createClient();
          const { data: parkingData, error: fetchError } = await supabase
            .from("parking_spaces")
            .select("status")
            .eq("name", parkingSpace)
            .single();

          if (fetchError) {
            console.error('Error fetching parking space:', fetchError);
            return 'Sorry, there was an error checking the parking space. Please try again.';
          }

          if (!parkingData) {
            return `Parking space ${parkingSpace} does not exist.`;
          }

          if (parkingData.status !== "Open") {
            return `Parking space ${parkingSpace} is already ${parkingData.status.toLowerCase()}. Please choose another parking space.`;
          }

          setAwaitingParkingConfirmation(parkingSpace);
          return `Are you sure you want to park in ${parkingSpace}?`;
        }
      }

      if (awaitingParkingConfirmation) {
        const response = prompt.toLowerCase();
        if (response.includes('yes') || response.includes('yeah') || response.includes('sure')) {
          const supabase = createClient();

          // First check if user is a guest by querying user_roles
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .single();

          if (roleError) {
            setAwaitingParkingConfirmation(null);
            console.error('Error checking user role:', roleError);
            return 'Sorry, there was an error verifying your account type. Please try again.';
          }

          // If user is a guest, get their latest parking request
          if (roleData.role === "Guest") {
            const { data: parkingRequest, error: requestError } = await supabase
              .from("guest_parking_request")
              .select("*")
              .eq("user_id", userId)
              .eq("status", "Approved")
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (requestError) {
              setAwaitingParkingConfirmation(null);
              console.error('Error fetching parking request:', requestError);
              return 'Sorry, there was an error fetching your parking request. Please ensure you have an approved parking request.';
            }

            if (!parkingRequest) {
              setAwaitingParkingConfirmation(null);
              return 'You need an approved parking request before you can park. Please submit a parking request first.';
            }

            // Check if trying to park outside of approved time window
            const currentTime = new Date();
            const parkingStartTime = new Date(parkingRequest.parking_start_time);
            const parkingEndTime = new Date(parkingRequest.parking_end_time);

            if (currentTime < parkingStartTime || currentTime > parkingEndTime) {
              setAwaitingParkingConfirmation(null);
              return `You can only park during your approved time window: ${parkingRequest.parking_start_time} to ${parkingRequest.parking_end_time}`;
            }

            // If within time window, proceed with parking space status check
            const { data: parkingData, error: parkingError } = await supabase
              .from("parking_spaces")
              .select("status")
              .eq("name", awaitingParkingConfirmation)
              .single();

            if (parkingError) {
              setAwaitingParkingConfirmation(null);
              console.error('Error fetching parking space:', parkingError);
              return 'Sorry, there was an error checking the parking space. Please try again.';
            }

            if (!parkingData || parkingData.status !== "Open") {
              setAwaitingParkingConfirmation(null);
              return `Sorry, parking space ${awaitingParkingConfirmation} is no longer available. Please choose another parking space.`;
            }

            // Update parking space with guest end time
            const { error: updateError } = await supabase
              .from("parking_spaces")
              .update({
                status: "Reserved",
                user: `${firstName} ${lastName}`,
                updated_at: new Date().toISOString(),
                parking_end_time: parkingRequest.parking_end_time
              })
              .eq("name", awaitingParkingConfirmation);

            if (updateError) {
              setAwaitingParkingConfirmation(null);
              console.error('Error updating parking space:', updateError);
              return 'Sorry, there was an error reserving the parking space. Please try again.';
            }
          } else {
            // Regular user flow - just check parking space availability
            const { data: parkingData, error: fetchError } = await supabase
              .from("parking_spaces")
              .select("status")
              .eq("name", awaitingParkingConfirmation)
              .single();

            if (fetchError) {
              setAwaitingParkingConfirmation(null);
              console.error('Error fetching parking space:', fetchError);
              return 'Sorry, there was an error checking the parking space. Please try again.';
            }

            if (!parkingData || parkingData.status !== "Open") {
              setAwaitingParkingConfirmation(null);
              return `Sorry, parking space ${awaitingParkingConfirmation} is no longer available. Please choose another parking space.`;
            }

            const { error: updateError } = await supabase
              .from("parking_spaces")
              .update({
                status: "Reserved",
                user: `${firstName} ${lastName}`,
                updated_at: new Date().toISOString()
              })
              .eq("name", awaitingParkingConfirmation);

            if (updateError) {
              setAwaitingParkingConfirmation(null);
              console.error('Error updating parking space:', updateError);
              return 'Sorry, there was an error reserving the parking space. Please try again.';
            }
          }

          const confirmedParking = awaitingParkingConfirmation;
          setAwaitingParkingConfirmation(null);
          
          ChatContextManager.updateContext({
            selectedParking: confirmedParking,
            lastParkingQuery: prompt,
          });
          
          return "What entrance are you coming from? (Main Entrance or Side Entrance)?";
        } else if (response.includes('no')) {
          setAwaitingParkingConfirmation(null);
          return "What would you like to do instead?";
        }
      }

      // Check for entrance selection
      const entranceMatch = prompt.toLowerCase().match(/(main|side) entrance/i);
      if (entranceMatch && context.selectedParking) {
        const entrance = entranceMatch[1].charAt(0).toUpperCase() + entranceMatch[1].slice(1) as 'Main' | 'Side';
        ChatContextManager.updateContext({ entrance });
        return `Here's the route to ${context.selectedParking} from ${entrance} Entrance`;
      }

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
  }, [conversationHistory, awaitingParkingConfirmation, userId, firstName, lastName]);

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

  const handleVoiceInput = useCallback(
    (text: string) => {
      setInput(text);
      setTimeout(() => {
        handleSubmit();
      }, 100);
    },
    [handleSubmit]
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
    <div className="flex h-[calc(90vh-60px)] w-full">
      <Chat
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isGenerating}
        append={append}
        suggestions={suggestions}
        onVoiceInput={handleVoiceInput}
      />
    </div>
  );
}