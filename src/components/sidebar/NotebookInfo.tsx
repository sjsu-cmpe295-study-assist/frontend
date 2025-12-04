import { Plus } from 'lucide-react';
import { type Notebook } from '@/lib/mock-data';
import { EditableNotebookTitle } from './EditableNotebookTitle';
import { EditableNotebookDescription } from './EditableNotebookDescription';
import { NotebookPagesList } from './NotebookPagesList';

interface NotebookInfoProps {
  notebook: Notebook;
  notebookId: string;
  pages: ReturnType<typeof import('@/lib/mock-data').getPagesByNotebookId>;
  onUpdate: (id: string, updates: { title?: string; description?: string }) => void;
  onAddPage?: () => void;
  onDeletePage?: (pageId: string) => void;
  onUpdatePage?: (pageId: string, updates: { title?: string }) => void;
}

export function NotebookInfo({ notebook, notebookId, pages, onUpdate, onAddPage, onDeletePage, onUpdatePage }: NotebookInfoProps) {
  const handleUpdate = (updates: { title?: string; description?: string }) => {
    onUpdate(notebookId, updates);
  };

  return (
    <div className="flex flex-col h-full px-4">
      {/* Sticky Header Section */}
      <div className="flex-shrink-0 pt-2 pb-2 bg-[var(--background)]">
        <EditableNotebookTitle
          notebook={notebook}
          notebookId={notebookId}
          onUpdate={handleUpdate}
        />
        <EditableNotebookDescription
          notebook={notebook}
          notebookId={notebookId}
          onUpdate={handleUpdate}
        />
        <div className="flex items-center justify-between px-2 mt-6">
          <p className="text-sm font-bold uppercase tracking-wider">
            Pages
          </p>
          <button
            onClick={onAddPage}
            className="p-1.5 rounded-md hover:bg-[var(--notion-gray-bg-hover)] transition-colors"
            aria-label="Add page"
            title="Add page"
          >
            <Plus className="w-4 h-4 text-[var(--notion-gray-text)]" />
          </button>
        </div>
      </div>

      {/* Scrollable Pages List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <NotebookPagesList notebookId={notebookId} pages={pages} onAddPage={onAddPage} onDeletePage={onDeletePage} onUpdatePage={onUpdatePage} />
      </div>
    </div>
  );
}

