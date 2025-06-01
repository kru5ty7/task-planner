export const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'DONE') return false;
  return new Date(task.dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getSubTasks = (tasks, parentId) => {
  const parent = tasks.find(t => t.id === parentId);
  if (!parent) return [];
  return parent.subTasks.map(subId => tasks.find(t => t.id === subId)).filter(Boolean);
};

export const getTaskProgress = (tasks, task) => {
  if (task.subTasks.length === 0) return null;
  const subTasks = getSubTasks(tasks, task.id);
  const completed = subTasks.filter(sub => sub.status === 'DONE').length;
  return { completed, total: subTasks.length };
};

export const generateLinkPreview = async (linkId, url, setLinkPreviews) => {
  setLinkPreviews(prev => ({ ...prev, [linkId]: { loading: true } }));
  
  setTimeout(() => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      setLinkPreviews(prev => ({ 
        ...prev, 
        [linkId]: { 
          title: `${domain} Link`,
          description: 'Link preview',
          domain,
          url 
        } 
      }));
    } catch (error) {
      setLinkPreviews(prev => ({ ...prev, [linkId]: { error: true } }));
    }
  }, 1000);
};