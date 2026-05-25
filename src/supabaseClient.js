import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nxijgnhlbnacmahtejkv.supabase.co';

const supabaseAnonKey = 'sb_publishable_hjkhIaLSob4SMmYbK2560A_x_c4Ddak';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);