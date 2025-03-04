import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAdminKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY as string;

export const supabaseAdminClient = createClient(supabaseUrl, supabaseAdminKey);
