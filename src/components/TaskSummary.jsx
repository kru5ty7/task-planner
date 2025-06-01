import React from 'react';
import { ToggleRight } from 'lucide-react';
import { isOverdue } from '../utils/taskUtils';
import { FOLDER_NAME, AUTO_SAVE_FILE } from '../constants/taskConstants';

const TaskSummary = ({ tasks, autoSaveEnabled }) => {
  // Calculate completion percentage
  const completionRate = tasks.length > 0 ? 
    Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : 0;

  // Calculate productivity metrics
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length;
  const overdueTasks = tasks.filter(t => isOverdue(t)).length;
  const totalAttachments = tasks.reduce((sum, t) => sum + (t.links?.length || 0) + (t.documents?.length || 0), 0);
  const avgAttachments = tasks.length > 0 ? Math.round((totalAttachments / tasks.length) * 10) / 10 : 0;

  // Get task priority distribution
  const priorityCounts = {
    CRITICAL: tasks.filter(t => t.priority === 'CRITICAL').length,
    HIGH: tasks.filter(t => t.priority === 'HIGH').length,
    MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
    LOW: tasks.filter(t => t.priority === 'LOW').length
  };

  return (
    <div className="mt-8 space-y-4">
      {/* Main Statistics */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">📊 Task Summary</h3>
        
        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500">Total Tasks:</span>
            <span className="ml-2 font-medium text-gray-900">{tasks.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Completed:</span>
            <span className="ml-2 font-medium text-green-600">
              {tasks.filter(t => t.status === 'DONE').length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">In Progress:</span>
            <span className="ml-2 font-medium text-blue-600">
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">To Do:</span>
            <span className="ml-2 font-medium text-gray-600">
              {tasks.filter(t => t.status === 'TODO').length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Blocked:</span>
            <span className="ml-2 font-medium text-red-600">
              {blockedTasks}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Overdue:</span>
            <span className="ml-2 font-medium text-red-600">
              {overdueTasks}
            </span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        {tasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t border-gray-100 pt-4">
          <div>
            <span className="text-gray-500">Total Links:</span>
            <span className="ml-2 font-medium text-blue-600">
              {tasks.reduce((sum, t) => sum + (t.links?.length || 0), 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Documents:</span>
            <span className="ml-2 font-medium text-green-600">
              {tasks.reduce((sum, t) => sum + (t.documents?.length || 0), 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Avg. Attachments/Task:</span>
            <span className="ml-2 font-medium text-purple-600">
              {avgAttachments}
            </span>
          </div>
        </div>

        {/* Priority Distribution */}
        {tasks.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Priority Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Critical:</span>
                <span className="font-medium text-red-600">{priorityCounts.CRITICAL}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">High:</span>
                <span className="font-medium text-orange-600">{priorityCounts.HIGH}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Medium:</span>
                <span className="font-medium text-yellow-600">{priorityCounts.MEDIUM}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Low:</span>
                <span className="font-medium text-green-600">{priorityCounts.LOW}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Productivity Insights */}
      {tasks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            💡 Productivity Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              {completionRate >= 80 && (
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-green-600">🎉</span>
                  <span>Excellent progress! {completionRate}% completion rate</span>
                </div>
              )}
              {overdueTasks > 0 && (
                <div className="flex items-center gap-2 text-red-700">
                  <span className="text-red-600">⚠️</span>
                  <span>{overdueTasks} task{overdueTasks > 1 ? 's' : ''} overdue - consider prioritizing</span>
                </div>
              )}
              {blockedTasks > 0 && (
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="text-orange-600">🚧</span>
                  <span>{blockedTasks} blocked task{blockedTasks > 1 ? 's' : ''} need attention</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {priorityCounts.CRITICAL > 0 && (
                <div className="flex items-center gap-2 text-red-700">
                  <span className="text-red-600">🔥</span>
                  <span>{priorityCounts.CRITICAL} critical task{priorityCounts.CRITICAL > 1 ? 's' : ''} requiring immediate attention</span>
                </div>
              )}
              {avgAttachments > 2 && (
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="text-blue-600">📎</span>
                  <span>Well-documented tasks with {avgAttachments} avg attachments</span>
                </div>
              )}
              {tasks.filter(t => t.status === 'IN_PROGRESS').length > 5 && (
                <div className="flex items-center gap-2 text-yellow-700">
                  <span className="text-yellow-600">⚡</span>
                  <span>Many tasks in progress - consider focusing efforts</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Auto-save Info */}
      {autoSaveEnabled && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <ToggleRight size={16} />
            <span className="font-medium">Auto-save is enabled</span>
            <span className="text-blue-600">• Data saves automatically • File backups every 30 seconds</span>
          </div>
        </div>
      )}
      
      {/* Storage Info */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">📁 File Organization:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div>• Manual backups: Downloads/<span className="font-mono text-xs bg-gray-200 px-1 rounded">{FOLDER_NAME}/manual-backup-YYYY-MM-DD-HH-MM-SS.json</span></div>
            <div>• Auto backups: Downloads/<span className="font-mono text-xs bg-gray-200 px-1 rounded">{FOLDER_NAME}/{AUTO_SAVE_FILE}</span></div>
            <div>• Browser storage: Automatically restored when you return</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSummary;