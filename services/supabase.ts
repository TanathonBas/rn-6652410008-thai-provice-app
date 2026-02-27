import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qacrtgdpbhygdjhjxiug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhY3J0Z2RwYmh5Z2RqaGp4aXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTQ0NDcsImV4cCI6MjA4NzU3MDQ0N30.Qj2w_ABVDZmPkSKajQvK4hLE7DC6esk_EHgw7hipKPU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

