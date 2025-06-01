import React from 'react';
import { X, FileText, Download } from 'lucide-react';

const DocumentPreviewModal = ({ documentPreview, setDocumentPreview }) => {
  if (!documentPreview.show || !documentPreview.document) return null;

  const handleDownload = () => {
    const doc = documentPreview.document;
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
      alert(`Download functionality: ${doc.name}\nFile: ${doc.fileName}`);
    }
  };

  const closeModal = () => {
    setDocumentPreview({ show: false, document: null });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{documentPreview.document.name}</h3>
              <p className="text-sm text-gray-600">
                {documentPreview.document.fileName} • {documentPreview.document.size ? Math.round(documentPreview.document.size/1024) + ' KB' : 'Unknown size'} • {new Date(documentPreview.document.addedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[70vh]">
          {documentPreview.document.isText && documentPreview.document.fileContent ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} className="text-gray-600" />
                <span className="font-medium text-gray-900">{documentPreview.document.name}</span>
                <span className="text-sm text-gray-500">({documentPreview.document.fileName})</span>
              </div>
              <div className="bg-white border rounded p-4 max-h-96 overflow-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {documentPreview.document.fileContent}
                </pre>
              </div>
              <div className="mt-4 text-xs text-gray-500 flex justify-between">
                <span>Lines: {documentPreview.document.fileContent.split('\n').length}</span>
                <span>Characters: {documentPreview.document.fileContent.length}</span>
              </div>
            </div>
          ) : documentPreview.document.type?.startsWith('image/') && documentPreview.document.fileContent ? (
            <div className="text-center">
              <img 
                src={documentPreview.document.fileContent} 
                alt={documentPreview.document.name}
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }} className="bg-gray-100 rounded-lg p-8">
                <div className="w-16 h-16 bg-red-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <FileText size={32} className="text-white" />
                </div>
                <p className="text-gray-600 mb-2">Could not display image</p>
                <p className="text-sm text-gray-500">{documentPreview.document.fileName}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <div className="w-16 h-16 bg-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <FileText size={32} className="text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Document Preview</h4>
                <p className="text-gray-600 mb-4">{documentPreview.document.fileName}</p>
                <p className="text-sm text-gray-500 mb-4">
                  This file type cannot be previewed directly
                </p>
                <div className="space-y-2 text-left bg-white p-4 rounded border">
                  <p className="text-sm"><strong>Name:</strong> {documentPreview.document.name}</p>
                  <p className="text-sm"><strong>File:</strong> {documentPreview.document.fileName}</p>
                  <p className="text-sm"><strong>Type:</strong> {documentPreview.document.type || 'Unknown'}</p>
                  <p className="text-sm"><strong>Size:</strong> {documentPreview.document.size ? Math.round(documentPreview.document.size/1024) + ' KB' : 'Unknown size'}</p>
                  <p className="text-sm"><strong>Added:</strong> {new Date(documentPreview.document.addedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Esc</kbd> to close
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;