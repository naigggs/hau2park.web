"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import QRCodeList from "@/components/guest/qr-code-list/qr-code-list";
import { GenerateQRCodeModal } from "@/components/guest/qr-code-list/qr-code-modal-create";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Sparkles, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Info, 
  HelpCircle,
  Trash2,
  Loader2
} from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

// Step card component for better organization
interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [isDeletingRequest, setIsDeletingRequest] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Get QR code data to determine if we should hide the getting started section
  const { guestQRList, loading: loadingQRs, canCreateRequest, refresh: refreshQRCodes } = useGuestQRCodeList();
  
  // Check if there are any pending requests
  const hasPendingRequests = pendingRequests.length > 0;
  
  // Determine if submit button should be disabled
  const isSubmitDisabled = hasPendingRequests || !canCreateRequest;
  
  // Reference to supabase subscription
  const supabaseSubscription = useRef<RealtimeChannel | null>(null);
  
  // Check if device is mobile (client-side only)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update lastUpdated time on client-side only to avoid hydration issues
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);
  
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
        setLastUpdated(new Date().toLocaleTimeString());
        
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
  
  // Delete a pending request
  const deleteRequest = async () => {
    if (!userId || !requestToDelete) return;
    
    setIsDeletingRequest(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('guest_parking_request')
        .delete()
        .eq('id', requestToDelete)
        .eq('user_id', userId); // Add user_id check for security
      
      if (error) throw error;
      
      // Update the UI
      setPendingRequests((prev) => prev.filter(req => req.id !== requestToDelete));
      
      toast({
        title: "Request deleted",
        description: "Your parking request has been deleted successfully.",
      });
      
      // Also refresh the QR codes list to update canCreateRequest status
      if (refreshQRCodes) {
        await refreshQRCodes();
      }
      
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: "Failed to delete the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingRequest(false);
      setRequestToDelete(null);
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

  // Format date to readable format - client-side only
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
  
  // Get tooltip message based on current state
  const getTooltipMessage = () => {
    if (hasPendingRequests) {
      return "You already have a pending request. Please wait for it to be processed before submitting a new one.";
    } else if (!canCreateRequest) {
      return "You already have an active QR code. Please use, delete it, or wait for it to expire before requesting a new one.";
    }
    return "";
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Guest QR Codes</h1>
        
        {/* Desktop tooltip */}
        <div className="hidden md:block">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    onClick={() => setIsGenerateModalOpen(true)} 
                    disabled={isSubmitDisabled}
                    size="default"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Submit a Parking Request
                  </Button>
                </div>
              </TooltipTrigger>
              {isSubmitDisabled && (
                <TooltipContent side="left" align="center" className="max-w-[250px] p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{getTooltipMessage()}</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Mobile Sheet */}
        <div className="md:hidden">
          {isSubmitDisabled ? (
            <Sheet>
              <SheetTrigger asChild>
                <div className="flex items-center">
                  <Button 
                    disabled={true}
                    className="mr-1"
                    size="sm"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Request
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                  >
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                  </Button>
                </div>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-xl">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Request Unavailable
                  </SheetTitle>
                </SheetHeader>
                
                <div className="py-4 space-y-4">
                  {hasPendingRequests ? (
                    <>
                      <div className="text-sm">
                        You already have a pending request. Please wait for it to be processed before submitting a new one.
                      </div>
                      <div className="text-sm text-muted-foreground">
                        You can check the status of your request in the "Open Requests" section.
                      </div>
                    </>
                  ) : !canCreateRequest ? (
                    <>
                      <div className="text-sm">
                      You already have an active QR code. Please use, delete it, or wait for it to expire before requesting a new one.
                      </div>
                      <div className="text-sm text-muted-foreground">
                        You can find your active QR code in the "Active QR Codes" section.
                      </div>
                    </>
                  ) : (
                    <div className="text-sm">
                      Submitting requests is currently unavailable.
                    </div>
                  )}
                </div>
                
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full">
                      Close
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : (
            <Button 
              onClick={() => setIsGenerateModalOpen(true)}
              size="sm"
              className="px-3 py-1 h-9"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Request
            </Button>
          )}
        </div>
      </div>

      {/* QR Code List */}
      <div>
        <QRCodeList />
      </div>
      
{/* Open Requests Section */}
{isLoadingRequests && !isRefreshing ? (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-16 w-full" />
    </CardContent>
  </Card>
) : (
  <Card className="border shadow-sm overflow-hidden">
    <CardHeader 
      className="pb-2 cursor-pointer" 
      onClick={toggleOpenRequests}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          <CardTitle className="text-lg font-medium">
            Open Requests
            {pendingRequests.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {pendingRequests.length}
              </Badge>
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
          {isOpenRequestsExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </div>
      <CardDescription className="flex justify-between items-center">
        <span>
          {pendingRequests.length > 0 
            ? "Waiting for processing"
            : "No open parking requests"}
        </span>
        {lastUpdated && (
          <span className="text-xs">
            Updated: {lastUpdated}
          </span>
        )}
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
          <CardContent className="pt-0">
            <div className="space-y-3 mt-2">
              {pendingRequests.map((request) => (
                <motion.div 
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-muted/30 p-3 rounded-lg border relative group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      </div>
                      <h3 className="font-medium text-sm">
                        {request.title || "Untitled Request"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {request.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {/* Delete button - desktop version */}
                        <div className="hidden md:block">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRequestToDelete(request.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>Delete request</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Delete button - mobile version (inline) */}
                        <div className="md:hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRequestToDelete(request.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pl-10 space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Submitted: {formatDate(request.created_at)}
                    </div>
                    {request.purpose_of_visit && (
                      <div className="text-xs text-muted-foreground">
                        Purpose: {request.purpose_of_visit}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </motion.div>
      )}
    </AnimatePresence>
  </Card>
)}

      
      {/* Getting Started Card */}
      <Card className="border overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader 
          className="space-y-1 pb-2 cursor-pointer" 
          onClick={toggleGettingStarted}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              <CardTitle className="text-lg font-medium">Getting Started</CardTitle>
            </div>
            {isGettingStartedExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
          <CardDescription>
            Welcome{firstName ? `, ${firstName}` : ''}! Follow these simple steps to reserve your parking.
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Step cards with improved mobile styling */}
                  <StepCard 
                    number={1} 
                    title="Submit a Request" 
                    description="Click 'Request' button above" 
                    icon={<StepOneIcon className="h-5 w-5" />}
                    color="blue"
                  />
                  <StepCard 
                    number={2} 
                    title="Fill in Details" 
                    description="Provide your visit information" 
                    icon={<StepTwoIcon className="h-5 w-5" />}
                    color="orange"
                  />
                  <StepCard 
                    number={3} 
                    title="Get Your QR Code" 
                    description="Save or access your QR code here" 
                    icon={<StepThreeIcon className="h-5 w-5" />}
                    color="blue"
                  />
                  <StepCard 
                    number={4} 
                    title="Visit Campus" 
                    description="Show it at the entrance and get it scanned" 
                    icon={<StepFourIcon className="h-5 w-5" />}
                    color="orange"
                  />
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      {/* Desktop: Delete Confirmation Dialog */}
      {!isMobile && (
        <AlertDialog open={requestToDelete !== null} onOpenChange={(open) => !open && setRequestToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this parking request? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingRequest}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={deleteRequest} 
                disabled={isDeletingRequest}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeletingRequest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {/* Mobile: Delete Confirmation Sheet */}
      {isMobile && (
        <Sheet open={requestToDelete !== null} onOpenChange={(open) => !open && setRequestToDelete(null)}>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Request
              </SheetTitle>
              <SheetDescription>
                Are you sure you want to delete this parking request? This action cannot be undone.
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-4">
              <div className="text-sm text-muted-foreground">
                Deleting this request will allow you to submit a new parking request.
              </div>
            </div>
            
            <SheetFooter className="flex flex-col gap-2 sm:flex-row">
              <SheetClose asChild>
                <Button variant="outline" className="w-full" disabled={isDeletingRequest}>
                  Cancel
                </Button>
              </SheetClose>
              <Button 
                variant="destructive" 
                className="w-full" 
                disabled={isDeletingRequest}
                onClick={deleteRequest}
              >
                {isDeletingRequest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
      
      {/* QR Code request modal */}
      <GenerateQRCodeModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

function StepCard({ number, title, description, icon, color = "blue" }: StepCardProps) {
  const colorClass = color === "blue" 
    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
    : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";

  return (
    <div className="flex items-start p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className={`h-8 w-8 rounded-full ${colorClass} flex items-center justify-center mr-3 shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1">Step {number}</div>
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function QRCodesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded mb-6"></div>
          <div className="h-40 bg-muted rounded"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    }>
      <QRCodePageContent />
    </Suspense>
  );
}