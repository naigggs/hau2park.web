export interface User {
    user_id: string;
    first_name: string;
    last_name: string; 
    email: string;
    avatar: string;
    vehicle_plate_number: string;
    'document-1': string | null;
    'document-2': string | null;
    created_at: string;
}