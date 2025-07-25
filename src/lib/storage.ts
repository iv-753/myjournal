// A simple type definition for our form data
export type WorkTime = {
  duration: number;
  unit: 'minutes' | 'hours';
};

export type LogEntry = {
  id: string; // Unique ID for each entry
  createdAt: string; // ISO string date
  project: string;
  workTime: WorkTime;
  gains: string;
  challenges: string;
  plan: string;
};

const STORAGE_KEY = 'daily-logs';

/**
 * Retrieves all log entries from localStorage.
 * Returns an empty array if no logs are found or if there's an error.
 */
export function getLogs(): LogEntry[] {
  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    return JSON.parse(rawData) as LogEntry[];
  } catch (error) {
    console.error('Failed to parse logs from localStorage', error);
    return [];
  }
}

/**
 * Retrieves a single log entry by its ID.
 * @param id The ID of the log to retrieve.
 * @returns The found log entry, or undefined if not found.
 */
export function getLogById(id: string): LogEntry | undefined {
  try {
    const logs = getLogs();
    return logs.find(log => log.id === id);
  } catch (error) {
    console.error('Failed to get log by ID from localStorage', error);
    return undefined;
  }
}

/**
 * Saves a new log entry to localStorage.
 * It adds the new log to the existing list of logs.
 * @param newLog - The new log entry to save (without id and createdAt).
 * @returns {boolean} - True if saved successfully, false if a duplicate was found.
 */
export function saveLog(newLog: Omit<LogEntry, 'id' | 'createdAt'>): boolean {
  try {
    const existingLogs = getLogs();
    const today = new Date().toDateString(); // Gets "Mon Sep 23 2024" format

    const isDuplicate = existingLogs.some(log => 
      log.project.trim() === newLog.project.trim() &&
      new Date(log.createdAt).toDateString() === today
    );

    if (isDuplicate) {
      console.warn('Duplicate log entry for this project today.');
      return false;
    }

    const logToAdd: LogEntry = {
      ...newLog,
      id: Date.now().toString(), // Use a URL-safe timestamp as the ID
      createdAt: new Date().toISOString(),
    };
    const updatedLogs = [...existingLogs, logToAdd];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Failed to save log to localStorage', error);
    return false;
  }
}

/**
 * Updates an existing log entry.
 * @param updatedLog The full log entry object with updated data.
 * @returns {boolean} - True if updated successfully, false if a conflict is found.
 */
export function updateLog(updatedLog: LogEntry): boolean {
  try {
    const existingLogs = getLogs();
    const logDate = new Date(updatedLog.createdAt).toDateString();

    // Check for conflicts: another log with the same project name on the same day, but with a different ID.
    const hasConflict = existingLogs.some(log => 
      log.id !== updatedLog.id &&
      log.project.trim() === updatedLog.project.trim() &&
      new Date(log.createdAt).toDateString() === logDate
    );

    if (hasConflict) {
      console.warn('Update failed: A log for this project already exists on this day.');
      return false;
    }

    const logIndex = existingLogs.findIndex(log => log.id === updatedLog.id);
    if (logIndex === -1) {
      console.error('Update failed: Log to update not found.');
      return false; // Should not happen in normal flow
    }

    const updatedLogs = [...existingLogs];
    updatedLogs[logIndex] = updatedLog;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Failed to update log in localStorage', error);
    return false;
  }
}

/**
 * Deletes a log entry from localStorage by its ID.
 * @param logId The ID of the log to delete.
 */
export function deleteLog(logId: string): void {
  try {
    const existingLogs = getLogs();
    const updatedLogs = existingLogs.filter((log) => log.id !== logId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Failed to delete log from localStorage', error);
  }
}

// 获取本地所有日志
export function getLocalLogs(): LogEntry[] {
  // 从 localStorage 读取 logs，若不存在则返回空数组
  const logs = localStorage.getItem('logs');
  return logs ? JSON.parse(logs) : [];
}

// 保存所有日志到本地
export function setLocalLogs(logs: LogEntry[]) {
  // 将日志数组转为 JSON 字符串存储到 localStorage
  localStorage.setItem('logs', JSON.stringify(logs));
}

// 清空本地日志
export function clearLocalLogs() {
  // 移除 localStorage 中的 logs 项
  localStorage.removeItem('logs');
}

// 判断本地是否有日志
export function hasLocalLogs(): boolean {
  // 判断 localStorage 中 logs 是否存在且不为空
  const logs = getLocalLogs();
  return logs.length > 0;
} 

// 会话存储相关函数（用于未登录用户）
const SESSION_STORAGE_KEY = 'temp-logs';

/**
 * 获取会话存储中的临时日志
 * 这些日志在关闭浏览器标签页后会自动清除
 */
export function getSessionLogs(): LogEntry[] {
  try {
    if (typeof window === 'undefined') return [];
    const rawData = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    return JSON.parse(rawData) as LogEntry[];
  } catch (error) {
    console.error('Failed to parse logs from sessionStorage', error);
    return [];
  }
}

/**
 * 保存日志到会话存储（用于未登录用户）
 */
export function saveSessionLog(newLog: Omit<LogEntry, 'id' | 'createdAt'>): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const existingLogs = getSessionLogs();
    const today = new Date().toDateString();

    const isDuplicate = existingLogs.some(log => 
      log.project.trim() === newLog.project.trim() &&
      new Date(log.createdAt).toDateString() === today
    );

    if (isDuplicate) {
      console.warn('Duplicate log entry for this project today.');
      return false;
    }

    const logToAdd: LogEntry = {
      ...newLog,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedLogs = [...existingLogs, logToAdd];
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Failed to save log to sessionStorage', error);
    return false;
  }
}

/**
 * 更新会话存储中的日志
 */
export function updateSessionLog(updatedLog: LogEntry): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const existingLogs = getSessionLogs();
    const logDate = new Date(updatedLog.createdAt).toDateString();

    const hasConflict = existingLogs.some(log => 
      log.id !== updatedLog.id &&
      log.project.trim() === updatedLog.project.trim() &&
      new Date(log.createdAt).toDateString() === logDate
    );

    if (hasConflict) {
      console.warn('Update failed: A log for this project already exists on this day.');
      return false;
    }

    const logIndex = existingLogs.findIndex(log => log.id === updatedLog.id);
    if (logIndex === -1) {
      console.error('Update failed: Log to update not found.');
      return false;
    }

    const updatedLogs = [...existingLogs];
    updatedLogs[logIndex] = updatedLog;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedLogs));
    return true;
  } catch (error) {
    console.error('Failed to update log in sessionStorage', error);
    return false;
  }
}

/**
 * 删除会话存储中的日志
 */
export function deleteSessionLog(logId: string): void {
  try {
    if (typeof window === 'undefined') return;
    const existingLogs = getSessionLogs();
    const updatedLogs = existingLogs.filter((log) => log.id !== logId);
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Failed to delete log from sessionStorage', error);
  }
}

/**
 * 清空会话存储中的日志
 */
export function clearSessionLogs(): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session logs', error);
  }
}

/**
 * 检查会话存储中是否有日志
 */
export function hasSessionLogs(): boolean {
  const logs = getSessionLogs();
  return logs.length > 0;
}

/**
 * 下载会话日志为JSON文件
 */
export function downloadSessionLogs(): void {
  try {
    const logs = getSessionLogs();
    if (logs.length === 0) {
      alert('没有可下载的日志');
      return;
    }

    const blob = new Blob([JSON.stringify(logs, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download session logs', error);
    alert('下载失败');
  }
} 