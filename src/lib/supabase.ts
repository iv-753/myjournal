import { createClient } from '@supabase/supabase-js';

/**
 * 获取 Supabase 客户端实例（每次调用时动态读取环境变量）
 * 
 * 为什么要这样做？
 * - 解决 Vercel 构建时环境变量未注入导致的"supabaseUrl is required"报错。
 * - 避免在模块顶层初始化 Supabase，确保只有在运行时（如组件或 API 路由中）才读取环境变量。
 * - 这样无论本地还是云端部署，环境变量都能被正确读取。
 * 
 * 用法：
 *   import { getSupabaseClient } from '@/lib/supabase';
 *   const supabase = getSupabaseClient();
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
} 