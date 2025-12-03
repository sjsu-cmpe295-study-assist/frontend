'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { getNotebookById, getPagesByNotebookId, updateNotebook, addPageToNotebook, deletePageFromNotebook, type Notebook } from '@/lib/mock-data';

export default function NotebookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const notebookId = params?.id as string;
  const [notebook, setNotebook] = useState<Notebook | undefined>(
    notebookId ? getNotebookById(notebookId) : undefined
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && notebookId && !notebook) {
      router.push('/');
    }
  }, [loading, notebookId, notebook, router]);

  // Auto-redirect to first page if notebook has pages
  useEffect(() => {
    if (!loading && notebook && notebookId) {
      const pages = getPagesByNotebookId(notebookId);
      if (pages.length > 0) {
        const firstPage = pages[0];
        router.replace(`/notebooks/${notebookId}/pages/${firstPage.id}`);
      }
    }
  }, [loading, notebook, notebookId, router]);

  const handleNotebookUpdate = (id: string, updates: { title?: string; description?: string }) => {
    const updated = updateNotebook(id, updates);
    if (updated) {
      setNotebook(updated);
    }
  };

  const handleAddPage = () => {
    if (notebookId) {
      const newPage = addPageToNotebook(notebookId);
      if (newPage) {
        // Refresh notebook to get updated pages
        const updatedNotebook = getNotebookById(notebookId);
        if (updatedNotebook) {
          setNotebook(updatedNotebook);
        }
        // Navigate to the new page
        router.push(`/notebooks/${notebookId}/pages/${newPage.id}`);
      }
    }
  };

  const handleDeletePage = (deletedPageId: string) => {
    if (notebookId) {
      deletePageFromNotebook(notebookId, deletedPageId);
      // Refresh notebook to get updated pages
      const updatedNotebook = getNotebookById(notebookId);
      if (updatedNotebook) {
        setNotebook(updatedNotebook);
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

  if (!isAuthenticated || !notebook) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar with notebook info and pages */}
      <Sidebar notebookId={notebookId} notebook={notebook} onNotebookUpdate={handleNotebookUpdate} onAddPage={handleAddPage} onDeletePage={handleDeletePage} />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
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

