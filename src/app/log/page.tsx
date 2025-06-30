'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { saveLog, getLogs } from '@/lib/storage';

type FormData = {
  project: string;
  workTime: {
    duration: number | ''; // Allow empty string for input state
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

export default function LogPage() { // Renamed component
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [projectNames, setProjectNames] = useState<string[]>([]);

  useEffect(() => {
    // On component mount, load existing logs to populate project suggestions
    const historicalLogs = getLogs();
    const uniqueProjects = [
      ...new Set(historicalLogs.map(log => log.project.trim()).filter(Boolean))
    ];
    setProjectNames(uniqueProjects);
  }, []);

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
        [name]: name === 'duration' ? (value === '' ? '' : parseFloat(value)) : value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.workTime.duration || formData.workTime.duration <= 0) {
      alert('请输入有效的工作时长！');
      return;
    }
    if (formData.gains.length < 30 || formData.challenges.length < 30 || formData.plan.length < 30) {
      alert('"今日收获"、"挑战与解法"和"明日计划"都需要填写至少30个字哦！');
      return;
    }

    const wasSaved = saveLog({
      ...formData,
      workTime: {
        duration: Number(formData.workTime.duration),
        unit: formData.workTime.unit,
      }
    });

    if (wasSaved) {
      alert('日志已成功保存在您的浏览器中！');
      setFormData(initialFormData); // Reset form after submission
    } else {
      alert('保存失败！今天您已经为这个项目提交过日志了。');
    }
  };

  const FormField = ({
    id,
    label,
    subLabel,
    placeholder,
    isTextarea = false,
  }: {
    id: 'gains' | 'challenges' | 'plan';
    label: string;
    subLabel: string;
    placeholder: string;
    isTextarea?: boolean;
  }) => (
    <div className="mb-8">
      <label htmlFor={id} className="block mb-2 text-lg font-semibold text-gray-800">
        {label}
      </label>
      <p className="text-gray-500 mb-3 text-sm">{subLabel}</p>
      {isTextarea ? (
        <textarea
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows={5}
          required
          minLength={30}
        />
      ) : (
        <input
          type="text"
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      )}
    </div>
  );

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8 my-8 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">每日日志</h1>
          <Link href="/history" className="text-teal-500 hover:text-teal-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-100">
            查看历史 &rarr;
          </Link>
        </div>
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
          
          <FormField
            id="gains"
            label="3、今日收获"
            subLabel="你今天有哪些新的领悟、技巧提升或重要认知？"
            placeholder="请填写最少30字"
            isTextarea
          />
          
          <FormField
            id="challenges"
            label="4、遇到的挑战与解法"
            subLabel="今天在学习或实践中遇到了哪些卡点？你是如何尝试解决的？"
            placeholder="请填写最少30字"
            isTextarea
          />

          <FormField
            id="plan"
            label="5、明日计划"
            subLabel="计划一定要具体，写清楚具体要做哪些事情。"
            placeholder="请填写最少30字"
            isTextarea
          />

          <div className="mt-10">
            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300"
            >
              保存日志
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 