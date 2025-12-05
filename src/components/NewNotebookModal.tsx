'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface Document {
  id: string;
  file: File;
  size: number;
  status: 'uploading' | 'processing' | 'completed';
}

interface ApiDocument {
  type: 'pdf' | 'image' | 'url';
  name?: string;
  data?: string; // Base64 encoded for PDF/image
  url?: string; // For URL type
}

interface NewNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { prompt?: string; documents?: ApiDocument[] }) => Promise<void>;
}

export function NewNotebookModal({ isOpen, onClose, onCreate }: NewNotebookModalProps) {
  const [prompt, setPrompt] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      validFiles.push(file);
    });

    const newDocuments: Document[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      size: file.size,
      status: 'uploading' as const,
    }));

    setDocuments((prev) => [...prev, ...newDocuments]);

    // Mark as completed immediately (actual processing happens on backend)
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => 
          newDocuments.some(nd => nd.id === d.id) 
            ? { ...d, status: 'completed' } 
            : d
        )
      );
    }, 500);
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

  const handleCreate = async () => {
    setIsCreating(true);
    setProgress('Preparing documents...');

    try {
      // Convert files to API document format
      const apiDocuments: ApiDocument[] = [];

      if (documents.length > 0) {
        setProgress(`Converting ${documents.length} file(s) to base64...`);

        for (let i = 0; i < documents.length; i++) {
          const doc = documents[i];
          const file = doc.file;
          
          setProgress(`Processing file ${i + 1} of ${documents.length}...`);
          
          if (file.type === 'application/pdf') {
            const base64Data = await fileToBase64(file);
            apiDocuments.push({
              type: 'pdf',
              name: file.name,
              data: base64Data,
            });
          } else if (file.type.startsWith('image/')) {
            const base64Data = await fileToBase64(file);
            apiDocuments.push({
              type: 'image',
              name: file.name,
              data: base64Data,
            });
          } else {
            // For other file types, try to convert to base64
            // Backend will handle the conversion
            const base64Data = await fileToBase64(file);
            apiDocuments.push({
              type: 'pdf', // Default to pdf type
              name: file.name,
              data: base64Data,
            });
          }
        }
      }

      if (apiDocuments.length > 0) {
        setProgress('Creating notebook and processing documents...');
        setProgress('This may take 30-120 seconds depending on document size...');
      } else {
        setProgress('Creating notebook...');
      }

      await onCreate({
        prompt: prompt.trim() || undefined,
        documents: apiDocuments.length > 0 ? apiDocuments : undefined,
      });

      handleClose();
    } catch (error) {
      console.error('Error creating notebook:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create notebook';
      setProgress(`Error: ${errorMessage}`);
      alert(errorMessage);
      // Don't close modal on error, let user retry
    } finally {
      setIsCreating(false);
      // Keep progress message visible for a moment before clearing
      setTimeout(() => {
        if (!isCreating) {
          setProgress('');
        }
      }, 3000);
    }
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--notion-gray-border)] flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Create Notebook
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[var(--notion-red-bg)] hover:text-[var(--notion-red-text)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                  accept=".pdf,.doc,.docx,.txt,.md,image/*"
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
                {/* Action Button */}
                <div className="absolute bottom-3 right-3">
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Create Notebook</span>
                      </>
                    )}
                  </Button>
                </div>
                {isCreating && progress && (
                  <div className="absolute bottom-16 left-3 right-3">
                    <div className="bg-[var(--notion-blue-bg)] border border-[var(--notion-blue-border)] rounded-lg px-4 py-2">
                      <p className="text-sm text-[var(--notion-blue-text)]">{progress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

