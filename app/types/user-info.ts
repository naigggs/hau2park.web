interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  vehicle_plate_number: string;
  email: string;
  role_id: string;
}

interface UserRole {
  id: string;
  role_name: string;
}

interface UserWithRole extends User {
  role_name: string;
}

interface UseUsersState {
  users: UserWithRole[];
  loading: boolean;
  error: string | null;
}
