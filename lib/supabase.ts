import { createClient } from '@supabase/supabase-js'

// Lấy URL và anon key từ biến môi trường
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Tạo Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)