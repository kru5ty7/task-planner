import React, { useState } from 'react';
import { generateId } from '../utils/taskUtils';

const QuickAddLink = ({ taskId, onComplete, onCancel, updateTask, tasks }) => {
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleAdd = () => {
    if (linkTitle.trim() && linkUrl.trim()) {
      const newLink = {
        id: generateId(),
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        addedAt: new Date().toISOString()
      };

      const task = tasks.find(t => t.id === taskId);
      updateTask(taskId, {
        links: [...(task.links || []), newLink]
      });

      onComplete();
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Link title (e.g., 'Project Documentation')"
        value={linkTitle}
        onChange={(e) => setLinkTitle(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        autoFocus
      />
      <input
        type="url"
        placeholder="https://example.com"
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Add Link
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

export default QuickAddLink;