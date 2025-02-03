import { GuestList } from "@/components/guest-list/guest-list";
import { AllGuestList } from "@/components/guest-list/guest-list-all";

export default function GuestsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Guest Management</h1>
      <div className="flex flex-col gap-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
          <GuestList />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Guest Users</h1>
          <AllGuestList />
        </div>
      </div>
    </div>
  );
}
