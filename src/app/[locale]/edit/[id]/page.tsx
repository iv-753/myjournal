'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLogById, updateLog, LogEntry, getSessionLogs, updateSessionLog } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { getCloudLogs, updateCloudLog } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { t, Locale } from '@/lib/i18n';

type FormData = {
  project: string;
  workTime: {
    duration: number | '';
    unit: 'hours' | 'minutes';
  };
  gains: string;
  challenges: string;
  plan: string;
};

type SupabaseLog = {
  id: string;
  project: string;
  work_time: { duration: number; unit: 'hours' | 'minutes' };
  created_at: string;
  gains?: string;
  challenges?: string;
  plan?: string;
};

interface EditPageProps {
  params: Promise<{
    locale: Locale;
    id: string;
  }>;
}

export default function EditPage({ params }: EditPageProps) {
  const { locale, id } = use(params);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [originalLog, setOriginalLog] = useState<LogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [workHour, setWorkHour] = useState('');
  const [workMinute, setWorkMinute] = useState('');

  const router = useRouter();

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
    if (typeof user === 'undefined') return;
    async function fetchLog() {
      setIsLoading(true);
      setError(null);
      if (!id) {
        setError(t('edit.errors.missingId', locale));
        setIsLoading(false);
        return;
      }
      if (user) {
        const cloudLogs = await getCloudLogs(user.id);
        const mappedLogs = (cloudLogs as unknown as SupabaseLog[]).map((l): LogEntry => ({
          id: l.id,
          project: l.project,
          workTime: l.work_time,
          createdAt: l.created_at,
          gains: l.gains ?? '',
          challenges: l.challenges ?? '',
          plan: l.plan ?? '',
        }));
        const log = mappedLogs.find(l => l.id === id);
        if (log) {
          setOriginalLog(log);
          setFormData({
            project: log.project,
            workTime: {
              duration: log.workTime?.duration ?? 0,
              unit: 'minutes',
            },
            gains: log.gains,
            challenges: log.challenges,
            plan: log.plan
          });
          const hour = Math.floor(Number(log.workTime?.duration ?? 0) / 60);
          const minute = Number(log.workTime?.duration ?? 0) % 60;
          setWorkHour(hour ? String(hour) : '');
          setWorkMinute(minute ? String(minute) : '');
        } else {
          setError(t('edit.errors.notFound', locale));
        }
      } else {
        // 检查会话存储
        const sessionLogs = getSessionLogs();
        const log = sessionLogs.find(l => l.id === id);
        if (log) {
          setOriginalLog(log);
          setFormData({
            project: log.project,
            workTime: {
              duration: log.workTime?.duration ?? 0,
              unit: 'minutes',
            },
            gains: log.gains,
            challenges: log.challenges,
            plan: log.plan
          });
          const hour = Math.floor(Number(log.workTime?.duration ?? 0) / 60);
          const minute = Number(log.workTime?.duration ?? 0) % 60;
          setWorkHour(hour ? String(hour) : '');
          setWorkMinute(minute ? String(minute) : '');
        } else {
          // 尝试本地存储
          const localLog = getLogById(id);
          if (localLog) {
            setOriginalLog(localLog);
            setFormData({
              project: localLog.project,
              workTime: {
                duration: localLog.workTime?.duration ?? 0,
                unit: 'minutes',
              },
              gains: localLog.gains,
              challenges: localLog.challenges,
              plan: localLog.plan
            });
            const hour = Math.floor(Number(localLog.workTime?.duration ?? 0) / 60);
            const minute = Number(localLog.workTime?.duration ?? 0) % 60;
            setWorkHour(hour ? String(hour) : '');
            setWorkMinute(minute ? String(minute) : '');
          } else {
            setError(t('edit.errors.notFound', locale));
          }
        }
      }
      setIsLoading(false);
    }
    fetchLog();
  }, [id, user, locale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    setFormData(prev => ({ ...prev!, [name]: value }));
  };

  const handleWorkHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkHour(e.target.value.replace(/[^\d]/g, ''));
  };
  
  const handleWorkMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkMinute(e.target.value.replace(/[^\d]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !originalLog) return;
    
    const hour = parseInt(workHour || '0', 10);
    const minute = parseInt(workMinute || '0', 10);
    const totalMinutes = hour * 60 + minute;
    
    if (!totalMinutes || totalMinutes <= 0) {
      alert(t('edit.alerts.invalidWorkTime', locale));
      return;
    }
    
    if (formData.gains.length < 30 || formData.challenges.length < 30 || formData.plan.length < 30) {
      alert(t('edit.alerts.minLength', locale));
      return;
    }
    
    const updatedLogData: LogEntry = {
      ...originalLog,
      ...formData,
      workTime: {
        duration: totalMinutes,
        unit: 'minutes',
      },
    };
    
    if (user) {
      const success = await updateCloudLog(updatedLogData, user.id);
      if (success) {
        alert(t('edit.alerts.updateSuccess', locale));
        router.push(`/${locale}/history`);
      } else {
        alert(t('edit.alerts.updateFailed', locale));
      }
    } else {
      // 尝试更新会话存储
      const sessionSuccess = updateSessionLog(updatedLogData);
      if (sessionSuccess) {
        alert(t('edit.alerts.updateSuccess', locale));
        router.push(`/${locale}/history`);
      } else {
        // 尝试更新本地存储
        const localSuccess = updateLog(updatedLogData);
        if (localSuccess) {
          alert(t('edit.alerts.updateSuccess', locale));
          router.push(`/${locale}/history`);
        } else {
          alert(t('edit.alerts.updateFailed', locale));
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('edit.loading', locale)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>{error}</p>
        <Link href={`/${locale}/history`} className="mt-4 text-blue-500 hover:underline">
          {t('edit.backToHistory', locale)}
        </Link>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('edit.noFormData', locale)}
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8 my-8 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('edit.title', locale)}
          </h1>
          <Link 
            href={`/${locale}/history`} 
            className="text-teal-500 hover:text-teal-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-100"
          >
            &larr; {t('edit.backToHistory', locale)}
          </Link>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label htmlFor="project" className="block mb-2 text-lg font-semibold text-gray-800">
              {t('log.form.project.label', locale)}
            </label>
            <p className="text-gray-500 mb-3 text-sm">
              {t('log.form.project.description', locale)}
            </p>
            <input
              type="text"
              id="project"
              name="project"
              value={formData.project}
              onChange={handleInputChange}
              placeholder={t('log.form.project.placeholder', locale)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="workTime" className="block mb-2 text-lg font-semibold text-gray-800">
              {t('log.form.workTime.label', locale)}
            </label>
            <p className="text-gray-500 mb-3 text-sm">
              {t('log.form.workTime.description', locale)}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="workHour"
                name="workHour"
                value={workHour}
                onChange={handleWorkHourChange}
                placeholder={t('log.form.workTime.hoursPlaceholder', locale)}
                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
              />
              <span>{t('log.form.workTime.hours', locale)}</span>
              <input
                type="number"
                id="workMinute"
                name="workMinute"
                value={workMinute}
                onChange={handleWorkMinuteChange}
                placeholder={t('log.form.workTime.minutesPlaceholder', locale)}
                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                max="59"
              />
              <span>{t('log.form.workTime.minutes', locale)}</span>
            </div>
          </div>
          
          <div className="mb-8">
            <label htmlFor="gains" className="block mb-2 text-lg font-semibold text-gray-800">
              {t('log.form.gains.label', locale)}
            </label>
            <p className="text-gray-500 mb-3 text-sm">
              {t('log.form.gains.description', locale)}
            </p>
            <textarea
              id="gains"
              name="gains"
              value={formData.gains}
              onChange={handleInputChange}
              placeholder={t('log.form.gains.placeholder', locale)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={5}
              required
              minLength={30}
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="challenges" className="block mb-2 text-lg font-semibold text-gray-800">
              {t('log.form.challenges.label', locale)}
            </label>
            <p className="text-gray-500 mb-3 text-sm">
              {t('log.form.challenges.description', locale)}
            </p>
            <textarea
              id="challenges"
              name="challenges"
              value={formData.challenges}
              onChange={handleInputChange}
              placeholder={t('log.form.challenges.placeholder', locale)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={5}
              required
              minLength={30}
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="plan" className="block mb-2 text-lg font-semibold text-gray-800">
              {t('log.form.plan.label', locale)}
            </label>
            <p className="text-gray-500 mb-3 text-sm">
              {t('log.form.plan.description', locale)}
            </p>
            <textarea
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleInputChange}
              placeholder={t('log.form.plan.placeholder', locale)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={5}
              required
              minLength={30}
            />
          </div>
          
          <div className="mt-10 flex gap-4">
            <button 
              type="submit" 
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300"
            >
              {t('edit.saveChanges', locale)}
            </button>
            <Link 
              href={`/${locale}/history`} 
              className="w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300"
            >
              {t('edit.cancel', locale)}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}