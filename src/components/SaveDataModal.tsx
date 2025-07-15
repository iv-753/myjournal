'use client';

import { useState } from 'react';
import { getSessionLogs, clearSessionLogs, downloadSessionLogs } from '@/lib/storage';
import { addCloudLog } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface SaveDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function SaveDataModal({ isOpen, onClose, user }: SaveDataModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<'save' | 'download' | 'discard' | null>(null);

  if (!isOpen) return null;

  const sessionLogs = getSessionLogs();
  const logsCount = sessionLogs.length;

  const handleSaveToCloud = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setAction('save');
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      // 批量上传日志到云端
      for (const log of sessionLogs) {
        const success = await addCloudLog(log, user.id);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }
      
      // 清空会话存储
      clearSessionLogs();
      
      // 显示结果
      if (failCount === 0) {
        alert(`成功保存 ${successCount} 条日志到云端！`);
      } else {
        alert(`保存完成：成功 ${successCount} 条，失败 ${failCount} 条`);
      }
      
      onClose();
    } catch (error) {
      console.error('保存到云端失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleDownload = () => {
    setAction('download');
    downloadSessionLogs();
    clearSessionLogs();
    alert('日志已下载，会话数据已清除');
    onClose();
    setAction(null);
  };

  const handleDiscard = () => {
    setAction('discard');
    clearSessionLogs();
    alert('会话数据已清除');
    onClose();
    setAction(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            检测到未保存的日志
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            发现 {logsCount} 条临时日志，请选择处理方式：
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleSaveToCloud}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading && action === 'save' ? '保存中...' : '保存到云端'}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded-lg transition-colors"
            >
              下载为文件
            </button>
            
            <button
              onClick={handleDiscard}
              disabled={isLoading}
              className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
            >
              丢弃数据
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>• 保存到云端：数据将永久保存，可在多设备访问</p>
            <p>• 下载为文件：保存为JSON文件到本地</p>
            <p>• 丢弃数据：永久删除这些临时日志</p>
          </div>
        </div>
      </div>
    </div>
  );
} 