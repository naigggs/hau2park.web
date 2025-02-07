interface GuestList {
  id: number;
  title: string;
  appointment_date: string;
  purpose_of_visit: string;
  parking_start_time: string;
  parking_end_time: string;
  user_id: {
    first_name: string;
    last_name: string;
    email: string;
    vehicle_plate_number: string;
    user_id: string;
  };
  status: string;
  created_at: string;
}
