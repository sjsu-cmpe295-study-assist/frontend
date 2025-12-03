'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, Loader2, Plus, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface Document {
  id: string;
  file: File;
  size: number;
  status: 'uploading' | 'processing' | 'completed';
}

interface NewNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { prompt?: string; documents?: Document[] }) => void;
}

export function NewNotebookModal({ isOpen, onClose, onCreate }: NewNotebookModalProps) {
  const [prompt, setPrompt] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newDocuments: Document[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      size: file.size,
      status: 'uploading' as const,
    }));

    setDocuments((prev) => [...prev, ...newDocuments]);

    // Simulate upload and processing
    newDocuments.forEach((doc) => {
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: 'processing' } : d))
        );
      }, 1000);

      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: 'completed' } : d))
        );
      }, 3000);
    });
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleCreateEmpty = () => {
    onCreate({});
    handleClose();
  };

  const handleCreate = () => {
    onCreate({
      prompt: prompt.trim() || undefined,
      documents: documents.length > 0 ? documents : undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setPrompt('');
    setDocuments([]);
    setIsDragging(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCreate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-[var(--background)] w-3/4 h-3/4 overflow-hidden flex flex-col rounded-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-8">
          <div className="w-full h-full flex flex-col space-y-6">
            {/* Drag and Drop + Documents Section - 70% height */}
            <div className="flex-[7] flex flex-col space-y-4 overflow-y-auto">
              {/* Drag and Drop Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl transition-colors cursor-pointer flex flex-col items-center justify-center flex-[3] ${
                  isDragging
                    ? 'border-[var(--notion-blue-border)] bg-[var(--notion-blue-bg)]'
                    : 'border-[var(--notion-gray-border)] hover:border-[var(--notion-gray-text-hover)] hover:bg-[var(--notion-gray-bg-hover)]'
                }`}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--notion-gray-text)] opacity-50" />
                <p className="text-base text-[var(--foreground)] mb-2">
                  Drag and drop documents here, or click to browse
                </p>
                <p className="text-sm text-[var(--notion-gray-text)]">
                  PDF, DOCX, TXT, and other document formats
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
              </div>

              {/* Document Cards */}
              {documents.length > 0 && (
                <div className="space-y-2 flex-shrink-0">
                  <p className="text-base font-medium text-[var(--foreground)]">Uploaded Documents</p>
                  <div className="grid grid-cols-2 gap-2 max-w-md">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2 rounded-md border border-[var(--notion-gray-border)] bg-[var(--background)] flex items-center gap-2 hover:bg-[var(--notion-gray-bg-hover)] transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {doc.status === 'completed' ? (
                            <FileText className="w-5 h-5 text-[var(--notion-blue-text)]" />
                          ) : (
                            <Loader2 className="w-5 h-5 text-[var(--notion-gray-text)] animate-spin" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-xs font-medium text-[var(--foreground)] truncate">
                            {doc.file.name}
                          </p>
                          <p className="text-[10px] text-[var(--notion-gray-text)] truncate">
                            {formatFileSize(doc.size)}
                            {doc.status === 'uploading' && ' • Uploading...'}
                            {doc.status === 'processing' && ' • Processing...'}
                            {doc.status === 'completed' && ' • Ready'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="p-0.5 rounded-md hover:bg-[var(--notion-gray-bg)] transition-colors flex-shrink-0"
                          aria-label="Remove document"
                        >
                          <X className="w-5 h-5 text-[var(--notion-gray-text)]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Describe Textarea - 30% height */}
            <div className="flex-[3] flex flex-col space-y-3 flex-shrink-0">
              <label className="text-base font-medium text-[var(--foreground)]">
                Describe what you want to create
              </label>
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your prompt or instructions..."
                  className="w-full h-full px-4 py-3 pb-20 rounded-2xl border border-[var(--notion-gray-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--notion-gray-text)] placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--notion-blue-text)] focus:border-[var(--notion-blue-border)] resize-none text-base"
                  autoFocus
                />
                {/* Action Buttons */}
                <div className="absolute bottom-3 left-3">
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--notion-red-bg)] text-[var(--notion-red-text)] border-[var(--notion-red-border)] hover:bg-[var(--notion-red-bg)] hover:text-[var(--notion-red-text)] hover:opacity-90"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </Button>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleCreateEmpty}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Empty</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Create Notebook</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

