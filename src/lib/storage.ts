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