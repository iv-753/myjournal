'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getLogs, LogEntry } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { getCloudLogs } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Helper function to format total minutes into a readable string
function formatDuration(totalMinutes: number): string {
  if (totalMinutes === 0) {
    return '0 分钟';
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  let result = '';
  if (hours > 0) {
    result += `${hours} 小时 `;
  }
  if (minutes > 0) {
    result += `${minutes} 分钟`;
  }
  return result.trim();
}

export default function StatsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null); // 当前用户
  const [loading, setLoading] = useState(true); // 加载状态

  // 获取当前登录用户
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

  // 根据登录状态拉取日志
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      if (user) {
        // 已登录，拉取云端日志
        const cloudLogs = await getCloudLogs(user.id);
        setLogs(cloudLogs);
      } else {
        // 未登录，拉取本地日志
        setLogs(getLogs());
      }
      setLoading(false);
    }
    fetchLogs();
  }, [user]);

  // Get a unique list of project names for the dropdown
  const projectNames = useMemo(() => {
    const names = logs.map(log => log.project.trim());
    return [...new Set(names)].filter(name => name); // Remove empty names
  }, [logs]);
  
  // Calculate total time when a project is selected
  useEffect(() => {
    if (!selectedProject) {
      setTotalDuration(0);
      setWorkingDays(0);
      setStreak(0);
      return;
    }
    
    const projectLogs = logs.filter(log => log.project.trim() === selectedProject);

    const totalMinutes = projectLogs.reduce((total, log) => {
        const durationInMinutes = log.workTime.unit === 'hours' 
          ? log.workTime.duration * 60 
          : log.workTime.duration;
        return total + durationInMinutes;
      }, 0);
      
    const uniqueDays = new Set(
      projectLogs.map(log => new Date(log.createdAt).toDateString())
    );

    setTotalDuration(totalMinutes);
    setWorkingDays(uniqueDays.size);

    // 连续天数统计
    // 1. 取所有日期，去重，转为Date对象，排序
    const daysArr = Array.from(uniqueDays)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime()); // 从大到小
    
    let streakCount = 0;
    const cur = new Date();
    cur.setHours(0,0,0,0); // 只看日期
    for (let i = 0; i < daysArr.length; i++) {
      if (daysArr[i].getTime() === cur.getTime()) {
        streakCount++;
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(streakCount);

  }, [selectedProject, logs]);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold text-gray-800">
            项目时长统计
          </h1>
           <Link href="/history" className="text-teal-500 hover:text-teal-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-100">
            &larr; 返回历史
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">加载中...</div>
        ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label htmlFor="project-select" className="block text-lg font-semibold text-gray-700 mb-2">
              请选择一个项目：
            </label>
            <select
              id="project-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- 选择项目 --</option>
              {projectNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="mt-8 text-center bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">项目 &quot;{selectedProject}&quot; 的统计数据：</p>
              <div className="flex justify-around items-center">
                <div>
                  <p className="text-gray-500 text-sm">总工作时长</p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">
                    {formatDuration(totalDuration)}
                  </p>
                </div>
                <div className="border-l border-gray-300 h-16"></div>
                <div>
                  <p className="text-gray-500 text-sm">总工作天数</p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">
                    {workingDays} 天
                  </p>
                </div>
                <div className="border-l border-gray-300 h-16"></div>
                <div>
                  <p className="text-gray-500 text-sm">连续工作天数</p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">
                    {streak} 天
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </main>
  );
} 