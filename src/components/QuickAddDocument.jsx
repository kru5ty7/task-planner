import React, { useState } from 'react';
import { generateId, formatFileSize } from '../utils/taskUtils';

const QuickAddDocument = ({ taskId, onComplete, onCancel, updateTask, tasks }) => {
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState(null);

  const handleAdd = () => {
    if (docName.trim() && docFile) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const doc = {
          id: generateId(),
          name: docName.trim(),
          fileName: docFile.name,
          size: docFile.size,
          type: docFile.type,
          addedAt: new Date().toISOString(),
          fileContent: e.target.result,
          isText: docFile.type.startsWith('text/') || 
                 docFile.name.endsWith('.txt') || 
                 docFile.name.endsWith('.md')
        };
        
        const task = tasks.find(t => t.id === taskId);
        updateTask(taskId, {
          documents: [...(task.documents || []), doc]
        });
        
        onComplete();
      };

      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };

      const isTextFile = docFile.type.startsWith('text/') || 
                        docFile.name.endsWith('.txt') || 
                        docFile.name.endsWith('.md');
      
      if (isTextFile) {
        reader.readAsText(docFile);
      } else {
        reader.readAsDataURL(docFile);
      }
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Document name (e.g., 'Meeting Notes')"
        value={docName}
        onChange={(e) => setDocName(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        autoFocus
      />
      <input
        type="file"
        onChange={(e) => setDocFile(e.target.files[0])}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
      />
      {docFile && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          Selected: {docFile.name} ({formatFileSize(docFile.size)})
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          Add Document
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QuickAddDocument;