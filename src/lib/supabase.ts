import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvntelxiqkxfczclyrbu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bnRlbHhpcWt4ZmN6Y2x5cmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjY2MTQsImV4cCI6MjA2NjMwMjYxNH0.vi53SR0UjSWCFwbeqy12zOCtJVsbzAIX4mbdm0lb2a8';
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 