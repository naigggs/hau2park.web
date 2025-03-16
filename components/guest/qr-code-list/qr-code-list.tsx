'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  RefreshCw, 
  Trash2, 
  ChevronDown,
  PlusCircle,
  AlertCircle,
  Clock,
  Calendar,
  Check,
  Ban,
  QrCode
} from 'lucide-react'
import Image from 'next/image'
import { QRCodeModal } from './qr-code-modal'
import { useGuestQRCodeList } from '@/hooks/use-guest-qr'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useToast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Custom hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Only run on client side
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return isMobile;
};

export default function QRCodeList() {
  const { guestQRList, loading, error, deleteQRCode, refresh, canCreateRequest } = useGuestQRCodeList()
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [qrToDelete, setQrToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()
  
  // Client-side only states to avoid hydration errors
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
  // State for active accordion items
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([])
  
  // Update lastUpdated time on client-side only to avoid hydration issues
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])
  
// Replace these two filtering functions with the updated logic
const activeQRCodes = guestQRList.filter(qr => {
  // Keep non-expired QR codes that aren't used
  if (qr.status !== 'Expired' && qr.is_used === false) return true;
  // Also keep QR codes with Open status and is_used=true (active ones)
  if (qr.status === 'Open' && qr.is_used === true) return true;
  return false;
})
  
