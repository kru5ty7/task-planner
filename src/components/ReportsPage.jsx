import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target, 
  Users, 
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { STATUSES, PRIORITIES } from '../constants/taskConstants';
import { 
  formatDate, 
  getTasksByDateRange, 
  getTasksByStatus, 
  getTasksByPriority,
  getOverdueTasks,
  getTasksCompletedInPeriod,
  getProductivityMetrics,
  getTaskDurationStats,
  isOverdue
} from '../utils/taskUtils';

const ReportsPage = ({ tasks, onBack }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    priority: 'all',
    dateField: 'createdAt'
  });

  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    productivity: true,
    timeline: true,
    detailed: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = getTasksByDateRange(tasks, dateRange.start, dateRange.end, activeFilters.dateField);
    
    if (activeFilters.status !== 'all') {
      filtered = getTasksByStatus(filtered, activeFilters.status);
    }
    
    if (activeFilters.priority !== 'all') {
      filtered = getTasksByPriority(filtered, activeFilters.priority);
    }
    
    return filtered;
  }, [tasks, dateRange, activeFilters]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const productivity = getProductivityMetrics(filteredTasks);
    const overdue = getOverdueTasks(filteredTasks);
    const recentlyCompleted = getTasksCompletedInPeriod(filteredTasks, 7);
    const durationStats = getTaskDurationStats(filteredTasks);
    
    return {
      productivity,
      overdue,
      recentlyCompleted,
      durationStats
    };
  }, [filteredTasks]);

  // Calculate task creation timeline
  const taskTimeline = useMemo(() => {
    const timeline = {};
    
    filteredTasks.forEach(task => {
      const date = new Date(task[activeFilters.dateField]).toISOString().split('T')[0];
      if (!timeline[date]) {
        timeline[date] = { created: 0, completed: 0 };
      }
      
      if (activeFilters.dateField === 'createdAt') {
        timeline[date].created++;
      }
      
      if (task.status === 'DONE') {
        const completedDate = new Date(task.updatedAt).toISOString().split('T')[0];
        if (!timeline[completedDate]) {
          timeline[completedDate] = { created: 0, completed: 0 };
        }
        timeline[completedDate].completed++;
      }
    });
    
    return Object.entries(timeline)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-14); // Last 14 days
  }, [filteredTasks, activeFilters.dateField]);

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      filters: activeFilters,
      metrics,
      tasks: filteredTasks.map(task => ({
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignedDate: task.assignedDate,
        startDate: task.startDate,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        isOverdue: isOverdue(task)
      }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
              >
                ← Back to Tasks
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BarChart3 size={32} className="text-blue-600" />
                Task Reports & Analytics
              </h1>
              <p className="text-gray-600">Insights and metrics for your task management</p>
            </div>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={20} />
              Export Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={20} />
            Filters & Date Range
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Field</label>
              <select
                value={activeFilters.dateField}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, dateField: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="assignedDate">Assigned Date</option>
                <option value="startDate">Start Date</option>
                <option value="dueDate">Due Date</option>
                <option value="updatedAt">Updated Date</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={activeFilters.status}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {Object.entries(STATUSES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={activeFilters.priority}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                {Object.entries(PRIORITIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target size={20} />
              Overview Metrics
            </h3>
            <button
              onClick={() => toggleSection('overview')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.overview ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          
          {expandedSections.overview && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.productivity.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.productivity.completed}</p>
                    <p className="text-sm text-green-600">{metrics.productivity.completionRate}% completion rate</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.productivity.inProgress}</p>
                    <p className="text-sm text-orange-600">{metrics.productivity.progressRate}% of total</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.overdue.length}</p>
                    <p className="text-sm text-red-600">Needs attention</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar size={24} className="text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Productivity Insights */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} />
              Productivity Insights
            </h3>
            <button
              onClick={() => toggleSection('productivity')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.productivity ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          
          {expandedSections.productivity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Completion Progress</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Tasks</span>
                    <span className="text-sm font-medium">{metrics.productivity.completed}/{metrics.productivity.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.productivity.completionRate}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-green-600">{metrics.productivity.completionRate}%</span>
                    <p className="text-sm text-gray-500">Overall completion rate</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Task Duration Analytics</h4>
                {metrics.durationStats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Duration:</span>
                      <span className="text-sm font-medium">{metrics.durationStats.average} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fastest Completion:</span>
                      <span className="text-sm font-medium text-green-600">{metrics.durationStats.minimum} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Longest Duration:</span>
                      <span className="text-sm font-medium text-red-600">{metrics.durationStats.maximum} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tasks Analyzed:</span>
                      <span className="text-sm font-medium">{metrics.durationStats.count}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No duration data available</p>
                    <p className="text-gray-400 text-xs mt-1">Tasks need assigned dates and completion status</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Task Timeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              Task Timeline (Last 14 Days)
            </h3>
            <button
              onClick={() => toggleSection('timeline')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.timeline ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          
          {expandedSections.timeline && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="flex justify-center gap-2 mb-4">
                    {taskTimeline.map(([date, data]) => (
                      <div key={date} className="text-center flex-1 max-w-20">
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="bg-blue-500 rounded text-white text-xs py-1 min-h-5 flex items-center justify-center"
                            style={{ height: `${Math.max(20, data.created * 8)}px` }}
                            title={`${data.created} created`}
                          >
                            {data.created > 0 && data.created}
                          </div>
                          <div 
                            className="bg-green-500 rounded text-white text-xs py-1 min-h-5 flex items-center justify-center"
                            style={{ height: `${Math.max(20, data.completed * 8)}px` }}
                            title={`${data.completed} completed`}
                          >
                            {data.completed > 0 && data.completed}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-600">Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Task List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye size={20} />
              Detailed Task List ({filteredTasks.length} tasks)
            </h3>
            <button
              onClick={() => toggleSection('detailed')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.detailed ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          
          {expandedSections.detailed && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map(task => {
                      const duration = task.assignedDate && task.status === 'DONE' 
                        ? Math.ceil((new Date(task.updatedAt) - new Date(task.assignedDate)) / (1000 * 60 * 60 * 24))
                        : null;
                      
                      return (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUSES[task.status].color}`}>
                              {STATUSES[task.status].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${PRIORITIES[task.priority].color}`}>
                              {PRIORITIES[task.priority].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {task.assignedDate ? formatDate(task.assignedDate) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                                {task.dueDate ? formatDate(task.dueDate) : '-'}
                              </span>
                              {isOverdue(task) && (
                                <span className="text-xs text-red-500">Overdue</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {duration ? (
                              <span className={duration <= 3 ? 'text-green-600' : duration <= 7 ? 'text-yellow-600' : 'text-red-600'}>
                                {duration} days
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              {task.links && task.links.length > 0 && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {task.links.length} Links
                                </span>
                              )}
                              {task.documents && task.documents.length > 0 && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  {task.documents.length} Docs
                                </span>
                              )}
                              {task.subTasks && task.subTasks.length > 0 && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                  {task.subTasks.length} Subtasks
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No tasks found matching the current filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Recent Activity (Last 7 Days)
          </h3>
          
          <div className="space-y-3">
            {metrics.recentlyCompleted.slice(0, 10).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <span className="font-medium text-gray-900">{task.title}</span>
                    <span className="text-sm text-gray-500 ml-2">completed</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(task.updatedAt)}
                </span>
              </div>
            ))}
            
            {metrics.recentlyCompleted.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500">No tasks completed in the last 7 days.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;