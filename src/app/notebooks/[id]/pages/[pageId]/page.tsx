'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/Sidebar';
import { useNotebookStore } from '@/stores/notebookStore';
import { PageEditor } from '@/components/editor/PageEditor';
import { AIChatPopover } from '@/components/AIChatPopover';
import { DocumentsPopover } from '@/components/DocumentsPopover';
import { Sparkles, FileText } from 'lucide-react';

export default function PageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: loading } = useAuthStore();
  const isAuthenticated = !!user;
  const notebookId = params?.id as string;
  const pageId = params?.pageId as string;
  
  const { 
    getNotebookById, 
    getPagesByNotebookId, 
    updateNotebook, 
    addPageToNotebook, 
    deletePageFromNotebook, 
    updatePage,
    fetchNotebooks,
    fetchPagesForNotebook,
    getPageById
  } = useNotebookStore();
  
  const notebook = notebookId ? getNotebookById(notebookId) : undefined;
  const pages = notebookId ? getPagesByNotebookId(notebookId) : [];
  const page = useMemo(() => {
    return pages.find((p) => p.id === pageId);
  }, [pages, pageId]);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [pageContent, setPageContent] = useState<any>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [aiContext, setAiContext] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && isAuthenticated && notebookId) {
      // Only fetch notebooks if not already loaded
      const currentNotebook = getNotebookById(notebookId);
      if (!currentNotebook) {
        fetchNotebooks().then(() => {
          // After fetching notebooks, fetch pages if needed
          const updatedNotebook = getNotebookById(notebookId);
          if (updatedNotebook) {
            const currentPages = getPagesByNotebookId(notebookId);
            if (currentPages.length === 0) {
              fetchPagesForNotebook(notebookId);
            }
          }
        });
      } else {
        // Notebook exists, just ensure pages are loaded
        const currentPages = getPagesByNotebookId(notebookId);
        if (currentPages.length === 0) {
          fetchPagesForNotebook(notebookId);
        }
      }
    }
  }, [loading, isAuthenticated, notebookId, router, getNotebookById, getPagesByNotebookId, fetchNotebooks, fetchPagesForNotebook]);

  // Fetch page content when pageId is available
  useEffect(() => {
    if (!loading && notebookId && pageId) {
      setIsContentLoaded(false);
      
      // Check if page is in cache with content
      const cachedPage = pages.find((p) => p.id === pageId);
      
      if (cachedPage?.content !== undefined) {
        // Content is already in cache
        setPageContent(cachedPage.content || null);
        setIsContentLoaded(true);
      } else {
        // Fetch page from API to get content
        getPageById(notebookId, pageId).then((fetchedPage) => {
          if (fetchedPage) {
            setPageContent(fetchedPage.content || null);
            setIsContentLoaded(true);
          }
        }).catch((error) => {
          console.error('Failed to fetch page content:', error);
          setPageContent(null);
          setIsContentLoaded(true);
        });
      }
    }
  }, [loading, notebookId, pageId, pages, getPageById]);

  useEffect(() => {
    if (!loading && notebookId && !notebook) {
      router.push('/');
    }
  }, [loading, notebookId, notebook, router]);

  useEffect(() => {
    if (notebookId && pageId && pages.length > 0) {
      if (!page) {
        // If page not found but notebook has pages, redirect to first page
        router.replace(`/notebooks/${notebookId}/pages/${pages[0].id}`);
      }
    } else if (notebookId && pageId && pages.length === 0) {
      // If no pages, redirect back to notebook
      router.replace(`/notebooks/${notebookId}`);
    }
  }, [notebookId, pageId, pages, page, router]);

  const handleNotebookUpdate = async (id: string, updates: { title?: string; description?: string }) => {
    try {
      await updateNotebook(id, updates);
    } catch (error) {
      console.error('Failed to update notebook:', error);
    }
  };

  const handleAddPage = async () => {
    if (notebookId) {
      try {
        const newPage = await addPageToNotebook(notebookId);
        router.push(`/notebooks/${notebookId}/pages/${newPage.id}`);
      } catch (error) {
        console.error('Failed to add page:', error);
      }
    }
  };

  const handleUpdatePage = async (updatedPageId: string, updates: { title?: string; content?: any }) => {
    if (notebookId) {
      try {
        const updatedPage = await updatePage(notebookId, updatedPageId, updates);
        // If this is the current page and content was updated, sync local state
        if (updatedPageId === pageId && updatedPage?.content !== undefined) {
          setPageContent(updatedPage.content || null);
        }
      } catch (error) {
        console.error('Failed to update page:', error);
      }
    }
  };

  const handlePageContentUpdate = async (content: any) => {
    if (notebookId && pageId) {
      try {
        const updatedPage = await updatePage(notebookId, pageId, { content });
        // Update local content state to reflect the saved content
        if (updatedPage?.content !== undefined) {
          setPageContent(updatedPage.content || null);
        }
      } catch (error) {
        console.error('Failed to update page content:', error);
      }
    }
  };

  const handleDeletePage = async (deletedPageId: string) => {
    if (notebookId) {
      try {
        await deletePageFromNotebook(notebookId, deletedPageId);
        // If the deleted page is the current page, navigate to another page or notebook
        if (deletedPageId === pageId) {
          const updatedPages = getPagesByNotebookId(notebookId);
          if (updatedPages.length > 0) {
            router.replace(`/notebooks/${notebookId}/pages/${updatedPages[0].id}`);
          } else {
            router.replace(`/notebooks/${notebookId}`);
          }
        }
      } catch (error) {
        console.error('Failed to delete page:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--foreground)]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !notebook || !page) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar with notebook info and pages */}
      <Sidebar notebookId={notebookId} notebook={notebook} onNotebookUpdate={handleNotebookUpdate} onAddPage={handleAddPage} onDeletePage={handleDeletePage} onUpdatePage={handleUpdatePage} />

      {/* Main content */}
      <main className="ml-80 flex flex-col overflow-hidden min-h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full py-8 min-h-screen">
            <div className="max-w-[900px] mx-auto flex flex-col h-full">
              <h3 className="text-xl font-bold text-[var(--foreground)] pt-10 mb-6 px-4 sm:px-8 opacity-60">
                {page.title}
              </h3>
              {isContentLoaded && (
                <PageEditor 
                  key={pageId} // Force re-render when page changes
                  initialContent={pageContent || undefined}
                  onUpdate={handlePageContentUpdate}
                  className='h-full'
                  onAskAI={(selectedText) => {
                    setAiContext(selectedText);
                    setIsAIChatOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Documents Trigger Button */}
      {!isDocumentsOpen && (
        <button
          onClick={() => setIsDocumentsOpen(true)}
          className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-[var(--notion-green-text)] text-white shadow-lg hover:bg-[var(--notion-green-text-hover)] transition-all hover:scale-105 flex items-center justify-center z-30"
          aria-label="Open documents"
        >
          <FileText className="w-5 h-5" />
        </button>
      )}

      {/* AI Chat Trigger Button */}
      {!isAIChatOpen && (
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[var(--notion-blue-text)] text-white shadow-lg hover:bg-[var(--notion-blue-text-hover)] transition-all hover:scale-105 flex items-center justify-center z-30"
          aria-label="Open AI chat"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}

      {/* Documents Popover */}
      <DocumentsPopover
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        documents={notebook.documents || []}
        notebookId={notebookId}
      />

      {/* AI Chat Popover */}
      <AIChatPopover
        isOpen={isAIChatOpen}
        onClose={() => {
          setIsAIChatOpen(false);
          setAiContext(undefined);
        }}
        context={aiContext} // Only pass selected text, not page title
        notebookId={notebookId}
        pageId={pageId}
      />
    </div>
  );
}

