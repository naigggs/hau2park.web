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

// Expanded list of suggestion options
const ALL_SUGGESTIONS = [
  // Availability commands
  "Is there any available parking?",
  "Show me available parking spaces",
  "Check parking availability",
  "Are there any free spaces at SJH?",
  // Parking locations
  "What parking locations are available?",
  "Show parking spaces in APS",
  "Where can I park?",
  // Reservation commands
  "How do I reserve parking?",
  "Reserve a parking space",
  "I want to park in P1",
  // Parking status
  "Where is my parked car?",
  "What's my parking status?",
  "Show me my current parking",
  // Navigation
  "How do I get to P1?",
  "Directions to my parking space",
  "Show route from Main Entrance to P2",
  // Information
  "What are the parking rules?",
  "Tell me about HAU2Park",
  "Who created this system?",
];

export default function ChatPage() {
  const { userId, firstName, lastName } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [awaitingParkingConfirmation, setAwaitingParkingConfirmation] = useState<string | null>(null);
  const [entranceConfirmation, setEntranceConfirmation] = useState<boolean | null>(false);
  const [availableParkingSpaces, setAvailableParkingSpaces] = useState<string[]>([]);

  // Randomly select 3 suggestions on component mount
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    // Shuffle and take 3 random suggestions
    const getRandomSuggestions = () => {
      const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };
    
    setSuggestions(getRandomSuggestions());
  }, []);

  // Helper function to extract parking space name with typo tolerance
  const extractParkingSpace = (text: string): string | null => {
    // Handle various formats: p1, P1, p 1, P 1, p-1, P-1, etc.
    const parkingRegex = /p[\s-]*(\d+)/i;
    const match = text.match(parkingRegex);
    if (match && match[1]) {
      return `P${match[1]}`;
    }
    return null;
  };

  // Helper function to detect entrance names with typo tolerance
  const detectEntrance = (text: string): 'Main' | 'Side' | null => {

    const lowercaseText = text.toLowerCase();
    
    // Main entrance variations
    if (
      lowercaseText.includes('main') || 
      lowercaseText.includes('mian') || 
      lowercaseText.includes('man') ||
      lowercaseText.includes('mein') ||
      lowercaseText.includes('front')
    ) {
      return 'Main';
    }
    
    // Side entrance variations
    if (
      lowercaseText.includes('side') || 
      lowercaseText.includes('sied') || 
      lowercaseText.includes('sid') || 
      lowercaseText.includes('back')
    ) {
      return 'Side';
    }
    
    return null;
  };

  // Helper function to detect route requests
  const isRouteRequest = (text: string): boolean => {
    const lowercaseText = text.toLowerCase();
    return (
      (lowercaseText.includes('route') || 
       lowercaseText.includes('direction') || 
       lowercaseText.includes('how to get') ||
       lowercaseText.includes('path') ||
       lowercaseText.includes('way to') ||
       lowercaseText.includes('map')) &&
      (lowercaseText.includes('from') || lowercaseText.includes('to'))
    );
  };

  // Create message function with improved map detection
  const createMessage = useCallback((response: string, isAi = false) => {
    const context = ChatContextManager.getContext();
    
    // Detect if this is a route-related response
    const isRouteMessage = isAi && (
      // Normal flow with context values set
      (context.selectedParking && 
       context.entrance && 
       response.includes(`Here's the route to ${context.selectedParking} from ${context.entrance} Entrance`)) ||
      // Direct route request detection for any route/directions response
      (response.toLowerCase().includes('route') && 
       (response.toLowerCase().includes('from main entrance') || 
        response.toLowerCase().includes('from side entrance')))
    );
    
    // Add 5-minute warning if this is a route message and it doesn't already have it
    if (isRouteMessage && !response.includes("5 minutes")) {
      response = `${response}. Remember, you have 5 minutes to arrive and park in your reserved space, or your reservation will expire. After parking, you'll need to verify your parking when prompted.`;
    }

    // Determine if we should show a map
    const showMap = isAi && isRouteMessage;

    // Get entrance for map if not in context
    let mapEntrance = context.entrance;
    if (!mapEntrance && showMap) {
      // Try to extract entrance from response text
      if (response.toLowerCase().includes('from main entrance')) {
        mapEntrance = 'Main';
      } else if (response.toLowerCase().includes('from side entrance')) {
        mapEntrance = 'Side';
      }
    }

    // Extract parking space from response if not in context (for direct requests)
    let parkingSpace = context.selectedParking;
    if (!parkingSpace && showMap) {
      const parkingMatch = extractParkingSpace(response);
      if (parkingMatch) {
        parkingSpace = parkingMatch;
      }
    }

    const message: Message = {
      id: `${Date.now()}-${isAi ? 'ai' : 'user'}`,
      content: response,
      role: isAi ? "assistant" : "user",
      experimental_attachments: showMap ? [
        {
          name: "map",
          contentType: "application/json",
          url: "data:application/json,{}", // Minimal valid data URL
          mapData: {
            origin: ENTRANCES[mapEntrance || 'Main'],
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
        `Your reserved parking at ${event.detail.parkingSpace} (${event.detail.location}) was taken by an unauthorized vehicle. Admin has been notified. You could find another parking space by asking "Is there any available parking?"`,
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
        `Thank you for verifying your parking at ${event.detail.parkingSpace}. Your car is now properly registered as parked. Thank you for using HAU2Park!`,
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
      // CRITICAL: Command detection logic that exactly matches server-side implementation
      const isCommandRequest = (text: string) => {
        if (!text) return false;
        
        // Convert to lowercase and trim
        const lowerText = text.toLowerCase().trim();
        
        // Direct command-related terms
        if (
          lowerText === "commands" ||
          lowerText === "command" ||
          lowerText === "command list" ||
          lowerText === "available commands" ||
          lowerText === "show commands" ||
          lowerText === "list commands" ||
          lowerText === "help" ||
          lowerText === "menu" ||
          lowerText === "what commands are available" ||
          lowerText === "what are the commands" ||
          lowerText === "show me the commands" ||
          lowerText === "available command"
        ) {
          return true;
        }
        
        // Contains command-related terms
        if (
          lowerText.includes("command") ||
          lowerText.includes("commands") ||
          lowerText.includes("help me") ||
          (lowerText.includes("what") && lowerText.includes("do")) ||
          (lowerText.includes("what") && lowerText.includes("commands")) ||
          (lowerText.includes("show") && lowerText.includes("commands")) ||
          (lowerText.includes("list") && lowerText.includes("commands")) ||
          (lowerText.includes("available") && lowerText.includes("commands")) ||
          lowerText.includes("what can you do") ||
          lowerText.includes("what can i do") ||
          lowerText.includes("what can i ask") ||
          lowerText.includes("how to use") ||
          lowerText.includes("instructions") ||
          lowerText.includes("instruction") ||
          lowerText.includes("capabilities") ||
          lowerText.includes("capability") ||
          lowerText.includes("functions") ||
          lowerText.includes("function")
        ) {
          return true;
        }
        
        return false;
      };
  
      // CRITICAL: Reset context for command requests
      if (isCommandRequest(prompt)) {
        // Clear all navigation context when user asks for commands
        ChatContextManager.updateContext({
          selectedParking: "",
          entrance: undefined,
          lastParkingQuery: ""
        });
        console.log("Command request detected, context reset");
      }
      
      const context = ChatContextManager.getContext();
      setConversationHistory(prev => [...prev, prompt]);
      
      // Check for direct route requests first      
      if (isRouteRequest(prompt)) {
        const parkingSpace = extractParkingSpace(prompt);
        const entrance = detectEntrance(prompt);
        
        if (parkingSpace && entrance) {
          // Update context for direct route requests
          ChatContextManager.updateContext({
            selectedParking: parkingSpace,
            entrance: entrance
          });
          
          // Return a formatted route response
          return `Here's the route to ${parkingSpace} from ${entrance} Entrance. Remember, you have 5 minutes to arrive and park in your reserved space, or your reservation will expire. After parking, you'll need to verify your parking when prompted.`;
        }
      }

      // Check for parking space selection with typo tolerance
      if (prompt.toLowerCase().includes("park") || 
          prompt.toLowerCase().includes("want") || 
          prompt.toLowerCase().includes("reserve")) {
        
        const parkingSpace = extractParkingSpace(prompt);
        if (parkingSpace) {
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
        // Expanded acceptance of confirmation with typo tolerance
        if (response.includes('yes') || 
            response.includes('yeah') || 
            response.includes('sure') || 
            response.includes('yep') || 
            response.includes('correct') ||
            response.includes('ok') ||
            response.includes('okay')) {
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
          if (roleData?.role === "Guest") {
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
          
          setEntranceConfirmation(true);
          return "Which entrance are you coming from? (Main Entrance or Side Entrance)?"; 
        } else if (
          response.includes('no') || 
          response.includes('nope') || 
          response.includes('cancel') || 
          response.includes('dont') || 
          response.includes("don't")
        ) {
          setAwaitingParkingConfirmation(null);
          return "What would you like to do instead?";
        }
      }

      // Check for entrance selection with typo tolerance
      const entrance = detectEntrance(prompt);
      if (entrance && context.selectedParking) {
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
      
      // Handle direct route requests from AI responses
      if (isRouteRequest(prompt) && aiResponse.toLowerCase().includes('route')) {
        const parkingSpace = extractParkingSpace(aiResponse) || extractParkingSpace(prompt);
        const entrance = detectEntrance(aiResponse) || detectEntrance(prompt);
        
        if (parkingSpace && entrance) {
          ChatContextManager.updateContext({
            selectedParking: parkingSpace,
            entrance: entrance
          });
        }
      }
      
      // Check if this is a parking availability response
      const isAvailabilityResponse = 
        aiResponse.toLowerCase().includes("available") && 
        (aiResponse.toLowerCase().includes("parking") || aiResponse.toLowerCase().includes("space"));

      if (isAvailabilityResponse) {
        const spaces = extractAvailableParkingSpaces(aiResponse);
        if (spaces.length > 0) {
          setAvailableParkingSpaces(spaces);
        }
      } else if (!awaitingParkingConfirmation) {
        // Reset available spaces if not a parking response
        setAvailableParkingSpaces([]);
      }

      return aiResponse;
    } finally {
      setIsGenerating(false);
    }
  }, [conversationHistory, awaitingParkingConfirmation, userId, firstName, lastName, extractParkingSpace, detectEntrance, isRouteRequest]);

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

  const handleCommandClick = useCallback((command: string) => {
    const userMessage = createMessage(command);
    setMessages((prev) => [...prev, userMessage]);

    handleMessage(command).then(aiResponse => {
      const aiMessage = createMessage(aiResponse, true);
      setMessages((prev) => [...prev, aiMessage]);
    });
  }, [createMessage, handleMessage]);

  return (
    <div className="flex h-[calc(90vh-60px)] w-full">
      <Chat
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isGenerating}
        append={append}
        suggestions={[]}
        onVoiceInput={handleVoiceInput}
        onCommandClick={handleCommandClick}
        availableParkingSpaces={availableParkingSpaces}
        awaitingConfirmation={awaitingParkingConfirmation}
        entranceConfirmation={entranceConfirmation}
      />
    </div>
  );
}

// Helper function to extract available parking spaces from AI response
const extractAvailableParkingSpaces = (text: string): string[] => {
  const parkingSpaces: string[] = [];
  const regex = /P\d+/g;
  const matches = text.match(regex);
  
  if (matches) {
    const uniqueSpaces = [...new Set(matches)];
    return uniqueSpaces.filter((space: string) => {
      const contextBefore = text.substring(Math.max(0, text.indexOf(space) - 50), text.indexOf(space));
      const isAvailable = 
        !contextBefore.toLowerCase().includes("not available") &&
        !contextBefore.toLowerCase().includes("unavailable") &&
        !contextBefore.toLowerCase().includes("reserved") &&
        !contextBefore.toLowerCase().includes("occupied");
      return isAvailable;
    });
  }
  return parkingSpaces;
};