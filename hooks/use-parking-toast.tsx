"use client";

import React from "react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/app/context/user-context";

export function useRealtimeParkingSpace() {
  const { firstName, lastName } = useUser();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!firstName || !lastName) return;

    const channel = supabase.channel("parking_user_update");
    const user = `${firstName} ${lastName}`;
    const subscription = channel
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "parking_spaces" },
        async (payload) => {
          if (payload.new.user === `${user}` && payload.new.status === 
            "Occupied"
          ){
            toast({
              title: "Parking Verification",
              description: `Did you park in space ${payload.new.name} at ${payload.new.location}?`,
              duration: Infinity,
              action: (
                <div className="flex space-x-1">
                  <ToastAction
                    altText="Accept"
                    onClick={() => console.log("accept")}
                  >
                    Accept
                  </ToastAction>
                  <ToastAction
                    altText="Decline"
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from("parking_spaces")
                          .update({ user: "None", allocated_at: null })
                          .eq("id", payload.new.id);

                        if (error) throw error;
                      } catch (error) {
                        console.error("Error declining parking space:", error);
                        toast({
                          title: "Error",
                          description: "Failed to decline parking space.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Decline
                  </ToastAction>
                </div>
              ),
            });
          }
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [toast, supabase, firstName, lastName]); // Added firstName and lastName to dependencies
}
