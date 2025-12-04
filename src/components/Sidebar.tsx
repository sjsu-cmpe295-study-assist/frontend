'use client';

import { useMemo } from 'react';
import { useNotebookStore } from '@/stores/notebookStore';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { NavigationItems } from './sidebar/NavigationItems';
import { NotebookInfo } from './sidebar/NotebookInfo';
import { UserSection } from './sidebar/UserSection';

import type { Notebook } from '@/lib/mock-data';

interface SidebarProps {
  notebookId?: string;
  notebook?: Notebook;
  onNotebookUpdate?: (id: string, updates: { title?: string; description?: string }) => void;
  onAddPage?: () => void;
  onDeletePage?: (pageId: string) => void;
  onUpdatePage?: (pageId: string, updates: { title?: string }) => void;
}

export function Sidebar({ notebookId, notebook: notebookProp, onNotebookUpdate, onAddPage, onDeletePage, onUpdatePage }: SidebarProps = {}) {
  const { getNotebookById, getPagesByNotebookId } = useNotebookStore();
  
  const notebook = useMemo(() => {
    return notebookProp || (notebookId ? getNotebookById(notebookId) : undefined);
  }, [notebookProp, notebookId, getNotebookById]);
  
  const pages = useMemo(() => {
    if (!notebookId) return [];
    const allPages = getPagesByNotebookId(notebookId);
    // Deduplicate by page ID to prevent React key warnings
    const uniquePages = Array.from(
      new Map(allPages.map(page => [page.id, page])).values()
    );
    return uniquePages;
  }, [notebookId, getPagesByNotebookId]);

  // Wrapper for onDeletePage
  const handleDeletePage = (pageId: string) => {
    if (onDeletePage) {
      onDeletePage(pageId);
    }
  };

  // Wrapper for onAddPage
  const handleAddPage = () => {
    if (onAddPage) {
      onAddPage();
    }
  };

  // Wrapper for onUpdatePage
  const handleUpdatePage = (pageId: string, updates: { title?: string }) => {
    if (onUpdatePage) {
      onUpdatePage(pageId, updates);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-80 border-r border-[var(--notion-gray-border)] bg-[var(--background)] flex flex-col z-10">
      <SidebarHeader notebook={notebook} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {notebook ? (
          <NotebookInfo
            notebook={notebook}
            notebookId={notebookId!}
            pages={pages}
            onUpdate={onNotebookUpdate || (() => {})}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            onUpdatePage={handleUpdatePage}
          />
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            <NavigationItems />
          </div>
        )}
      </div>

      <UserSection />
    </div>
  );
}

