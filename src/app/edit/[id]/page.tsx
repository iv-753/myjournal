'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLogById, updateLog, LogEntry } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { getCloudLogs, updateCloudLog } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

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

export default function EditPage() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [originalLog, setOriginalLog] = useState<LogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

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
    async function fetchLog() {
      setIsLoading(true);
    if (!id) return;
      if (user) {
        const cloudLogs = await getCloudLogs(user.id);
        const log = cloudLogs.find(l => l.id === id);
        if (log) {
          setOriginalLog(log);
          setFormData({
            project: log.project,
            workTime: {
              duration: log.workTime.duration,
              unit: log.workTime.unit
            },
            gains: log.gains,
            challenges: log.challenges,
            plan: log.plan
          });
        } else {
          setError('找不到指定的日志记录。');
        }
      } else {
    const log = getLogById(id);
    if (log) {
      setOriginalLog(log);
      setFormData({
        project: log.project,
        workTime: {
          duration: log.workTime.duration,
          unit: log.workTime.unit
        },
        gains: log.gains,
        challenges: log.challenges,
        plan: log.plan
      });
    } else {
      setError('找不到指定的日志记录。');
        }
    }
    setIsLoading(false);
    }
    fetchLog();
  }, [id, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    setFormData(prev => ({ ...prev!, [name]: value }));
  };

  const handleWorkTimeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      workTime: {
        ...prev!.workTime,
        [name]: name === 'duration' ? (value === '' ? '' : parseFloat(value)) : value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !originalLog) return;
    
    if (!formData.workTime.duration || formData.workTime.duration <= 0) {
      alert('请输入有效的工作时长！');
      return;
    }
    if (formData.gains.length < 30 || formData.challenges.length < 30 || formData.plan.length < 30) {
      alert('"今日收获"、"挑战与解法"和"明日计划"都需要填写至少30个字哦！');
      return;
    }

    const updatedLogData: LogEntry = {
      ...originalLog,
      ...formData,
      workTime: {
        duration: Number(formData.workTime.duration),
        unit: formData.workTime.unit,
      },
    };

    if (user) {
      const success = await updateCloudLog(updatedLogData, user.id);
      if (success) {
        alert('日志更新成功！');
        router.push('/history');
      } else {
        alert('更新失败！可能当天已存在同名项目的日志。');
      }
    } else {
    const wasUpdated = updateLog(updatedLogData);
    if (wasUpdated) {
      alert('日志更新成功！');
      router.push('/history');
    } else {
      alert('更新失败！可能当天已存在同名项目的日志。');
      }
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>{error}</p>
        <Link href="/history" className="mt-4 text-blue-500 hover:underline">返回历史记录</Link>
      </div>
    );
  }
  
  if (!formData) {
     return <div className="min-h-screen flex items-center justify-center">无法加载表单数据。</div>;
  }

  const FormField = ({ id, label, subLabel, placeholder, isTextarea = false }: { id: 'project' | 'gains' | 'challenges' | 'plan'; label: string; subLabel: string; placeholder: string; isTextarea?: boolean;}) => (
    <div className="mb-8">
      <label htmlFor={id} className="block mb-2 text-lg font-semibold text-gray-800">{label}</label>
      <p className="text-gray-500 mb-3 text-sm">{subLabel}</p>
      {isTextarea ? (
        <textarea id={id} name={id} value={formData[id]} onChange={handleInputChange} placeholder={placeholder} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={5} required minLength={30}/>
      ) : (
        <input type="text" id={id} name={id} value={formData[id]} onChange={handleInputChange} placeholder={placeholder} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required/>
      )}
    </div>
  );

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8 my-8 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">编辑日志</h1>
          <Link href="/history" className="text-teal-500 hover:text-teal-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-100">
            &larr; 返回历史
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <FormField
            id="project"
            label="1、事项/项目"
            subLabel="今天主要在忙什么项目或任务？"
            placeholder="例如：开发XX项目的登录功能"
          />
          <div className="mb-8">
            <label htmlFor="workTime" className="block mb-2 text-lg font-semibold text-gray-800">2、今日工作时间</label>
            <p className="text-gray-500 mb-3 text-sm">预估一下今天投入了多长时间。</p>
            <div className="flex items-center gap-2">
              <input type="number" id="workTime" name="duration" value={formData.workTime.duration} onChange={handleWorkTimeChange} placeholder="例如：8" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" min="0" required/>
              <select name="unit" value={formData.workTime.unit} onChange={handleWorkTimeChange} className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="hours">小时</option>
                <option value="minutes">分钟</option>
              </select>
            </div>
          </div>
          <div className="mb-8">
            <label htmlFor="gains" className="block mb-2 text-lg font-semibold text-gray-800">3、今日收获</label>
            <p className="text-gray-500 mb-3 text-sm">你今天有哪些新的领悟、技巧提升或重要认知？</p>
            <textarea id="gains" name="gains" value={formData.gains} onChange={handleInputChange} placeholder="请填写最少30字" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={5} required minLength={30}/>
          </div>
          <div className="mb-8">
            <label htmlFor="challenges" className="block mb-2 text-lg font-semibold text-gray-800">4、遇到的挑战与解法</label>
            <p className="text-gray-500 mb-3 text-sm">今天在学习或实践中遇到了哪些卡点？你是如何尝试解决的？</p>
            <textarea id="challenges" name="challenges" value={formData.challenges} onChange={handleInputChange} placeholder="请填写最少30字" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={5} required minLength={30}/>
          </div>
          <div className="mb-8">
            <label htmlFor="plan" className="block mb-2 text-lg font-semibold text-gray-800">5、明日计划</label>
            <p className="text-gray-500 mb-3 text-sm">计划一定要具体，写清楚具体要做哪些事情。</p>
            <textarea id="plan" name="plan" value={formData.plan} onChange={handleInputChange} placeholder="请填写最少30字" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={5} required minLength={30}/>
          </div>
          <div className="mt-10 flex gap-4">
            <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300">
              保存更改
            </button>
            <Link href="/history" className="w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300">
              取消
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
} 