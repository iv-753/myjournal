'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { saveLog, getLogs } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { addCloudLog, getCloudLogs } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type FormData = {
  project: string;
  workTime: {
    duration: string; // 统一为字符串类型
    unit: 'hours' | 'minutes';
  };
  gains: string;
  challenges:string;
  plan: string;
};

const initialFormData: FormData = {
  project: '',
  workTime: { duration: '', unit: 'hours' },
  gains: '',
  challenges: '',
  plan: '',
};

export default function LogPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [projectNames, setProjectNames] = useState<string[]>([]);
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

  // 根据登录状态加载项目建议
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      if (user) {
        // 登录，拉取云端日志
        const cloudLogs = await getCloudLogs(user.id);
        const uniqueProjects = [
          ...new Set(cloudLogs.map(log => log.project.trim()).filter(Boolean))
        ];
        setProjectNames(uniqueProjects);
      } else {
        // 未登录，拉取本地日志
        const historicalLogs = getLogs();
        const uniqueProjects = [
          ...new Set(historicalLogs.map(log => log.project.trim()).filter(Boolean))
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
  
  const handleWorkTimeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      workTime: {
        ...prev.workTime,
        [name]: value, // 直接存字符串
      },
    }));
  };

  // 提交表单，自动判断本地/云端
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('handleSubmit user:', user); // 调试用，查看当前 user 状态
    // 校验时转为数字
    const durationNum = Number(formData.workTime.duration);
    if (!durationNum || durationNum <= 0) {
      alert('请输入有效的工作时长！');
      return;
    }
    if (formData.gains.length < 30 || formData.challenges.length < 30 || formData.plan.length < 30) {
      alert('"今日收获"、"挑战与解法"和"明日计划"都需要填写至少30个字哦！');
      return;
    }
    if (user) {
      // 登录，保存到云端
      console.log('准备调用 addCloudLog', formData, user.id);
      const success = await addCloudLog({
        ...formData,
        workTime: {
          duration: durationNum, // 这里转为数字
          unit: formData.workTime.unit,
        },
        createdAt: new Date().toISOString(),
      }, user.id);
      console.log('addCloudLog 返回值:', success);
      if (success) {
        alert('日志已成功保存到云端！');
        setFormData(initialFormData);
      } else {
        alert('保存失败！今天您已经为这个项目提交过日志了。');
      }
    } else {
      // 未登录，保存到本地
      const wasSaved = saveLog({
        ...formData,
        workTime: {
          duration: Number(formData.workTime.duration),
          unit: formData.workTime.unit,
        }
      });
      if (wasSaved) {
        alert('日志已成功保存在您的浏览器中！');
        setFormData(initialFormData);
      } else {
        alert('保存失败！今天您已经为这个项目提交过日志了。');
      }
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      {/* 调试用：页面顶部显示 user 信息 */}
      {user && <pre style={{background:'#eee',padding:'8px',borderRadius:'6px',marginBottom:'16px'}}>{JSON.stringify(user, null, 2)}</pre>}
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8 my-8 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">每日日志</h1>
          <Link href="/history" className="text-teal-500 hover:text-teal-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-100">
            查看历史 &rarr;
          </Link>
        </div>
        {/* 加载中效果 */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">加载中...</div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label htmlFor="project" className="block mb-2 text-lg font-semibold text-gray-800">
              1、事项/项目
            </label>
            <p className="text-gray-500 mb-3 text-sm">今天主要在忙什么项目或任务？</p>
            <input
              type="text"
              id="project"
              name="project"
              value={formData.project}
              onChange={handleInputChange}
              placeholder="例如：开发XX项目的登录功能"
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
              2、今日工作时间
            </label>
            <p className="text-gray-500 mb-3 text-sm">预估一下今天投入了多长时间。</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="workTime"
                name="duration"
                value={formData.workTime.duration}
                onChange={handleWorkTimeChange}
                placeholder="例如：8"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                required
              />
              <select
                name="unit"
                value={formData.workTime.unit}
                onChange={handleWorkTimeChange}
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="hours">小时</option>
                <option value="minutes">分钟</option>
              </select>
            </div>
          </div>
          <div className="mb-8">
            <label htmlFor="gains" className="block mb-2 text-lg font-semibold text-gray-800">
              3、今日收获
            </label>
            <p className="text-gray-500 mb-3 text-sm">你今天有哪些新的领悟、技巧提升或重要认知？</p>
            <textarea
              id="gains"
              name="gains"
              value={formData.gains}
              onChange={handleInputChange}
              placeholder="请填写最少30字"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={5}
              required
              minLength={30}
            />
          </div>
          <div className="mb-8">
            <label htmlFor="challenges" className="block mb-2 text-lg font-semibold text-gray-800">
              4、遇到的挑战与解法
            </label>
            <p className="text-gray-500 mb-3 text-sm">今天在学习或实践中遇到了哪些卡点？你是如何尝试解决的？</p>
            <textarea
              id="challenges"
              name="challenges"
              value={formData.challenges}
              onChange={handleInputChange}
              placeholder="请填写最少30字"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={5}
              required
              minLength={30}
            />
          </div>
          <div className="mb-8">
            <label htmlFor="plan" className="block mb-2 text-lg font-semibold text-gray-800">
              5、明日计划
            </label>
            <p className="text-gray-500 mb-3 text-sm">计划一定要具体，写清楚具体要做哪些事情。</p>
            <textarea
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleInputChange}
              placeholder="请填写最少30字"
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
              保存日志
            </button>
          </div>
        </form>
        )}
      </div>
    </main>
  );
}