'use client';

import { useEffect, useState } from 'react';
import { getNotebookById, getPagesByNotebookId } from '@/lib/mock-data';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { NavigationItems } from './sidebar/NavigationItems';
import { NotebookInfo } from './sidebar/NotebookInfo';
import { UserSection } from './sidebar/UserSection';

interface SidebarProps {
  notebookId?: string;
  notebook?: ReturnType<typeof getNotebookById>;
  onNotebookUpdate?: (id: string, updates: { title?: string; description?: string }) => void;
  onAddPage?: () => void;
  onDeletePage?: (pageId: string) => void;
}

export function Sidebar({ notebookId, notebook: notebookProp, onNotebookUpdate, onAddPage, onDeletePage }: SidebarProps = {}) {
  const notebook = notebookProp || (notebookId ? getNotebookById(notebookId) : undefined);
  const [pages, setPages] = useState(notebookId ? getPagesByNotebookId(notebookId) : []);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Update pages when notebook or notebookId changes
  useEffect(() => {
    if (notebookId) {
      const updatedPages = getPagesByNotebookId(notebookId);
      setPages(updatedPages);
    } else {
      setPages([]);
    }
  }, [notebookId, notebook?.pagesCount, notebook?.updatedAt, notebook?.pages?.length, refreshTrigger]);

  // Wrapper for onDeletePage that refreshes pages
  const handleDeletePage = (pageId: string) => {
    if (onDeletePage && notebookId) {
      // Call parent callback first (this deletes the page from mock data)
      onDeletePage(pageId);
      // Force refresh by updating trigger and pages state
      setRefreshTrigger(prev => prev + 1);
      const updatedPages = getPagesByNotebookId(notebookId);
      setPages(updatedPages);
    }
  };

  // Wrapper for onAddPage that refreshes pages
  const handleAddPage = () => {
    if (onAddPage && notebookId) {
      // Call parent callback first (this adds the page to mock data)
      onAddPage();
      // Force refresh by updating trigger and pages state
      setRefreshTrigger(prev => prev + 1);
      const updatedPages = getPagesByNotebookId(notebookId);
      setPages(updatedPages);
    }
  };

  return (
    <div className="h-screen w-80 border-r border-[var(--notion-gray-border)] bg-[var(--background)] flex flex-col">
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

