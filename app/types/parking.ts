export interface ParkingSpace {
  id: number;
  name: string;
  status: "Available" | "Occupied" | "Reserved";
  location?: string;
  user?: string;
  allocated_at?: string;
  parking_end_time?: string;
}