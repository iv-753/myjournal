'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { saveSessionLog, getSessionLogs, LogEntry } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { addCloudLog, getCloudLogs } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { t, Locale } from '@/lib/i18n';

type FormData = {
  project: string;
  workTime: {
    duration: string;
    unit: 'hours' | 'minutes';
  };
  gains: string;
  challenges: string;
  plan: string;
};

const initialFormData: FormData = {
  project: '',
  workTime: { duration: '', unit: 'hours' },
  gains: '',
  challenges: '',
  plan: '',
};

interface LogPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default function LogPage({ params }: LogPageProps) {
  const { locale } = use(params);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [workHour, setWorkHour] = useState('');
  const [workMinute, setWorkMinute] = useState('');
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  // 根据登录状态加载项目建议
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      if (user) {
        const cloudLogs = await getCloudLogs(user.id);
        const uniqueProjects = [
          ...new Set(cloudLogs.map(log => log.project.trim()).filter(Boolean))
        ];
        setProjectNames(uniqueProjects);
      } else {
        const sessionLogs = getSessionLogs();
        const uniqueProjects = [
          ...new Set(sessionLogs.map((log: LogEntry) => log.project.trim()).filter(Boolean))
        ];
        setProjectNames(uniqueProjects);
      }
      setLoading(false);
    }
    fetchProjects();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleWorkHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkHour(e.target.value.replace(/[^\d]/g, ''));
  };
  
  const handleWorkMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkMinute(e.target.value.replace(/[^\d]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hour = parseInt(workHour || '0', 10);
    const minute = parseInt(workMinute || '0', 10);
    const totalMinutes = hour * 60 + minute;
    
    if (!totalMinutes || totalMinutes <= 0) {
      alert(t('log.alerts.invalidWorkTime', locale));
      return;
    }
    
    if (formData.gains.length < 30 || formData.challenges.length < 30 || formData.plan.length < 30) {
      alert(t('log.alerts.minLength', locale));
      return;
    }
    
    if (user) {
      const success = await addCloudLog({
        ...formData,
        workTime: {
          duration: totalMinutes,
          unit: 'minutes',
        },
        createdAt: new Date().toISOString(),
      }, user.id);
      
      if (success) {
        alert(t('log.alerts.cloudSaveSuccess', locale));
        setFormData(initialFormData);
        setWorkHour('');
        setWorkMinute('');
      } else {
        alert(t('log.alerts.saveFailed', locale));
      }
    } else {
      const wasSaved = saveSessionLog({
        ...formData,
        workTime: {
          duration: totalMinutes,
          unit: 'minutes',
        }
      });
      
      if (wasSaved) {
        alert(t('log.alerts.sessionSaveSuccess', locale));
        setFormData(initialFormData);
        setWorkHour('');
        setWorkMinute('');
      } else {
        alert(t('log.alerts.saveFailed', locale));
      }
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8 my-8 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('log.title', locale)}
          </h1>
          <Link 
            href={`/${locale}/history`} 
            className="text-teal-500 hover:text-teal-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-100"
          >
            {t('log.viewHistory', locale)} &rarr;
          </Link>
        </div>
        
        {/* 未登录状态提示 */}
        {!user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {t('log.tempStorage.title', locale)}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>{t('log.tempStorage.description', locale)}</p>
                  <p className="mt-1">
                    <Link href={`/${locale}/login`} className="font-medium underline hover:text-blue-600">
                      {t('log.tempStorage.loginPrompt', locale)}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 加载中效果 */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            {t('common.loading', locale)}
          </div>
        ) : (
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
                list="project-suggestions"
              />
              <datalist id="project-suggestions">
                {projectNames.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
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
            
            <div className="mt-10">
              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300"
              >
                {t('log.form.submit', locale)}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}