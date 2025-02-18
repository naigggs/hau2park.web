import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ParkingSpaceModalProps {
  space: ParkingSpace | null
  isOpen: boolean
  onClose: () => void
}

export function ParkingSpaceModal({ space, isOpen, onClose }: ParkingSpaceModalProps) {
  if (!space) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{space.name}</DialogTitle>
          <DialogDescription>Parking Space Details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Status:</span>
            <span className="col-span-3">{space.status}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">User:</span>
            <span className="col-span-3">{space.user || "N/A"}</span>
          </div>
          {space.time_in && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium">Time In:</span>
              <span className="col-span-3">{new Date(space.time_in).toLocaleString()}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

