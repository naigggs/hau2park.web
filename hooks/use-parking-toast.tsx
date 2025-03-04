"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/app/context/user-context";

declare global {
  interface Window {
    pendingParkingVerification?: {
      id: string;
      name: string;
      location: string;
    };
  }
}

export function useRealtimeParkingSpace() {
  const { firstName, lastName } = useUser();
  const supabase = createClient();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TTS handler function
  const handleTTS = async (text: string) => {
    try {
      setIsLoading(true);

      // Clean up previous audio and URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const response = await fetch('/api/chat/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to generate speech');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        setAudioUrl(null);
      };

      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup effect for audio
  useEffect(() => {
    const currentAudio = audioRef.current;
    
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Helper function to create action buttons
  const createActionButtons = (parkingDetails: any) => (
    <div className="flex space-x-1 mt-2">
      <ToastAction
        altText="Yes, this is my car"
        className="flex-1 px-3"
        onClick={async () => {
          try {
            const { error } = await supabase
              .from("parking_spaces")
              .update({ 
                verified_by_user: true,
                verified_at: new Date().toISOString(),
                status: "Occupied"
              })
              .eq("id", parkingDetails.id);

            if (error) throw error;

            window.pendingParkingVerification = undefined;

            window.dispatchEvent(new CustomEvent('parkingVerified', {
              detail: {
                parkingSpace: parkingDetails.name,
                location: parkingDetails.location,
                verified: true
              }
            }));

            const confirmMessage = "Thank you for verifying your parking.";
            
            toast({
              title: "Verified",
              description: confirmMessage,
              variant: "default",
            });
          } catch (error) {
            console.error("Error verifying parking:", error);
            toast({
              title: "Error",
              description: "Failed to verify parking. Please try again.",
              variant: "destructive",
            });
          }
        }}
      >
        Yes
      </ToastAction>
      <ToastAction
        altText="No, not my car"
        className="flex-1 px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={async () => {
          try {
            const { error } = await supabase
              .from("parking_spaces")
              .update({
                user: "None",
                verified_by_user: false,
                verified_at: null,
                allocated_at: null,
                status: "Occupied"
              })
              .eq("id", parkingDetails.id);

            if (error) throw error;

            window.pendingParkingVerification = undefined;

            window.dispatchEvent(new CustomEvent('parkingTaken', {
              detail: {
                parkingSpace: parkingDetails.name,
                location: parkingDetails.location
              }
            }));

            const notificationMessage = "We'll help you find another parking space. Admin has been notified about the unauthorized parking.";

            toast({
              title: "Notification Sent",
              description: (
                <div className="max-w-[340px] break-words">
                  {notificationMessage}
                </div>
              ),
              variant: "default",
            });
          } catch (error) {
            console.error("Error updating parking space:", error);
            toast({
              title: "Error",
              description: "Failed to process your response. Please try again.",
              variant: "destructive",
            });
          }
        }}
      >
        No
      </ToastAction>
    </div>
  );

  useEffect(() => {
    if (!firstName || !lastName) return;

    const channel = supabase.channel("parking_user_update");
    const user = `${firstName} ${lastName}`;

    const showParkingVerificationToast = async (parkingDetails: any) => {
      window.pendingParkingVerification = {
        id: parkingDetails.id,
        name: parkingDetails.name,
        location: parkingDetails.location
      };

      const message = `Parking Verification Required: Is the car parked at ${parkingDetails.name} in ${parkingDetails.location} your car?`;
      handleTTS(message); // Only TTS call in the entire component

      toast({
        title: "⚠️ Parking Verification Required",
        description: (
          <div className="max-w-[340px] break-words">
            {`A car has parked in your reserved space ${parkingDetails.name} at ${parkingDetails.location}. Is this your car?`}
          </div>
        ),
        duration: Infinity,
        variant: "destructive",
        action: createActionButtons(parkingDetails),
      });
    };

    const subscription = channel
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "parking_spaces" },
        async (payload) => {
          if (payload.new.user === user && 
              payload.new.status === "Occupied" && 
              !payload.new.verified_by_user) {
            await showParkingVerificationToast(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [toast, supabase, firstName, lastName, isLoading, isPlaying]);
}