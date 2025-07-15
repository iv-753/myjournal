import { createClient } from '@supabase/supabase-js';
import type { LogEntry } from './storage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// globalThis 单例防止多次实例化
// @ts-expect-error - globalThis 类型扩展
if (!globalThis._supabaseClient) {
  // @ts-expect-error - globalThis 类型扩展
  globalThis._supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}
// @ts-expect-error - globalThis 类型扩展
const supabaseClient = globalThis._supabaseClient;

/**
 * 获取全局唯一的 Supabase 客户端实例
 * 这样可避免多实例导致的认证状态混乱和警告
 */
export function getSupabaseClient() {
  return supabaseClient;
}

/**
 * 获取 OAuth 登录跳转地址
 * 本地开发返回 http://localhost:3000，线上返回 window.location.origin
 */
export function getOAuthRedirectTo() {
  if (typeof window !== 'undefined') {
    // 线上/预览环境自动适配
    return window.location.origin;
  }
  // SSR 或 Node 环境默认返回本地
  return 'http://localhost:3000';
}

/**
 * 封装 OAuth 登录，自动带 redirectTo
 * @param provider 'github' | 'google' 等
 */
export async function signInWithOAuthWithRedirect(provider: 'github' | 'google') {
  const supabase = getSupabaseClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getOAuthRedirectTo(),
    },
  });
}

// 获取云端所有日志
export async function getCloudLogs(userId: string): Promise<LogEntry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('获取云端日志失败', error);
    return [];
  }
  return data as LogEntry[];
}

// 新增云端日志
export async function addCloudLog(log: Omit<LogEntry, 'id'> & { createdAt?: string }, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  // 字段名映射，保证和数据库一致
  const dbLog = {
    project: log.project,
    work_time: log.workTime,
    gains: log.gains,
    challenges: log.challenges,
    plan: log.plan,
    created_at: new Date().toISOString(), // 总是使用当前时间，确保一致性
    user_id: userId
  };
  // 调试输出
  console.log('addCloudLog userId:', userId);
  console.log('addCloudLog dbLog:', dbLog);
  const { error } = await supabase
    .from('logs')
    .insert([dbLog]);
  if (error) {
    console.error('新增云端日志失败', error);
    return false;
  }
  return true;
}

// 删除云端日志
export async function deleteCloudLog(logId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  // 删除指定 id 且属于当前用户的日志
  const { error } = await supabase
    .from('logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', userId);
  if (error) {
    console.error('删除云端日志失败', error);
    return false;
  }
  return true;
}

// 更新云端日志
export async function updateCloudLog(log: LogEntry, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  // 字段名映射，保证和数据库一致
  const dbLog = {
    project: log.project,
    work_time: log.workTime,
    gains: log.gains,
    challenges: log.challenges,
    plan: log.plan,
    created_at: log.createdAt,
    user_id: userId
  };
  const { error } = await supabase
    .from('logs')
    .update(dbLog)
    .eq('id', log.id)
    .eq('user_id', userId);
  if (error) {
    console.error('更新云端日志失败', error);
    return false;
  }
  return true;
}

/**
 * 检查云端是否已存在指定日志（用于去重）
 * @param logId 日志唯一ID
 * @param userId 用户ID
 * @returns 是否存在该日志
 */
export async function cloudHasLog(logId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  // 查询 logs 表，查找指定 id 和 user_id 的日志
  const { data, error } = await supabase
    .from('logs')
    .select('id')
    .eq('id', logId)
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    console.error('检查云端日志是否存在失败', error);
    return false;
  }
  return !!data;
}

/**
 * 上传本地日志到云端（带去重）
 * @param log 日志对象
 * @param userId 用户ID
 * @returns 是否上传成功
 */
export async function uploadLogToCloud(log: LogEntry, userId: string): Promise<boolean> {
  // 先检查云端是否已有该日志，避免重复
  const exists = await cloudHasLog(log.id, userId);
  if (exists) {
    // 已存在则不重复上传
    return true;
  }
  const supabase = getSupabaseClient();
  // 插入日志到云端
  const { error } = await supabase
    .from('logs')
    .insert([{ ...log, user_id: userId }]);
  if (error) {
    console.error('上传日志到云端失败', error);
    return false;
  }
  return true;
} 