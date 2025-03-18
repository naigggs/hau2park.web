"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PendingApproval {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  vehicle_plate_number: string;
  status: string;
  created_at: string;
  id_link: string | null; // Added id_link field
  phone: number | null;
}

interface UsePendingApprovalsState {
  approvals: PendingApproval[];
  loading: boolean;
  error: string | null;
}

export function usePendingApprovals() {
  const supabase = createClient();
  const [data, setData] = useState<UsePendingApprovalsState>({
    approvals: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let approvalChannel: RealtimeChannel;

    const fetchPendingApprovals = async () => {
      setData((prev) => ({ ...prev, loading: true }));

      try {
        const { data: signups, error: signupsError } = await supabase
          .from("account_sign_up")
          .select("*")
          .order("created_at", { ascending: false });

        if (signupsError) throw signupsError;

        setData({ 
          approvals: signups || [], 
          loading: false, 
          error: null 
        });

        // Set up realtime subscription
        approvalChannel = supabase
          .channel('approval_changes')
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'account_sign_up' 
            }, 
            (payload) => {
              if (payload.new.status === "pending") {
                setData(prev => ({
                  ...prev,
                  approvals: [payload.new as PendingApproval, ...prev.approvals]
                }));
              }
            }
          )
          .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'account_sign_up'
            },
            (payload) => {
              if (payload.new.status === "pending") {
                // Add to list if status changed to pending
                setData(prev => ({
                  ...prev,
                  approvals: [payload.new as PendingApproval, ...prev.approvals]
                }));
              } else {
                // Remove from list if status changed from pending
                setData(prev => ({
                  ...prev,
                  approvals: prev.approvals.filter(
                    approval => approval.id !== payload.old.id
                  )
                }));
              }
            }
          )
          .on('postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'account_sign_up'
            },
            (payload) => {
              setData(prev => ({
                ...prev,
                approvals: prev.approvals.filter(
                  approval => approval.id !== payload.old.id
                )
              }));
            }
          )
          .subscribe();

      } catch (error: any) {
        setData({ 
          approvals: [], 
          loading: false, 
          error: error.message 
        });
      }
    };

    fetchPendingApprovals();

    // Cleanup subscription when component unmounts
    return () => {
      if (approvalChannel) {
        approvalChannel.unsubscribe();
      }
    };
  }, []);

  return data;
}