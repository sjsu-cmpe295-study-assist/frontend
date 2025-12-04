'use client';

import { useState, useRef, useEffect } from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';

interface Document {
  id?: string;
  name?: string;
  filename?: string;
  size?: number;
  url?: string;
  type?: string;
  uploadedAt?: string;
  [key: string]: any; // Allow additional properties
}

interface DocumentsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
}

export function DocumentsPopover({ isOpen, onClose, documents }: DocumentsPopoverProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type?: string, name?: string) => {
    if (!type && !name) return FileText;
    
    const fileType = type || name?.split('.').pop()?.toLowerCase() || '';
    
    // You can add more specific icons based on file type
    return FileText;
  };

  const handleDownload = (document: Document) => {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      console.warn('Document URL not available');
    }
  };

  const handleOpen = (document: Document) => {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      console.warn('Document URL not available');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Documents Popover */}
      <div className="fixed bottom-6 right-6 w-[500px] h-[700px] max-h-[calc(100vh-3rem)] bg-[var(--background)] border border-[var(--notion-gray-border)] rounded-4xl z-50 flex flex-col shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 ">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--notion-green-bg)] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[var(--notion-green-text)]" />
            </div>
            <span className="text-base font-semibold text-[var(--foreground)]">
              Documents ({documents.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--notion-red-bg)] hover:text-[var(--notion-red-text)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--notion-green-bg)] to-[var(--notion-green-text)]/20 flex items-center justify-center mb-8 shadow-lg">
                <FileText className="w-10 h-10 text-[var(--notion-green-text)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3 text-center">
                No documents yet
              </h3>
              <p className="text-sm text-[var(--notion-gray-text)] text-center max-w-md leading-relaxed">
                Documents uploaded to this notebook will appear here.
              </p>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-2">
              {documents.map((document, index) => {
                const FileIcon = getFileIcon(document.type, document.name || document.filename);
                const displayName = document.name || document.filename || `Document ${index + 1}`;
                const displaySize = formatFileSize(document.size);
                
                return (
                  <div
                    key={document.id || index}
                    className="group flex items-center gap-3 p-3 rounded-lg border border-[var(--notion-gray-border)] bg-[var(--background)] hover:bg-[var(--notion-gray-bg-hover)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-md bg-[var(--notion-green-bg)] flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-5 h-5 text-[var(--notion-green-text)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {displayName}
                      </p>
                      {displaySize !== 'Unknown size' && (
                        <p className="text-xs text-[var(--notion-gray-text)] mt-0.5">
                          {displaySize}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {document.url && (
                        <>
                          <button
                            onClick={() => handleOpen(document)}
                            className="p-2 rounded-md hover:bg-[var(--notion-gray-bg)] transition-colors"
                            aria-label="Open document"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4 text-[var(--notion-gray-text)]" />
                          </button>
                          <button
                            onClick={() => handleDownload(document)}
                            className="p-2 rounded-md hover:bg-[var(--notion-gray-bg)] transition-colors"
                            aria-label="Download document"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-[var(--notion-gray-text)]" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

