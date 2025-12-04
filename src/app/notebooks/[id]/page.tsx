'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/Sidebar';
import { useNotebookStore } from '@/stores/notebookStore';

export default function NotebookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: loading } = useAuthStore();
  const isAuthenticated = !!user;
  const notebookId = params?.id as string;
  
  const { 
    getNotebookById, 
    getPagesByNotebookId, 
    updateNotebook, 
    addPageToNotebook, 
    deletePageFromNotebook, 
    updatePage,
    fetchNotebooks,
    fetchPagesForNotebook,
    fetchNotebookById
  } = useNotebookStore();
  
  const notebook = notebookId ? getNotebookById(notebookId) : undefined;
  const pages = notebookId ? getPagesByNotebookId(notebookId) : [];
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && isAuthenticated && notebookId) {
      const initializeNotebook = async () => {
        setIsInitializing(true);
        
        // Check if notebook exists in cache
        let currentNotebook = getNotebookById(notebookId);
        
        // If not in cache, fetch it (this also fetches pages)
        if (!currentNotebook) {
          currentNotebook = await fetchNotebookById(notebookId);
        }
        
        // If still not found, redirect
        if (!currentNotebook) {
          router.push('/');
          return;
        }
        
        // Fetch pages if not already loaded
        let currentPages = getPagesByNotebookId(notebookId);
        if (currentPages.length === 0) {
          await fetchPagesForNotebook(notebookId);
          currentPages = getPagesByNotebookId(notebookId);
        }
        
        // Auto-redirect to first page if pages exist (only once)
        if (!hasRedirected && currentPages.length > 0) {
          setHasRedirected(true);
          router.replace(`/notebooks/${notebookId}/pages/${currentPages[0].id}`);
        } else {
          setIsInitializing(false);
        }
      };
      
      initializeNotebook();
    }
  }, [loading, isAuthenticated, notebookId, router, getNotebookById, getPagesByNotebookId, fetchNotebookById, fetchPagesForNotebook, hasRedirected]);

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

  const handleUpdatePage = async (updatedPageId: string, updates: { title?: string }) => {
    if (notebookId) {
      try {
        await updatePage(notebookId, updatedPageId, updates);
      } catch (error) {
        console.error('Failed to update page:', error);
      }
    }
  };

  const handleDeletePage = async (deletedPageId: string) => {
    if (notebookId) {
      try {
        await deletePageFromNotebook(notebookId, deletedPageId);
      } catch (error) {
        console.error('Failed to delete page:', error);
      }
    }
  };

  // Show loading state during initialization
  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center transition-opacity duration-200">
        <div className="text-[var(--foreground)]">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated or notebook not found
  if (!isAuthenticated || !notebook) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar with notebook info and pages */}
      <Sidebar notebookId={notebookId} notebook={notebook} onNotebookUpdate={handleNotebookUpdate} onAddPage={handleAddPage} onDeletePage={handleDeletePage} onUpdatePage={handleUpdatePage} />

      {/* Main content */}
      <main className="ml-80 flex flex-col overflow-hidden min-h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-8 py-8 mt-12">
            <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
              {notebook.title}
            </h1>
            {notebook.description && (
              <p className="text-lg text-[var(--foreground)] opacity-70 mb-8">
                {notebook.description}
              </p>
            )}
            <div className="text-[var(--notion-gray-text)]">
              <p>Notebook content will be displayed here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

