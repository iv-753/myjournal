'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { getSessionLogs, deleteSessionLog, LogEntry } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { getCloudLogs, deleteCloudLog } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import UserNav from "../../UserNav";
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

interface HistoryPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = use(params);
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

  useEffect(() => {
    const times = logs.map((log) => {
      return formatLocalTime(log.createdAt, locale);
    });
    setLocalTimes(times);
  }, [logs, locale]);

  const handleDelete = async (logId: string) => {
    if (window.confirm(t('history.deleteConfirm', locale))) {
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

  function formatDuration(totalMinutes: number, locale: Locale): string {
    if (!totalMinutes || totalMinutes === 0) {
      return locale === 'en' ? '0 minutes' : '0 分钟';
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let result = '';
    
    if (locale === 'en') {
      if (hours > 0) result += `${hours} ${t('history.duration.hours', locale)}`;
      if (minutes > 0) result += (hours > 0 ? ' ' : '') + `${minutes} ${t('history.duration.minutes', locale)}`;
    } else {
      if (hours > 0) result += `${hours} ${t('history.duration.hours', locale)}`;
      if (minutes > 0) result += (hours > 0 ? ' ' : '') + `${minutes} ${t('history.duration.minutes', locale)}`;
    }
    
    return result;
  }

  function formatLocalTime(isoString: string, locale: Locale): string {
    const normalizedString = isoString.endsWith('Z') ? isoString : isoString + 'Z';
    const date = new Date(normalizedString);
    
    if (locale === 'en') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${year}年${month}月${day}日 ${hour}:${minute}`;
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('history.title', locale)}
          </h1>
          <Link 
            href={`/${locale}/stats`}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors duration-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {t('history.viewStats', locale)}
          </Link>
        </div>
        
        <div className="absolute top-6 right-8 z-50">
          <UserNav />
        </div>
        
        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            {t('common.loading', locale)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">{t('history.empty.title', locale)}</p>
            <p className="mt-2 text-sm text-gray-400">
              <Link href={`/${locale}`} className="text-teal-500 hover:underline">
                {t('history.empty.subtitle', locale)}
              </Link>
            </p>
            <div className="mt-4">
              <Link 
                href={`/${locale}/stats`}
                className="inline-flex items-center px-3 py-1 text-sm text-teal-600 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors duration-200"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                {t('history.viewStats', locale)}
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
                      {localTimes[idx]} {' - '} {formatDuration(Number(log.workTime?.duration ?? 0), locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/${locale}/edit/${log.id}`)}
                      className={`${buttonStyle} hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {t('history.actions.edit', locale)}
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className={`${buttonStyle} hover:bg-red-500 hover:text-white hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                      aria-label={t('history.actions.delete', locale)}
                    >
                      {t('history.actions.delete', locale)}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {t('history.sections.gains', locale)}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{log.gains ?? ''}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {t('history.sections.challenges', locale)}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{log.challenges ?? ''}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {t('history.sections.plan', locale)}
                    </h3>
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