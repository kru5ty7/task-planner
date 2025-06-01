export const STATUSES = {
  TODO: { label: 'To Do', color: 'bg-gray-100 text-gray-800', icon: 'Circle' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: 'Clock' },
  DONE: { label: 'Done', color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
  BLOCKED: { label: 'Blocked', color: 'bg-red-100 text-red-800', icon: 'AlertCircle' }
};

export const PRIORITIES = {
  LOW: { label: 'Low', color: 'text-green-600' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-600' },
  HIGH: { label: 'High', color: 'text-orange-600' },
  CRITICAL: { label: 'Critical', color: 'text-red-600' }
};

export const STORAGE_KEY = 'taskPlannerData';
export const FOLDER_NAME = 'TaskPlannerBackups';
export const AUTO_SAVE_FILE = 'auto-save-backup.json';