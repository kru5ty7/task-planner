import React, { useState } from 'react';
import { Link, FileText, Trash2 } from 'lucide-react';
import { STATUSES, PRIORITIES } from '../constants/taskConstants';
import { generateId, formatFileSize } from '../utils/taskUtils';

const TaskForm = ({ task = null, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
  const [status, setStatus] = useState(task?.status || 'TODO');
  const [assignedDate, setAssignedDate] = useState(task?.assignedDate || '');
  const [startDate, setStartDate] = useState(task?.startDate || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [links, setLinks] = useState(task?.links || []);
  const [documents, setDocuments] = useState(task?.documents || []);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState(null);
  const [showLinksSection, setShowLinksSection] = useState(false);
  const [showDocsSection, setShowDocsSection] = useState(false);

  const addLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      const newLink = { 
        id: generateId(), 
        title: newLinkTitle.trim(), 
        url: newLinkUrl.trim(),
        addedAt: new Date().toISOString()
      };
      setLinks([...links, newLink]);
      setShowLinksSection(true);
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (linkId) => {
    setLinks(links.filter(link => link.id !== linkId));
  };

  const addDocument = () => {
    if (newDocName.trim() && newDocFile) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const doc = {
          id: generateId(),
          name: newDocName.trim(),
          fileName: newDocFile.name,
          size: newDocFile.size,
          type: newDocFile.type,
          addedAt: new Date().toISOString(),
          fileContent: e.target.result,
          isText: newDocFile.type.startsWith('text/') || 
                 newDocFile.name.endsWith('.txt') || 
                 newDocFile.name.endsWith('.md')
        };
        setDocuments([...documents, doc]);
        setShowDocsSection(true);
        setNewDocName('');
        setNewDocFile(null);
      };

      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };

      const isTextFile = newDocFile.type.startsWith('text/') || 
                        newDocFile.name.endsWith('.txt') || 
                        newDocFile.name.endsWith('.md');
      
      if (isTextFile) {
        reader.readAsText(newDocFile);
      } else {
        reader.readAsDataURL(newDocFile);
      }
    }
  };

  const removeDocument = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({ 
        title: title.trim(), 
        description: description.trim(), 
        priority, 
        status,
        startDate: startDate || null,
        dueDate: dueDate || null,
        links,
        documents
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="2"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(PRIORITIES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {task && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(STATUSES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Links Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Link size={14} className="text-blue-600" />
              Links ({links.length})
            </h4>
            <button
              type="button"
              onClick={() => setShowLinksSection(!showLinksSection)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showLinksSection ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showLinksSection && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Link title (e.g., 'Project Documentation')"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add Link
                  </button>
                </div>
              </div>
              
              {links.map(link => (
                <div key={link.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{link.title}</div>
                    <div className="text-xs text-gray-500 truncate">{link.url}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Documents Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <FileText size={14} className="text-green-600" />
              Documents ({documents.length})
            </h4>
            <button
              type="button"
              onClick={() => setShowDocsSection(!showDocsSection)}
              className="text-xs text-green-600 hover:text-green-800"
            >
              {showDocsSection ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showDocsSection && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Document name (e.g., 'Meeting Notes')"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <input
                    type="file"
                    onChange={(e) => setNewDocFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  {newDocFile && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      Selected: {newDocFile.name} ({formatFileSize(newDocFile.size)})
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addDocument}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Add Document
                  </button>
                </div>
              </div>
              
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{doc.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {doc.fileName} • {formatFileSize(doc.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {task ? 'Update' : 'Create'} Task
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;