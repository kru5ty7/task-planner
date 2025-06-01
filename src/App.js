import React, { useState, useEffect } from 'react';
import { Plus, Save, Upload, ToggleLeft, ToggleRight, Trash2, Edit } from 'lucide-react';

// Import components
import TaskForm from './components/TaskForm';
import QuickAddSubtask from './components/QuickAddSubtask';
import QuickAddLink from './components/QuickAddLink';
import QuickAddDocument from './components/QuickAddDocument';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import TaskItem from './components/TaskItem';
import TaskSummary from './components/TaskSummary';
import ConfirmationModal from './components/ConfirmationModal';

// Import utilities and constants
import { generateId, generateLinkPreview, getSubTasks } from './utils/taskUtils';
import { STORAGE_KEY, FOLDER_NAME, AUTO_SAVE_FILE } from './constants/taskConstants';

const TaskPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  const [linkPreviews, setLinkPreviews] = useState({});
  const [documentPreview, setDocumentPreview] = useState({ show: false, document: null });
  const [addingLinkToTask, setAddingLinkToTask] = useState(null);
  const [addingDocToTask, setAddingDocToTask] = useState(null);
  const [addingSubtaskToTask, setAddingSubtaskToTask] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: '',
    onConfirm: null,
    type: 'danger'
  });

  // Function to show confirmation modal
  const showConfirmation = ({ title, message, itemName = '', onConfirm, type = 'danger' }) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      itemName,
      onConfirm,
      type
    });
  };

  // Function to hide confirmation modal
  const hideConfirmation = () => {
    setConfirmationModal({
      isOpen: false,
      title: '',
      message: '',
      itemName: '',
      onConfirm: null,
      type: 'danger'
    });
  };

  // Close document preview on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && documentPreview.show) {
        setDocumentPreview({ show: false, document: null });
      }
    };

    if (documentPreview.show) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [documentPreview.show]);

  // Auto-load data on app start
  useEffect(() => {
    const autoLoadData = () => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const data = JSON.parse(storedData);
          if (data.tasks && Array.isArray(data.tasks)) {
            setTasks(data.tasks);
            if (data.expandedTasks) {
              setExpandedTasks(new Set(data.expandedTasks));
            }
            if (data.autoSaveEnabled !== undefined) {
              setAutoSaveEnabled(data.autoSaveEnabled);
            }
            if (data.linkPreviews) {
              setLinkPreviews(data.linkPreviews);
            }
            setLastSaved(new Date(data.savedAt));
            setHasUnsavedChanges(false);
            console.log(`Auto-loaded ${data.tasks.length} tasks from browser storage`);
          }
        }
      } catch (error) {
        console.warn('Could not auto-load data from storage:', error);
      } finally {
        setIsLoading(false);
        setAutoLoadAttempted(true);
      }
    };

    const loadTimer = setTimeout(autoLoadData, 100);
    return () => clearTimeout(loadTimer);
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    if (autoLoadAttempted && tasks.length >= 0) {
      const saveToStorage = () => {
        try {
          setIsSaving(true);
          const dataToStore = {
            tasks,
            expandedTasks: Array.from(expandedTasks),
            autoSaveEnabled,
            linkPreviews,
            savedAt: new Date().toISOString(),
            version: '1.0'
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
          console.log('Data auto-saved to localStorage');
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.warn('Could not save to browser storage:', error);
        } finally {
          setTimeout(() => setIsSaving(false), 200);
        }
      };

      const storageTimer = setTimeout(saveToStorage, 500);
      return () => clearTimeout(storageTimer);
    }
  }, [tasks, expandedTasks, autoSaveEnabled, linkPreviews, autoLoadAttempted]);

  // Auto-save simulation for file downloads
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && tasks.length > 0) {
      const autoSaveTimer = setTimeout(() => {
        console.log('Auto-save triggered for file download');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }, 3000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [tasks, autoSaveEnabled, hasUnsavedChanges]);

  useEffect(() => {
    if (tasks.length > 0 && autoLoadAttempted) {
      setHasUnsavedChanges(true);
    }
  }, [tasks, autoLoadAttempted]);

  // Save to file
  const saveToFile = (isAutoSave = false) => {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0];
    const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    const dataToSave = {
      tasks,
      expandedTasks: Array.from(expandedTasks),
      autoSaveEnabled,
      savedAt: timestamp.toISOString(),
      version: '1.0',
      saveType: isAutoSave ? 'auto-save' : 'manual'
    };

    const dataStr = JSON.stringify(dataToSave, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    
    if (isAutoSave) {
      link.download = `${FOLDER_NAME}/${AUTO_SAVE_FILE}`;
    } else {
      link.download = `${FOLDER_NAME}/manual-backup-${dateStr}-${timeStr}.json`;
    }
    
    if (!isAutoSave) {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    URL.revokeObjectURL(link.href);
    setLastSaved(timestamp);
    setHasUnsavedChanges(false);
    
    if (!isAutoSave) {
      const fileName = link.download.split('/').pop();
      alert(`Tasks saved successfully!\nFile: ${fileName}\nLocation: Downloads/${FOLDER_NAME}/`);
    }
  };

  // Load from file
  const loadFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          if (data.expandedTasks) {
            setExpandedTasks(new Set(data.expandedTasks));
          }
          if (data.autoSaveEnabled !== undefined) {
            setAutoSaveEnabled(data.autoSaveEnabled);
          }
          setLastSaved(new Date(data.savedAt));
          setHasUnsavedChanges(false);
          
          const saveType = data.saveType ? ` (${data.saveType})` : '';
          alert(`Successfully loaded ${data.tasks.length} tasks${saveType}\nFrom: ${new Date(data.savedAt).toLocaleString()}`);
        } else {
          alert('Invalid file format. Please select a valid task planner backup file.');
        }
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Clear all data
  const clearAllData = () => {
    showConfirmation({
      title: 'Clear All Tasks',
      message: 'Are you sure you want to clear all tasks? This will remove all your tasks, subtasks, links, and documents.',
      type: 'danger',
      onConfirm: () => {
        setTasks([]);
        setExpandedTasks(new Set());
        setHasUnsavedChanges(false);
        setLastSaved(null);
        setLinkPreviews({});
        setDocumentPreview({ show: false, document: null });
        setShowNewTask(false);
        setEditingTask(null);
        
        // Clear localStorage
        try {
          localStorage.removeItem(STORAGE_KEY);
          console.log('localStorage cleared');
        } catch (error) {
          console.warn('Could not clear browser storage:', error);
        }
        
        hideConfirmation();
      }
    });
  };

  const toggleAutoSave = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
  };

  const createTask = (title, description, priority = 'MEDIUM', parentId = null, startDate = null, dueDate = null, links = [], documents = []) => {
    const newTask = {
      id: generateId(),
      title,
      description,
      status: 'TODO',
      priority,
      parentId,
      subTasks: [],
      startDate,
      dueDate,
      links: links || [],
      documents: documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => {
      const updated = [...prev, newTask];
      if (parentId) {
        return updated.map(task => 
          task.id === parentId 
            ? { ...task, subTasks: [...task.subTasks, newTask.id] }
            : task
        );
      }
      return updated;
    });

    return newTask.id;
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const deleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task && task.subTasks.length > 0) {
      task.subTasks.forEach(subTaskId => deleteTask(subTaskId));
    }
    
    setTasks(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return filtered.map(t => ({
        ...t,
        subTasks: t.subTasks.filter(subId => subId !== id)
      }));
    });
  };

  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Show loading screen while auto-loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Task Planner</h2>
          <p className="text-gray-600">Restoring your data...</p>
        </div>
      </div>
    );
  }

  const rootTasks = tasks.filter(task => !task.parentId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Planner</h1>
          <p className="text-gray-600">Organize your work with tasks and subtasks</p>
          
          {/* Save Status Indicator */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            {isSaving && (
              <span className="text-blue-600 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            )}
            {!isSaving && lastSaved && (
              <span className="text-green-600 flex items-center gap-1">
                ✓ Saved: {lastSaved.toLocaleString()}
              </span>
            )}
            {!isSaving && hasUnsavedChanges && (
              <span className="text-orange-600 font-medium">● Unsaved changes</span>
            )}
            {autoLoadAttempted && tasks.length === 0 && !lastSaved && (
              <span className="text-blue-600">🆕 Welcome! Start by creating your first task.</span>
            )}
            {autoLoadAttempted && tasks.length > 0 && lastSaved && (
              <span className="text-gray-500 text-xs">
                📱 Data automatically saves to your browser
              </span>
            )}
          </div>
        </div>
        
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus size={20} />
            New Task
          </button>
          
          <button
            onClick={() => saveToFile(false)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Save size={20} />
            Save to File
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
            <Upload size={20} />
            Load from File
            <input
              type="file"
              accept=".json"
              onChange={loadFromFile}
              className="hidden"
            />
          </label>
          
          <button
            onClick={toggleAutoSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
              autoSaveEnabled 
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            {autoSaveEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            Auto-save {autoSaveEnabled ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={clearAllData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <Trash2 size={20} />
            Clear All
          </button>
        </div>
        
        {showNewTask && (
          <div className="mb-6">
            <TaskForm
              onSubmit={(taskData) => {
                createTask(
                  taskData.title, 
                  taskData.description, 
                  taskData.priority, 
                  null, 
                  taskData.startDate, 
                  taskData.dueDate,
                  taskData.links,
                  taskData.documents
                );
                setShowNewTask(false);
              }}
              onCancel={() => setShowNewTask(false)}
            />
          </div>
        )}
        
        <div className="space-y-4">
          {rootTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tasks yet. Create your first task to get started!</p>
            </div>
          ) : (
            rootTasks.map(task => (
              <div key={task.id}>
                <TaskItem
                  task={task}
                  tasks={tasks}
                  expandedTasks={expandedTasks}
                  linkPreviews={linkPreviews}
                  hoveredLink={hoveredLink}
                  setHoveredLink={setHoveredLink}
                  setAddingSubtaskToTask={setAddingSubtaskToTask}
                  setAddingLinkToTask={setAddingLinkToTask}
                  setAddingDocToTask={setAddingDocToTask}
                  setEditingTask={setEditingTask}
                  setDocumentPreview={setDocumentPreview}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  toggleExpanded={toggleExpanded}
                  generateLinkPreview={(linkId, url) => generateLinkPreview(linkId, url, setLinkPreviews)}
                  showConfirmation={showConfirmation}
                  addingSubtaskToTask={addingSubtaskToTask}
                  addingLinkToTask={addingLinkToTask}
                  addingDocToTask={addingDocToTask}
                  editingTask={editingTask}
                />
                
                {/* Quick Add Forms */}
                {addingSubtaskToTask === task.id && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Plus size={16} className="text-purple-600" />
                      Add New Subtask
                    </h4>
                    <QuickAddSubtask 
                      parentTaskId={task.id}
                      createTask={createTask}
                      onComplete={() => {
                        setAddingSubtaskToTask(null);
                        setExpandedTasks(prev => new Set([...prev, task.id]));
                      }}
                      onCancel={() => setAddingSubtaskToTask(null)}
                    />
                  </div>
                )}
                
                {addingLinkToTask === task.id && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Plus size={16} className="text-blue-600" />
                      Add New Link
                    </h4>
                    <QuickAddLink 
                      taskId={task.id}
                      tasks={tasks}
                      updateTask={updateTask}
                      onComplete={() => setAddingLinkToTask(null)}
                      onCancel={() => setAddingLinkToTask(null)}
                    />
                  </div>
                )}

                {addingDocToTask === task.id && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Plus size={16} className="text-green-600" />
                      Add New Document
                    </h4>
                    <QuickAddDocument 
                      taskId={task.id}
                      tasks={tasks}
                      updateTask={updateTask}
                      onComplete={() => setAddingDocToTask(null)}
                      onCancel={() => setAddingDocToTask(null)}
                    />
                  </div>
                )}
                
                {/* Edit Main Task Form */}
                {editingTask === task.id && (
                  <div className="mt-4">
                    <TaskForm
                      task={task}
                      onSubmit={(updates) => {
                        updateTask(task.id, updates);
                        setEditingTask(null);
                      }}
                      onCancel={() => setEditingTask(null)}
                    />
                  </div>
                )}
                
                {/* Edit Subtask Forms - Check if any subtask is being edited */}
                {task.subTasks && task.subTasks.includes(editingTask) && (
                  <div className="mt-4 ml-4">
                    {(() => {
                      const subtaskToEdit = tasks.find(t => t.id === editingTask);
                      if (!subtaskToEdit) return null;
                      
                      return (
                        <div className="p-4 bg-purple-50 border border-purple-300 rounded-lg">
                          <h4 className="text-sm font-medium text-purple-800 mb-3 flex items-center gap-2">
                            <Edit size={16} />
                            Edit Subtask: {subtaskToEdit.title}
                          </h4>
                          <TaskForm
                            task={subtaskToEdit}
                            onSubmit={(updates) => {
                              updateTask(editingTask, updates);
                              setEditingTask(null);
                            }}
                            onCancel={() => setEditingTask(null)}
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {rootTasks.length > 0 && (
          <TaskSummary tasks={tasks} autoSaveEnabled={autoSaveEnabled} />
        )}
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal 
        documentPreview={documentPreview}
        setDocumentPreview={setDocumentPreview}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        itemName={confirmationModal.itemName}
        type={confirmationModal.type}
        onConfirm={() => {
          if (confirmationModal.onConfirm) {
            confirmationModal.onConfirm();
          }
        }}
        onCancel={hideConfirmation}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default TaskPlanner;