export interface ParkingSpace {
  id: number;
  name: string;
  status: "Occupied" | "Reserved" | "Available";
  location?: string;
  user?: string;
  confidence?: number;
  allocated_at?: string;
  verified_by_user?: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  parking_end_time?: string;
}