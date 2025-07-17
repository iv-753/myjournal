'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { getLogs, LogEntry } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { getCloudLogs } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { t, Locale } from '@/lib/i18n';

type SupabaseLog = {
  id: string;
  project: string;
  work_time: { duration: number; unit: 'hours' | 'minutes' };
  created_at: string;
  gains?: string;
  challenges?: string;
  plan?: string;
};

interface StatsPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default function StatsPage({ params }: StatsPageProps) {
  const { locale } = use(params);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to format total minutes into a readable string
  function formatDuration(totalMinutes: number, locale: Locale): string {
    if (totalMinutes === 0) {
      return locale === 'en' ? '0 minutes' : '0 分钟';
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    let result = '';
    if (locale === 'en') {
      if (hours > 0) {
        result += `${hours} ${t('history.duration.hours', locale)} `;
      }
      if (minutes > 0) {
        result += `${minutes} ${t('history.duration.minutes', locale)}`;
      }
    } else {
      if (hours > 0) {
        result += `${hours} ${t('history.duration.hours', locale)} `;
      }
      if (minutes > 0) {
        result += `${minutes} ${t('history.duration.minutes', locale)}`;
      }
    }
    return result.trim();
  }

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
        const cloudLogs = await getCloudLogs(user.id);
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
        setLogs(getLogs());
      }
      setLoading(false);
    }
    fetchLogs();
  }, [user]);

  // Get a unique list of project names for the dropdown
  const projectNames = useMemo(() => {
    const names = logs.map(log => log.project.trim());
    return [...new Set(names)].filter(name => name);
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
        const durationInMinutes = log.workTime && log.workTime.unit
          ? (log.workTime.unit === 'hours' 
              ? log.workTime.duration * 60 
              : log.workTime.duration)
          : 0;
        return total + durationInMinutes;
      }, 0);
      
    const uniqueDays = new Set(
      projectLogs.map(log => new Date(log.createdAt).toDateString())
    );

    setTotalDuration(totalMinutes);
    setWorkingDays(uniqueDays.size);

    // 连续天数统计
    const daysArr = Array.from(uniqueDays)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streakCount = 0;
    const cur = new Date();
    cur.setHours(0,0,0,0);
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
            {t('stats.title', locale)}
          </h1>
           <Link 
             href={`/${locale}/history`} 
             className="text-teal-500 hover:text-teal-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-100"
           >
            &larr; {t('stats.backToHistory', locale)}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            {t('common.loading', locale)}
          </div>
        ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label htmlFor="project-select" className="block text-lg font-semibold text-gray-700 mb-2">
              {t('stats.selectProject', locale)}
            </label>
            <select
              id="project-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">{t('stats.selectPlaceholder', locale)}</option>
              {projectNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="mt-8 text-center bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                {t('stats.projectStats', locale).replace('{project}', selectedProject)}
              </p>
              <div className="flex justify-around items-center">
                <div>
                  <p className="text-gray-500 text-sm">
                    {t('stats.metrics.totalDuration', locale)}
                  </p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">
                    {formatDuration(totalDuration, locale)}
                  </p>
                </div>
                <div className="border-l border-gray-300 h-16"></div>
                <div>
                  <p className="text-gray-500 text-sm">
                    {t('stats.metrics.workingDays', locale)}
                  </p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">
                    {workingDays} {t('stats.metrics.days', locale)}
                  </p>
                </div>
                <div className="border-l border-gray-300 h-16"></div>
                <div>
                  <p className="text-gray-500 text-sm">
                    {t('stats.metrics.streak', locale)}
                  </p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">
                    {streak} {t('stats.metrics.days', locale)}
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