"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGuestParkingRequests } from "@/hooks/use-guest-parking-requests"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, Clock, Filter, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GuestParkingRequest {
  id: number
  title: string
  appointment_date: string
  parking_start_time: string
  parking_end_time: string
  status: string
}

export default function GuestParkingRequests() {
  const { requests, isLoading, error } = useGuestParkingRequests()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<GuestParkingRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Format date to a more professional format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Filter requests based on selected status
  const filteredRequests =
    statusFilter === "all" ? requests : requests.filter((request) => request.status === statusFilter)

  // Handle opening the cancel modal
  const handleOpenCancelModal = (request: GuestParkingRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  // Handle cancel request (design only)
  const handleCancelRequest = () => {
    // This would contain the actual cancellation logic
    setIsModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Skeleton className="h-10 w-72 mb-6" />
        <div className="bg-background border rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <Skeleton className="h-10 w-48" />
            </div>
            <div className="rounded-md border">
              <div className="p-4">
                <div className="grid grid-cols-5 gap-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
              <div className="border-t">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border-b last:border-b-0">
                    <div className="grid grid-cols-5 gap-4">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-24 ml-auto" />
                      <Skeleton className="h-6 w-24 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Parking Request Management</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            We encountered an issue while retrieving your parking requests.
            {typeof error === "string" ? error : error.message}
            Please try again later or contact support if this issue persists.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Approved", label: "Approved" },
    { value: "Open", label: "Pending" },
    { value: "Rejected", label: "Rejected" },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-semibold mb-2">Parking Request Management</h1>
      <p className="text-muted-foreground mb-8">View and manage all your guest parking requests</p>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Request History</h2>
            <p className="text-sm text-muted-foreground mt-1">
              A comprehensive overview of all your submitted parking requests
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border shadow-sm bg-background">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Request Title</TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Appointment Date</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Parking Duration</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-right">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{formatDate(request.appointment_date)}</TableCell>
                    <TableCell>
                      {request.parking_start_time} - {request.parking_end_time}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          request.status === "Approved"
                            ? "default"
                            : request.status === "Open"
                              ? "secondary"
                              : "destructive"
                        }
                        className="font-medium"
                      >
                        {request.status === "Open" ? "Pending" : request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "Open" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => handleOpenCancelModal(request)}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-1 py-4">
                      <p className="text-muted-foreground font-medium">No parking requests found</p>
                      <p className="text-sm text-muted-foreground">
                        {statusFilter !== "all"
                          ? `No requests with status "${statusFilter}" found. Try changing your filter.`
                          : "You haven't submitted any parking requests yet."}
                      </p>
                      {statusFilter !== "all" && (
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => setStatusFilter("all")}>
                          Show all requests
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredRequests.length > 0 && (
            <p>
              Displaying {filteredRequests.length} {filteredRequests.length === 1 ? "request" : "requests"}
              {statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Cancel Request Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Parking Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this parking request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4">
              <div className="rounded-md bg-muted p-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Guest:</dt>
                    <dd>{selectedRequest.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Date:</dt>
                    <dd>{formatDate(selectedRequest.appointment_date)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Time:</dt>
                    <dd>
                      {selectedRequest.parking_start_time} - {selectedRequest.parking_end_time}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Keep Request
            </Button>
            <Button variant="destructive" onClick={handleCancelRequest}>
              Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

