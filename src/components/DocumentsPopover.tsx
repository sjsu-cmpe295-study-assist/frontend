'use client';

import { useState, useRef, useEffect } from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';
import { getDocumentUrl, type Document } from '@/lib/api/notebooks';

interface DocumentsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  notebookId?: string;
}

export function DocumentsPopover({ isOpen, onClose, documents, notebookId }: DocumentsPopoverProps) {
  const [loadingDocs, setLoadingDocs] = useState<Record<string, boolean>>({});
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});

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

  // Fetch document URL if not already available
  useEffect(() => {
    if (!isOpen || !notebookId) return;

    // Debug: Log documents to see their structure
    console.log('DocumentsPopover - Documents received:', documents);

    documents.forEach(async (document) => {
      const docId = document.id || document.filename || document.name;
      if (!docId) return;

      // If document already has a URL, use it
      if (document.url) {
        console.log(`Document ${docId} has URL:`, document.url);
        setDocUrls((prev) => ({ ...prev, [docId]: document.url as string }));
        return;
      }

      // If URL is already fetched, skip
      if (docUrls[docId]) return;

      // Only try to fetch URL if document has an ID (required for API call)
      // If no ID, assume document doesn't have a URL yet (still processing)
      if (notebookId && document.id) {
        console.log(`Attempting to fetch URL for document ${docId}`);
        try {
          setLoadingDocs((prev) => ({ ...prev, [docId]: true }));
          const url = await getDocumentUrl(notebookId, document.id);
          if (url) {
            console.log(`Successfully fetched URL for document ${docId}:`, url);
            setDocUrls((prev) => ({ ...prev, [docId]: url as string }));
          } else {
            console.log(`No URL returned for document ${docId} - document may still be processing`);
          }
        } catch (error) {
          console.warn(`Failed to fetch document URL for ${docId}:`, error);
          // If endpoint doesn't exist (404), documents should have URLs in response
          // If other error, document might still be processing
        } finally {
          setLoadingDocs((prev) => ({ ...prev, [docId]: false }));
        }
      } else {
        console.log(`Document ${docId} has no ID - cannot fetch URL`);
      }
    });
  }, [isOpen, notebookId, documents]);

  const handleDownload = async (document: Document) => {
    const docId = document.id || document.filename || document.name;
    if (!docId) return;

    // Try to get URL from state or document
    let url = docUrls[docId] || document.url;

    // If no URL available, try to fetch it
    if (!url && notebookId && document.id) {
      try {
        setLoadingDocs((prev) => ({ ...prev, [docId]: true }));
        const fetchedUrl = await getDocumentUrl(notebookId, document.id);
        if (fetchedUrl) {
          setDocUrls((prev) => ({ ...prev, [docId]: fetchedUrl }));
          url = fetchedUrl;
        }
      } catch (error) {
        console.error('Failed to get document URL:', error);
        alert('Unable to download document. Please try again later.');
        return;
      } finally {
        setLoadingDocs((prev) => ({ ...prev, [docId]: false }));
      }
    }

    if (url) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = document.name || document.filename || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.warn('Document URL not available');
      alert('Document URL is not available. The document may still be processing.');
    }
  };

  const handleOpen = async (document: Document) => {
    const docId = document.id || document.filename || document.name;
    if (!docId) return;

    // Try to get URL from state or document
    let url = docUrls[docId] || document.url;

    // If no URL available, try to fetch it
    if (!url && notebookId && document.id) {
      try {
        setLoadingDocs((prev) => ({ ...prev, [docId]: true }));
        const fetchedUrl = await getDocumentUrl(notebookId, document.id);
        if (fetchedUrl) {
          setDocUrls((prev) => ({ ...prev, [docId]: fetchedUrl }));
          url = fetchedUrl;
        }
      } catch (error) {
        console.error('Failed to get document URL:', error);
        alert('Unable to open document. Please try again later.');
        return;
      } finally {
        setLoadingDocs((prev) => ({ ...prev, [docId]: false }));
      }
    }

    if (url) {
      window.open(url, '_blank');
    } else {
      console.warn('Document URL not available');
      alert('Document URL is not available. The document may still be processing.');
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
                const docId = document.id || document.filename || document.name || `doc-${index}`;
                const isLoading = loadingDocs[docId];
                const hasUrl = docUrls[docId] || document.url;
                
                return (
                  <div
                    key={document.id || index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--notion-gray-border)] bg-[var(--background)]"
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
                    {isLoading && (
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 border-2 border-[var(--notion-gray-text)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
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

