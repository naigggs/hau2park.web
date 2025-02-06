export interface User {
    user_id: string;
    full_name: string;  
    age: number;
    location: string;
    'document-1': string | null;
    'document-2': string | null;
    created_at: string;
}