const expiredQRCodes = guestQRList.filter(qr => {
  // Only include expired QR codes or used ones that aren't "active"
  if (qr.status === 'Expired') return true;
  // Used QR codes that don't have Open status
  if (qr.is_used === true && qr.status !== 'Open') return true;
  return false;
})
  
  // Set default accordion state based on active QR code presence:
  useEffect(() => {
    const accordionItems: string[] = []
    
    if (activeQRCodes.length > 0) {
      accordionItems.push("qr-codes")
    }
    
    setActiveAccordionItems(accordionItems)
  }, [activeQRCodes.length])
  
  // Handle refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    try {
      if (refresh) {
        await refresh()
      }
      
      setLastUpdated(new Date().toLocaleTimeString())
      
      toast({
        title: "Refreshed",
        description: "QR codes have been refreshed",
      })
    } catch (err) {
      console.error("Error refreshing QR codes:", err)
      toast({
        title: "Error",
        description: "Failed to refresh QR codes",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleCardClick = (qrCode: QRCode) => {
    setSelectedQRCode(qrCode)
  }
  
  // Handle delete request
  const handleDeleteRequest = (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setQrToDelete(id)
  }
  
  // Confirm delete action
  const confirmDelete = async () => {
    if (qrToDelete === null) return
    
    setIsDeleting(true)
    
    try {
      if (deleteQRCode) {
        const success = await deleteQRCode(qrToDelete)
        
        if (success) {
          toast({
            title: "QR Code Deleted",
            description: "Your QR code has been successfully deleted",
          })
          
          // Refresh to ensure the UI and canCreateRequest state updates
          if (refresh) {
            await refresh()
          }
        } else {
          throw new Error("Failed to delete QR code")
        }
      }
    } catch (err) {
      console.error("Error deleting QR code:", err)
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setQrToDelete(null)
    }
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = (qrCode: QRCode) => {
    // If is_used is TRUE and status is Open, use default variant to highlight it as active
    if (qrCode.is_used && qrCode.status === 'Open') return "default";
    // For other used QR codes
    if (qrCode.is_used) return "secondary";
    // For non-used QR codes
    switch (qrCode.status) {
      case 'Open': return "outline";
      case 'active': return "default";
      case 'Expired': return "destructive";
      default: return "outline";
    }
  }
  
// Replace the getStatusText function with this updated version
const getStatusText = (qrCode: QRCode) => {
  // If is_used is TRUE and status is Open, show it as Active
  if (qrCode.is_used && qrCode.status === 'Open') return "Active";
  // For other used QR codes
  if (qrCode.is_used) return "Used";
  // For non-used open QR codes
  return qrCode.status === 'Open' ? 'Available' : qrCode.status;
}

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div>Error loading QR Code list: {error.message}</div>;
  }

  const renderQRCodeCard = (qrCode: QRCode, isExpired: boolean = false) => (
    <Card 
      key={qrCode.id} 
      className={`overflow-hidden transition-shadow hover:shadow-md ${isExpired ? 'opacity-70' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          QR Code #{qrCode.id}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(qrCode)}>
            {getStatusText(qrCode)}
          </Badge>
          
          {/* Delete icon - tastefully shown next to the badge */}
          {!qrCode.is_used && qrCode.status !== 'Expired' && (
            <button 
              onClick={(e) => handleDeleteRequest(qrCode.id, e)}
              className="text-red-500 hover:text-red-700 transition-colors focus:outline-none"
              aria-label="Delete QR code"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent 
        className={isExpired ? '' : 'cursor-pointer'}
        onClick={isExpired ? undefined : () => handleCardClick(qrCode)}
      >
        <div className="flex justify-center py-4">
          <div className={`relative h-[150px] w-[150px] bg-white p-2 rounded-lg shadow-sm ${isExpired ? 'opacity-50' : ''}`}>
            <Image 
              src={qrCode.qr_code_url} 
              alt="QR Code" 
              fill
              className={`object-contain ${isExpired ? 'grayscale' : ''}`}
            />
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge variant="outline" className="px-3 py-1 border-red-300 bg-white/80 text-red-500">
                  {qrCode.is_used ? "USED" : "EXPIRED"}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              Created:
            </span>
            <span>{formatDate(qrCode.created_at)}</span>
          </div>
          {qrCode.appointment_date && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Appointment:
              </span>
              <span>
                {typeof qrCode.appointment_date === 'string' || 
                 typeof qrCode.appointment_date === 'number' || 
                 qrCode.appointment_date instanceof Date
                  ? new Date(qrCode.appointment_date as string | number | Date).toLocaleDateString()
                  : 'Invalid date'}
              </span>
            </div>
          )}
          {qrCode.used_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                Used at:
              </span>
              <span>{formatDate(String(qrCode.used_at))}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Your QR Codes</h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 p-2"
            title="Refresh QR Codes"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {guestQRList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg dark:bg-gray-900/50">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">No QR Codes Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You don't have any QR codes. Submit a parking request to generate one.
            </p>
          </div>
        </div>
      ) : (
        <Accordion type="multiple" value={activeAccordionItems} onValueChange={setActiveAccordionItems} className="space-y-4">
          {/* Single QR Codes Section with Tabs */}
          <AccordionItem value="qr-codes" className="border rounded-lg shadow-sm overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="font-medium">QR Codes</span>
                <Badge variant="outline" className="ml-2">
                  {guestQRList.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <div className="p-4">
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="active" className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 mr-1" /> 
                      Active QR Codes
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activeQRCodes.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="expired" className="flex items-center gap-1">
                      <Ban className="h-3.5 w-3.5 mr-1" /> 
                      Expired & Used
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {expiredQRCodes.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Active QR Codes Tab Content */}
                  <TabsContent value="active">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {activeQRCodes.length === 0 ? (
                        <p className="text-muted-foreground col-span-3 text-center py-4">
                          No active QR codes available.
                        </p>
                      ) : (
                        activeQRCodes.map(qrCode => renderQRCodeCard(qrCode))
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Expired & Used QR Codes Tab Content */}
                  <TabsContent value="expired">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {expiredQRCodes.length === 0 ? (
                        <p className="text-muted-foreground col-span-3 text-center py-4">
                          No expired or used QR codes.
                        </p>
                      ) : (
                        expiredQRCodes.map(qrCode => renderQRCodeCard(qrCode, true))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      <QRCodeModal 
        isOpen={!!selectedQRCode}
        onClose={() => setSelectedQRCode(null)}
        qrCode={selectedQRCode}
      />
      
      {/* Desktop: Delete confirmation dialog */}
      {!isMobile && (
        <AlertDialog 
          open={qrToDelete !== null} 
          onOpenChange={(isOpen) => !isOpen && setQrToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this QR code? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? (
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
      
      {/* Mobile: Delete confirmation sheet */}
      {isMobile && (
        <Sheet open={qrToDelete !== null} onOpenChange={(isOpen) => !isOpen && setQrToDelete(null)}>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Delete QR Code</SheetTitle>
              <SheetDescription>
                Are you sure you want to delete this QR code? This action cannot be undone.
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-6">
              <div className="flex flex-col text-sm space-y-1">
                <span className="text-muted-foreground">
                  Deleting this QR code will allow you to submit a new parking request.
                </span>
              </div>
            </div>
            
            <SheetFooter className="flex flex-col gap-2 sm:flex-row">
              <SheetClose asChild>
                <Button variant="outline" className="w-full" disabled={isDeleting}>
                  Cancel
                </Button>
              </SheetClose>
              <Button 
                variant="destructive" 
                className="w-full" 
                disabled={isDeleting}
                onClick={confirmDelete}
              >
                {isDeleting ? (
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
    </div>
  )
}