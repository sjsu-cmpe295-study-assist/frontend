'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { getNotebookById, getPagesByNotebookId, updateNotebook, addPageToNotebook, deletePageFromNotebook, type Notebook, type Page } from '@/lib/mock-data';

export default function PageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const notebookId = params?.id as string;
  const pageId = params?.pageId as string;
  const [notebook, setNotebook] = useState<Notebook | undefined>(
    notebookId ? getNotebookById(notebookId) : undefined
  );
  const [page, setPage] = useState<Page | undefined>(undefined);

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

  useEffect(() => {
    if (notebookId && pageId) {
      const pages = getPagesByNotebookId(notebookId);
      const foundPage = pages.find((p) => p.id === pageId);
      if (foundPage) {
        setPage(foundPage);
      } else if (pages.length > 0) {
        // If page not found but notebook has pages, redirect to first page
        router.replace(`/notebooks/${notebookId}/pages/${pages[0].id}`);
      } else {
        // If no pages, redirect back to notebook
        router.replace(`/notebooks/${notebookId}`);
      }
    }
  }, [notebookId, pageId, router]);

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
      const deleted = deletePageFromNotebook(notebookId, deletedPageId);
      if (deleted) {
        // Refresh notebook to get updated pages - create a new object reference
        const updatedNotebook = getNotebookById(notebookId);
        if (updatedNotebook) {
          // Create a new object to ensure React detects the change
          setNotebook({ ...updatedNotebook, pages: [...(updatedNotebook.pages || [])] });
        }
        // If the deleted page is the current page, navigate to another page or notebook
        if (deletedPageId === pageId) {
          const pages = getPagesByNotebookId(notebookId);
          if (pages.length > 0) {
            router.replace(`/notebooks/${notebookId}/pages/${pages[0].id}`);
          } else {
            router.replace(`/notebooks/${notebookId}`);
          }
        }
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
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar with notebook info and pages */}
      <Sidebar notebookId={notebookId} notebook={notebook} onNotebookUpdate={handleNotebookUpdate} onAddPage={handleAddPage} onDeletePage={handleDeletePage} />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-8 py-8 mt-12">
            <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
              {page.title}
            </h1>
            <div className="text-[var(--notion-gray-text)]">
              <p>Page content will be displayed here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

