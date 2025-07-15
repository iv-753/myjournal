'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { getSessionLogs, deleteSessionLog, LogEntry } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { getCloudLogs, deleteCloudLog } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import UserNav from "../UserNav";

type SupabaseLog = {
  id: string;
  project: string;
  work_time: { duration: number; unit: 'hours' | 'minutes' };
  created_at: string;
  gains?: string;
  challenges?: string;
  plan?: string;
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [localTimes, setLocalTimes] = useState<string[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      if (user) {
        const cloudLogs = await getCloudLogs(user.id);
        // 新增：将 work_time 映射为 workTime，created_at 映射为 createdAt
        const mappedLogs = (cloudLogs as unknown as SupabaseLog[]).map((log): LogEntry => ({
          id: log.id,
          project: log.project,
          workTime: log.work_time,
          createdAt: log.created_at,
          gains: log.gains ?? '',
          challenges: log.challenges ?? '',
          plan: log.plan ?? '',
        }));
        setLogs(mappedLogs);
      } else {
        setLogs(getSessionLogs().reverse());
      }
      setLoading(false);
    }
    fetchLogs();
  }, [user]);

  // 日志变化时，批量格式化所有日志的本地时间
  useEffect(() => {
    const times = logs.map((log, index) => {
      console.log(`=== 日志 ${index + 1} 调试 ===`);
      console.log('原始createdAt:', log.createdAt);
      console.log('Date对象:', new Date(log.createdAt));
      console.log('getHours():', new Date(log.createdAt).getHours());
      console.log('getMinutes():', new Date(log.createdAt).getMinutes());
      
      const formatted = formatLocalTime(log.createdAt);
      console.log('formatLocalTime结果:', formatted);
      console.log('---');
      
      return formatted;
    });
    setLocalTimes(times);
  }, [logs]);

  const handleDelete = async (logId: string) => {
    if (window.confirm('您确定要永久删除这条日志吗？')) {
      if (user) {
        await deleteCloudLog(logId, user.id);
        setLogs((currentLogs) => currentLogs.filter((log) => log.id !== logId));
      } else {
      deleteSessionLog(logId);
      setLogs((currentLogs) => currentLogs.filter((log) => log.id !== logId));
      }
    }
  };

  const buttonStyle = "inline-block text-center text-sm font-semibold px-3 py-1 rounded-md transition-colors duration-200 border bg-white border-gray-300 text-gray-700";

  // 新增格式化函数
  function formatDuration(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes === 0) return '0 分钟';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let result = '';
    if (hours > 0) result += `${hours} 小时`;
    if (minutes > 0) result += (hours > 0 ? ' ' : '') + `${minutes} 分钟`;
    return result;
  }

  // 手动格式化本地时间，确保正确处理 UTC 时间
  function formatLocalTime(isoString: string): string {
    // 确保 isoString 有 Z 后缀，正确处理 UTC 时间
    const normalizedString = isoString.endsWith('Z') ? isoString : isoString + 'Z';
    
    const date = new Date(normalizedString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}年${month}月${day}日 ${hour}:${minute}`;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            我的历史日志
          </h1>
          <Link 
            href="/stats" 
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors duration-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            查看统计
          </Link>
        </div>
        
        <div className="absolute top-6 right-8 z-50">
          <UserNav />
        </div>
        
        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">加载中...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">还没有任何日志记录。</p>
            <p className="mt-2 text-sm text-gray-400">
              快去<Link href="/" className="text-teal-500 hover:underline">写下第一篇</Link>吧！
            </p>
            <div className="mt-4">
              <Link 
                href="/stats" 
                className="inline-flex items-center px-3 py-1 text-sm text-teal-600 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors duration-200"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                查看统计
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {logs.map((log, idx) => (
              <div key={log.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{log.project}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {localTimes[idx]} {' - '} {formatDuration(Number(log.workTime?.duration ?? 0))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/edit/${log.id}`)}
                      className={`${buttonStyle} hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className={`${buttonStyle} hover:bg-red-500 hover:text-white hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                      aria-label="删除日志"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">今日收获</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{log.gains ?? ''}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">遇到的挑战与解法</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{log.challenges ?? ''}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">明日计划</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{log.plan ?? ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 