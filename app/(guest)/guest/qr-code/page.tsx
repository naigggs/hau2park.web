"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import QRCodeList from "@/components/guest/qr-code-list/qr-code-list";
import { GenerateQRCodeModal } from "@/components/guest/qr-code-list/qr-code-modal-create";
import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles, AlertCircle, Clock, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle as StepOneIcon, 
  ClipboardEdit as StepTwoIcon, 
  QrCode as StepThreeIcon, 
  DoorOpen as StepFourIcon 
} from "lucide-react";
import { useUser } from "@/app/context/user-context";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useGuestQRCodeList } from '@/hooks/use-guest-qr';

interface PendingRequest {
  id: string;
  title: string;
  purpose_of_visit: string;
  created_at: string;
  status: string;
  appointment_date: string;
  parking_start_time: string;
  parking_end_time: string;
}

// Component that uses useSearchParams
function QRCodePageContent() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { userId, firstName } = useUser();
  
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isGettingStartedExpanded, setIsGettingStartedExpanded] = useState(true);
  const [isOpenRequestsExpanded, setIsOpenRequestsExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get QR code data to determine if we should hide the getting started section
  const { guestQRList, loading: loadingQRs } = useGuestQRCodeList();
  
  // Reference to supabase subscription
  const supabaseSubscription = useRef<RealtimeChannel | null>(null);
  
  // Fetch pending QR requests
  const fetchPendingRequests = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('guest_parking_request')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'Open')
        .order('created_at', { ascending: false });
      
      if (!error) {
        setPendingRequests(data || []);
        setLastUpdated(new Date());
        
        // Set default accordion states based on presence of requests
        if ((data || []).length > 0) {
          setIsOpenRequestsExpanded(true); // Show open requests expanded by default
        } else {
          setIsOpenRequestsExpanded(false); // No requests, so collapse
        }

        // If there are QR codes, collapse getting started section
        if (!loadingQRs && guestQRList.length > 0) {
          setIsGettingStartedExpanded(false); // Collapse getting started when there are QR codes
        } else {
          setIsGettingStartedExpanded(true); // Otherwise, expand it
        }
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoadingRequests(false);
      setIsRefreshing(false);
    }
  };
  
  // Set up real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      if (!userId) return;
      
      const supabase = createClient();
      
      // Clean up any existing subscription
      if (supabaseSubscription.current) {
        supabase.removeChannel(supabaseSubscription.current);
      }
      
      // Subscribe to changes on the guest_parking_request table
      const channel = supabase
        .channel('guest-parking-changes')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'guest_parking_request',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            console.log('Change received!', payload);
            fetchPendingRequests();
            
            // Show a toast notification for status changes
            if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old.status) {
              toast({
                title: "Request Updated",
                description: `Your request status changed to: ${payload.new.status}`,
                duration: 5000,
              });
            }
          }
        )
        .subscribe();
        
      supabaseSubscription.current = channel;
      
      // Initial fetch
      fetchPendingRequests();
    };
    
    setupRealtimeSubscription();
    
    // Clean up subscription when component unmounts
    return () => {
      const supabase = createClient();
      if (supabaseSubscription.current) {
        supabase.removeChannel(supabaseSubscription.current);
      }
    };
  }, [userId, guestQRList.length]);
  
  // Show registration success toast when user first lands on this page
  useEffect(() => {
    // Check if user just registered (either via URL param or localStorage)
    const justRegistered = searchParams.get('newRegistration') === 'true' || 
                         localStorage.getItem('guestJustRegistered') === 'true';
    
    if (justRegistered) {
      // Show a welcome/success toast
      setTimeout(() => {
        toast({
          title: "Registration Successful!",
          description: "Welcome to HAU2PARK Guest portal. Submit a parking request to generate a QR code for your visit.",
          className: "bg-green-500 text-white",
          duration: 10000, // 10 seconds so they have time to read
        });
        
        // Clear the flag so it doesn't show again on refresh
        localStorage.removeItem('guestJustRegistered');
      }, 500);
    }
  }, [toast, searchParams]);

  // When QR codes load, collapse getting started if there are QR codes
  useEffect(() => {
    if (!loadingQRs && guestQRList.length > 0) {
      setIsGettingStartedExpanded(false);
    }
  }, [loadingQRs, guestQRList]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time since last update
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };

  // Toggle Getting Started accordion
  const toggleGettingStarted = () => {
    setIsGettingStartedExpanded(!isGettingStartedExpanded);
  };
  
  // Toggle Open Requests accordion
  const toggleOpenRequests = () => {
    setIsOpenRequestsExpanded(!isOpenRequestsExpanded);
  };
  
  // Manual refresh handler
  const handleRefresh = () => {
    fetchPendingRequests();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Guest QR Codes</h1>
        <Button onClick={() => setIsGenerateModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Submit a Parking Request
        </Button>
      </div>
      
      {/* QR Code List - First section */}
      <div className="mb-6">
        <QRCodeList />
      </div>
      
      {/* Open Requests Accordion - Second section */}
      {isLoadingRequests && !isRefreshing ? (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border shadow-sm">
          <CardHeader 
            className="pb-2 cursor-pointer" 
            onClick={toggleOpenRequests}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-gray-600" />
                <CardTitle className="text-lg font-medium">
                  Open Requests
                  {pendingRequests.length > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">({pendingRequests.length})</span>
                  )}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefresh();
                  }}
                  disabled={isRefreshing}
                  className="h-8 w-8 p-0"
                  title="Refresh requests"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
                <div className="text-gray-500 hover:text-gray-700">
                  {isOpenRequestsExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>
            </div>
            <CardDescription className="flex justify-between items-center">
              <span>
                {pendingRequests.length > 0 
                  ? "The following QR code requests are waiting for processing."
                  : "No open parking requests."}
              </span>
              <span className="text-xs text-muted-foreground">
                Last updated: {formatLastUpdated()}
              </span>
            </CardDescription>
          </CardHeader>
          
          <AnimatePresence initial={false}>
            {isOpenRequestsExpanded && pendingRequests.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <motion.div 
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {request.title || "Untitled Request"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {formatDate(request.created_at)}
                            </p>
                            {request.purpose_of_visit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Purpose: {request.purpose_of_visit}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="mt-2 sm:mt-0 bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-300">
                          {request.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
      
      {/* Getting Started Card - Last section */}
      <Card className="mb-8 border-none shadow-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-orange-500/10 rounded-lg pointer-events-none" />
        <CardHeader 
          className="space-y-1 pb-2 cursor-pointer" 
          onClick={toggleGettingStarted}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
              <CardTitle className="text-lg font-medium">Getting Started</CardTitle>
            </div>
            <div className="text-gray-500 hover:text-gray-700">
              {isGettingStartedExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
          <CardDescription>
            Welcome{firstName ? `, ${firstName}` : ''}! Follow these simple steps to use HAU2PARK AI Chatbot to reserve your parking!
          </CardDescription>
        </CardHeader>
        
        <AnimatePresence initial={false}>
          {isGettingStartedExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-lg border border-border/40 bg-card hover:border-blue-500/50 hover:bg-blue-50/10 transition-all group">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-2 shadow-sm">
                      <StepOneIcon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Submit a Request</h3>
                    <p className="text-sm text-muted-foreground">Click "Submit a Parking Request" button</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-lg border border-border/40 bg-card hover:border-blue-500/50 hover:bg-blue-50/10 transition-all group">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center mb-2 shadow-sm">
                      <StepTwoIcon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Fill in Details</h3>
                    <p className="text-sm text-muted-foreground">Provide information about your visit</p>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-lg border border-border/40 bg-card hover:border-blue-500/50 hover:bg-blue-50/10 transition-all group">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-2 shadow-sm">
                      <StepThreeIcon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Access Your QR</h3>
                    <p className="text-sm text-muted-foreground">View and download your QR code</p>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-lg border border-border/40 bg-card hover:border-blue-500/50 hover:bg-blue-50/10 transition-all group">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center mb-2 shadow-sm">
                      <StepFourIcon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">Visit Campus</h3>
                    <p className="text-sm text-muted-foreground">Use QR code to access parking facilities</p>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      <GenerateQRCodeModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

// Main page component with Suspense boundary
export default function QRCodesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <QRCodePageContent />
    </Suspense>
  );
}