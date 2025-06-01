import React from 'react';
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, Link, FileText, Eye, ExternalLink, Download } from 'lucide-react';
import { STATUSES, PRIORITIES } from '../constants/taskConstants';
import { formatDate, isOverdue, getDaysUntilDue, getSubTasks } from '../utils/taskUtils';

const TaskItem = ({ 
  task, 
  tasks,
  expandedTasks,
  linkPreviews,
  hoveredLink,
  setHoveredLink,
  setAddingSubtaskToTask,
  setAddingLinkToTask,
  setAddingDocToTask,
  setEditingTask,
  setDocumentPreview,
  updateTask,
  deleteTask,
  toggleExpanded,
  generateLinkPreview,
  showConfirmation,
  addingSubtaskToTask,
  addingLinkToTask,
  addingDocToTask,
  editingTask
}) => {
  const StatusIcon = STATUSES[task.status].icon === 'Circle' ? () => <div className="w-4 h-4 border-2 border-gray-600 rounded-full"></div> :
                    STATUSES[task.status].icon === 'Clock' ? () => <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> :
                    STATUSES[task.status].icon === 'CheckCircle' ? () => <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div> :
                    () => <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">!</div>;

  // State for collapsible sections and inline editing
  const [expandedSections, setExpandedSections] = React.useState({
    subtasks: true,
    links: true,
    documents: true
  });
  
  const [editingStates, setEditingStates] = React.useState({
    description: false,
    assignedDate: false,
    startDate: false,
    dueDate: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleEditing = (field, value = null) => {
    setEditingStates(prev => ({
      ...prev,
      [field]: value !== null ? value : !prev[field]
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {/* Interactive Status Icon */}
            <button
              onClick={() => {
                const statusKeys = Object.keys(STATUSES);
                const currentIndex = statusKeys.indexOf(task.status);
                const nextIndex = (currentIndex + 1) % statusKeys.length;
                const nextStatus = statusKeys[nextIndex];
                updateTask(task.id, { status: nextStatus });
              }}
              className="hover:scale-110 transition-transform cursor-pointer"
              title={`Click to change status (current: ${STATUSES[task.status].label})`}
            >
              <StatusIcon />
            </button>
            
            {/* Editable Title */}
            <h3 
              className="font-medium text-gray-900 hover:bg-gray-50 px-1 py-0.5 rounded cursor-text flex-1"
              contentEditable
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const newTitle = e.target.textContent.trim();
                if (newTitle && newTitle !== task.title) {
                  updateTask(task.id, { title: newTitle });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.target.blur();
                }
              }}
              title="Click to edit title"
            >
              {task.title}
            </h3>
            
            {/* Interactive Status Badge */}
            <select
              value={task.status}
              onChange={(e) => updateTask(task.id, { status: e.target.value })}
              className={`text-xs px-2 py-1 rounded-full border-none cursor-pointer hover:opacity-80 ${STATUSES[task.status].color}`}
              title="Click to change status"
            >
              {Object.entries(STATUSES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            {/* Interactive Priority Badge */}
            <select
              value={task.priority}
              onChange={(e) => updateTask(task.id, { priority: e.target.value })}
              className={`text-xs font-medium border-none bg-transparent cursor-pointer hover:opacity-80 ${PRIORITIES[task.priority].color}`}
              title="Click to change priority"
            >
              {Object.entries(PRIORITIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            {isOverdue(task) && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                Overdue
              </span>
            )}
          </div>
          
          {/* Status Progress Bar for In Progress tasks */}
          {task.status === 'IN_PROGRESS' && (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <span className="text-xs text-blue-600 font-medium">In Progress</span>
              </div>
            </div>
          )}
          
          {/* Status Progress Bar for Done tasks */}
          {task.status === 'DONE' && (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="text-xs text-green-600 font-medium">Completed</span>
              </div>
            </div>
          )}
          
          {/* Status Progress Bar for Blocked tasks */}
          {task.status === 'BLOCKED' && (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
                <span className="text-xs text-red-600 font-medium">Blocked</span>
              </div>
            </div>
          )}
          <div className="mb-2">
            {task.description ? (
              <p 
                className="text-gray-600 text-sm hover:bg-gray-50 px-1 py-0.5 rounded cursor-text"
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const newDescription = e.target.textContent.trim();
                  if (newDescription !== task.description) {
                    updateTask(task.id, { description: newDescription });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.target.blur();
                  }
                }}
                title="Click to edit description (Shift+Enter for new line)"
              >
                {task.description}
              </p>
            ) : (
              <button
                onClick={(e) => {
                  const p = document.createElement('p');
                  p.className = "text-gray-600 text-sm hover:bg-gray-50 px-1 py-0.5 rounded cursor-text";
                  p.contentEditable = true;
                  p.textContent = "Add description...";
                  p.onblur = (e) => {
                    const newDescription = e.target.textContent.trim();
                    if (newDescription && newDescription !== "Add description...") {
                      updateTask(task.id, { description: newDescription });
                    }
                  };
                  e.target.replaceWith(p);
                  p.focus();
                  
                  // Select all text
                  const range = document.createRange();
                  range.selectNodeContents(p);
                  const sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
                }}
                className="text-gray-400 text-sm hover:text-gray-600 hover:bg-gray-50 px-1 py-0.5 rounded cursor-pointer"
                title="Click to add description"
              >
                + Add description...
              </button>
            )}
          </div>
          
          {/* Interactive Date Information */}
          <div className="flex flex-wrap items-center gap-4 mb-2">
            {/* Editable Assigned Date */}
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="font-medium">Assigned:</span>
              {task.assignedDate ? (
                <input
                  type="date"
                  value={task.assignedDate}
                  onChange={(e) => updateTask(task.id, { assignedDate: e.target.value || null })}
                  className="border-none bg-transparent text-xs text-gray-600 cursor-pointer hover:bg-gray-50 rounded px-1"
                  title="Click to change assigned date"
                />
              ) : editingStates.assignedDate ? (
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      updateTask(task.id, { assignedDate: e.target.value });
                    }
                    toggleEditing('assignedDate', false);
                  }}
                  onBlur={() => toggleEditing('assignedDate', false)}
                  className="border border-gray-300 text-xs text-gray-600 rounded px-1"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => toggleEditing('assignedDate', true)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded px-1"
                  title="Click to set assigned date"
                >
                  Set date
                </button>
              )}
            </div>
            
            {/* Editable Start Date */}
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="font-medium">Start:</span>
              {task.startDate ? (
                <input
                  type="date"
                  value={task.startDate}
                  onChange={(e) => updateTask(task.id, { startDate: e.target.value || null })}
                  className="border-none bg-transparent text-xs text-gray-600 cursor-pointer hover:bg-gray-50 rounded px-1"
                  title="Click to change start date"
                />
              ) : editingStates.startDate ? (
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      updateTask(task.id, { startDate: e.target.value });
                    }
                    toggleEditing('startDate', false);
                  }}
                  onBlur={() => toggleEditing('startDate', false)}
                  className="border border-gray-300 text-xs text-gray-600 rounded px-1"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => toggleEditing('startDate', true)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded px-1"
                  title="Click to set start date"
                >
                  Set date
                </button>
              )}
            </div>
            
            {/* Editable Due Date */}
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-600'
            }`}>
              <span className="font-medium">Due:</span>
              {task.dueDate ? (
                <input
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value || null })}
                  className={`border-none bg-transparent text-xs cursor-pointer hover:bg-gray-50 rounded px-1 ${
                    isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-600'
                  }`}
                  title="Click to change due date"
                />
              ) : editingStates.dueDate ? (
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      updateTask(task.id, { dueDate: e.target.value });
                    }
                    toggleEditing('dueDate', false);
                  }}
                  onBlur={() => toggleEditing('dueDate', false)}
                  className="border border-gray-300 text-xs text-gray-600 rounded px-1"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => toggleEditing('dueDate', true)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded px-1"
                  title="Click to set due date"
                >
                  Set date
                </button>
              )}
              
              {/* Due Date Helper Text */}
              {task.dueDate && (() => {
                const days = getDaysUntilDue(task.dueDate);
                if (days !== null && task.status !== 'DONE') {
                  if (days < 0) {
                    return <span className="text-red-600 font-medium">({Math.abs(days)} days overdue)</span>;
                  } else if (days === 0) {
                    return <span className="text-orange-600 font-medium">(Due today)</span>;
                  } else if (days <= 3) {
                    return <span className="text-orange-600 font-medium">({days} days left)</span>;
                  } else {
                    return <span className="text-gray-500">({days} days left)</span>;
                  }
                }
                return null;
              })()}
            </div>
          </div>
          
          {/* Links Display - Collapsible */}
          {task.links && task.links.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Link size={14} className="text-blue-600" />
                  Links ({task.links.length})
                </h4>
                <button
                  onClick={() => toggleSection('links')}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {expandedSections.links ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {expandedSections.links ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {expandedSections.links && (
                <div className="space-y-1">
                  {task.links.map(link => (
                    <div key={link.id} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded relative">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{link.title}</div>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 truncate">
                          {link.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onMouseEnter={() => {
                            setHoveredLink(link.id);
                            generateLinkPreview(link.id, link.url);
                          }}
                          onMouseLeave={() => setHoveredLink(null)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded relative"
                          title="Preview link"
                        >
                          <Eye size={12} />
                          
                          {/* Hover Preview */}
                          {hoveredLink === link.id && linkPreviews[link.id] && !linkPreviews[link.id].loading && !linkPreviews[link.id].error && (
                            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                              <div className="p-3">
                                <div className="flex gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-sm text-gray-900 truncate">{linkPreviews[link.id].title}</h5>
                                    <p className="text-xs text-gray-600 mt-1">{linkPreviews[link.id].description}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-gray-500">{linkPreviews[link.id].domain}</span>
                                      <span className="text-xs text-blue-600">Click to visit →</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Loading Preview */}
                          {hoveredLink === link.id && linkPreviews[link.id]?.loading && (
                            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </button>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                          title="Open link"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => {
                            showConfirmation({
                              title: 'Delete Link',
                              message: 'Are you sure you want to delete this link?',
                              itemName: link.title,
                              type: 'danger',
                              onConfirm: () => {
                                updateTask(task.id, {
                                  links: task.links.filter(l => l.id !== link.id)
                                });
                              }
                            });
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                          title="Delete link"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Documents Display - Collapsible */}
          {task.documents && task.documents.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FileText size={14} className="text-green-600" />
                  Documents ({task.documents.length})
                </h4>
                <button
                  onClick={() => toggleSection('documents')}
                  className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
                >
                  {expandedSections.documents ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {expandedSections.documents ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {expandedSections.documents && (
                <div className="space-y-1">
                  {task.documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <FileText size={16} className="text-green-600" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{doc.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {doc.fileName} • {doc.size ? Math.round(doc.size/1024) + ' KB' : 'Unknown size'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDocumentPreview({ show: true, document: doc })}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                          title="Preview document"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (doc.fileContent && doc.isText) {
                              const blob = new Blob([doc.fileContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = doc.fileName;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            } else if (doc.fileContent && doc.fileContent.startsWith('data:')) {
                              const a = document.createElement('a');
                              a.href = doc.fileContent;
                              a.download = doc.fileName;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            } else {
                              alert(`Download functionality: ${doc.name}\nFile: ${doc.fileName}\nNote: File content not available for download`);
                            }
                          }}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                          title="Download document"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => {
                            showConfirmation({
                              title: 'Delete Document',
                              message: 'Are you sure you want to delete this document?',
                              itemName: doc.name,
                              type: 'danger',
                              onConfirm: () => {
                                updateTask(task.id, {
                                  documents: task.documents.filter(d => d.id !== doc.id)
                                });
                              }
                            });
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                          title="Delete document"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Subtasks Progress - Collapsible */}
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <ChevronRight size={14} className="text-purple-600" />
                  Subtasks ({task.subTasks.length})
                </h4>
                <button
                  onClick={() => toggleSection('subtasks')}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  {expandedSections.subtasks ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {expandedSections.subtasks ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {/* Progress Bar - Always Visible */}
              {(() => {
                const subtasks = getSubTasks(tasks, task.id);
                const completed = subtasks.filter(sub => sub && sub.status === 'DONE').length;
                const total = subtasks.length;
                
                return total > 0 ? (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completed / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {completed}/{total} completed
                    </span>
                  </div>
                ) : null;
              })()}
              
              {/* Expanded Subtasks Display */}
              {expandedSections.subtasks && expandedTasks.has(task.id) && task.subTasks && task.subTasks.length > 0 && (
                <div className="ml-4 space-y-2">
                  {task.subTasks.map(subtaskId => {
                    const subtask = tasks.find(t => t.id === subtaskId);
                    if (!subtask) return null;
                    
                    // If this subtask is being edited, show a placeholder since the form will be rendered by parent
                    if (editingTask === subtask.id) {
                      return (
                        <div key={subtask.id} className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
                          <div className="text-sm text-purple-700 flex items-center gap-2">
                            <Edit size={14} />
                            <span>Editing subtask: <strong>{subtask.title}</strong></span>
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            Edit form is displayed below this task
                          </div>
                        </div>
                      );
                    }
                    
                    const SubtaskStatusIcon = STATUSES[subtask.status].icon === 'Circle' ? () => <div className="w-3 h-3 border border-gray-600 rounded-full"></div> :
                                             STATUSES[subtask.status].icon === 'Clock' ? () => <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div> :
                                             STATUSES[subtask.status].icon === 'CheckCircle' ? () => <div className="w-3 h-3 bg-green-600 rounded-full"></div> :
                                             () => <div className="w-3 h-3 bg-red-600 rounded-full"></div>;
                    
                    return (
                      <div key={subtask.id} className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {/* Interactive Subtask Status */}
                            <button
                              onClick={() => {
                                const statusKeys = Object.keys(STATUSES);
                                const currentIndex = statusKeys.indexOf(subtask.status);
                                const nextIndex = (currentIndex + 1) % statusKeys.length;
                                const nextStatus = statusKeys[nextIndex];
                                updateTask(subtask.id, { status: nextStatus });
                              }}
                              className="hover:scale-110 transition-transform cursor-pointer"
                              title={`Click to change status (current: ${STATUSES[subtask.status].label})`}
                            >
                              <SubtaskStatusIcon />
                            </button>
                            
                            {/* Editable Subtask Title */}
                            <span 
                              className="font-medium text-sm truncate hover:bg-purple-100 px-1 py-0.5 rounded cursor-text"
                              contentEditable
                              suppressContentEditableWarning={true}
                              onBlur={(e) => {
                                const newTitle = e.target.textContent.trim();
                                if (newTitle && newTitle !== subtask.title) {
                                  updateTask(subtask.id, { title: newTitle });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.target.blur();
                                }
                              }}
                              title="Click to edit subtask title"
                            >
                              {subtask.title}
                            </span>
                            
                            {/* Interactive Subtask Status Badge */}
                            <select
                              value={subtask.status}
                              onChange={(e) => updateTask(subtask.id, { status: e.target.value })}
                              className={`text-xs px-1 py-0.5 rounded border-none cursor-pointer hover:opacity-80 ${STATUSES[subtask.status].color}`}
                              title="Click to change status"
                            >
                              {Object.entries(STATUSES).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                            
                            {/* Interactive Subtask Priority */}
                            <select
                              value={subtask.priority}
                              onChange={(e) => updateTask(subtask.id, { priority: e.target.value })}
                              className={`text-xs font-medium border-none bg-transparent cursor-pointer hover:opacity-80 ${PRIORITIES[subtask.priority].color}`}
                              title="Click to change priority"
                            >
                              {Object.entries(PRIORITIES).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Editable Subtask Description */}
                          {subtask.description ? (
                            <p 
                              className="text-xs text-gray-600 truncate mt-1 hover:bg-purple-100 px-1 py-0.5 rounded cursor-text"
                              contentEditable
                              suppressContentEditableWarning={true}
                              onBlur={(e) => {
                                const newDescription = e.target.textContent.trim();
                                if (newDescription !== subtask.description) {
                                  updateTask(subtask.id, { description: newDescription });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  e.target.blur();
                                }
                              }}
                              title="Click to edit description"
                            >
                              {subtask.description}
                            </p>
                          ) : (
                            <div className="text-xs text-gray-400 hover:text-gray-600 hover:bg-purple-100 px-1 py-0.5 rounded cursor-pointer mt-1">
                              <span
                                contentEditable
                                suppressContentEditableWarning={true}
                                onFocus={(e) => {
                                  if (e.target.textContent === "+ Add description...") {
                                    e.target.textContent = "";
                                  }
                                }}
                                onBlur={(e) => {
                                  const newDescription = e.target.textContent.trim();
                                  if (newDescription && newDescription !== "+ Add description...") {
                                    updateTask(subtask.id, { description: newDescription });
                                  } else {
                                    e.target.textContent = "+ Add description...";
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    e.target.blur();
                                  }
                                }}
                                title="Click to add description"
                              >
                                + Add description...
                              </span>
                            </div>
                          )}
                          
                          {(subtask.startDate || subtask.dueDate) && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              {subtask.startDate && <span>Start: {formatDate(subtask.startDate)}</span>}
                              {subtask.dueDate && <span>Due: {formatDate(subtask.dueDate)}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingTask(subtask.id)}
                            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded"
                            title="Edit subtask"
                          >
                            <Edit size={10} />
                          </button>
                          <button
                            onClick={() => {
                              showConfirmation({
                                title: 'Delete Subtask',
                                message: 'Are you sure you want to delete this subtask?',
                                itemName: subtask.title,
                                type: 'danger',
                                onConfirm: () => {
                                  deleteTask(subtask.id);
                                }
                              });
                            }}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                            title="Delete subtask"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddingSubtaskToTask(addingSubtaskToTask === task.id ? null : task.id)}
            className="text-gray-500 hover:text-purple-600 p-1"
            title="Add subtask"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setAddingLinkToTask(addingLinkToTask === task.id ? null : task.id)}
            className="text-gray-500 hover:text-blue-600 p-1"
            title="Add link"
          >
            <Link size={16} />
          </button>
          <button
            onClick={() => setAddingDocToTask(addingDocToTask === task.id ? null : task.id)}
            className="text-gray-500 hover:text-green-600 p-1"
            title="Add document"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={() => setEditingTask(task.id)}
            className="text-gray-500 hover:text-blue-600 p-1"
            title="Edit task"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              showConfirmation({
                title: 'Delete Task',
                message: 'Are you sure you want to delete this task? This will also delete all its subtasks, links, and documents.',
                itemName: task.title,
                type: 'danger',
                onConfirm: () => {
                  deleteTask(task.id);
                }
              });
            }}
            className="text-gray-500 hover:text-red-600 p-1"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;