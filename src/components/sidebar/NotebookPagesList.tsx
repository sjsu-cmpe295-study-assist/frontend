import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { type Page } from '@/lib/mock-data';

interface NotebookPagesListProps {
  notebookId: string;
  pages: Page[];
  onAddPage?: () => void;
  onDeletePage?: (pageId: string) => void;
  onUpdatePage?: (pageId: string, updates: { title?: string }) => void;
}

export function NotebookPagesList({ notebookId, pages, onAddPage, onDeletePage, onUpdatePage }: NotebookPagesListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.values(menuRefs.current).forEach((ref) => {
        if (ref && !ref.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      });
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleDelete = (pageId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeletePage) {
      onDeletePage(pageId);
    }
    setOpenMenuId(null);
  };

  const handleStartEdit = (page: Page, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPageId(page.id);
    setEditedTitle(page.title);
  };

  const handleSaveEdit = (pageId: string) => {
    if (editedTitle.trim() && onUpdatePage) {
      const page = pages.find(p => p.id === pageId);
      if (page && editedTitle.trim() !== page.title) {
        onUpdatePage(pageId, { title: editedTitle.trim() });
      }
    }
    setEditingPageId(null);
    setEditedTitle('');
  };

  const handleCancelEdit = (page: Page) => {
    setEditedTitle(page.title);
    setEditingPageId(null);
  };

  useEffect(() => {
    if (editingPageId && inputRefs.current[editingPageId]) {
      inputRefs.current[editingPageId]?.focus();
      inputRefs.current[editingPageId]?.select();
    }
  }, [editingPageId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingPageId) {
        const input = inputRefs.current[editingPageId];
        if (input && !input.contains(event.target as Node)) {
          handleSaveEdit(editingPageId);
        }
      }
    };

    if (editingPageId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingPageId, editedTitle, pages, onUpdatePage]);

  // Deduplicate pages by ID to prevent React key warnings
  const uniquePages = Array.from(
    new Map(pages.map(page => [page.id, page])).values()
  );

  return (
    <div>
      <nav className="">
        {uniquePages.length > 0 ? (
          uniquePages.map((page) => {
            const isActive = pathname === `/notebooks/${notebookId}/pages/${page.id}`;
            const isMenuOpen = openMenuId === page.id;
            const isEditing = editingPageId === page.id;
            return (
              <div
                key={page.id}
                onClick={() => {
                  if (!isMenuOpen && !isEditing) {
                    router.push(`/notebooks/${notebookId}/pages/${page.id}`);
                  }
                }}
                className={`group flex items-center gap-3 px-2 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--notion-blue-bg)] text-[var(--notion-blue-text)]'
                    : 'text-[var(--notion-gray-text)] hover:bg-[var(--notion-gray-bg-hover)] hover:text-[var(--foreground)]'
                } ${isEditing ? '' : 'cursor-pointer'}`}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                {isEditing ? (
                  <input
                    ref={(el) => { inputRefs.current[page.id] = el; }}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(page.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEdit(page.id);
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelEdit(page);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-base !font-medium text-[var(--foreground)] px-0 py-0 m-0"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <span 
                    className="truncate flex-1 min-w-0 cursor-text"
                    onDoubleClick={(e) => handleStartEdit(page, e)}
                    onClick={(e) => {
                      if (e.detail === 2) {
                        handleStartEdit(page, e);
                      }
                    }}
                  >
                    {page.title}
                  </span>
                )}
                <div className="relative flex-shrink-0" ref={(el) => { menuRefs.current[page.id] = el; }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : page.id);
                    }}
                    className="p-1.5 rounded-md hover:bg-[var(--notion-gray-bg-hover)] transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="w-4 h-4 text-[var(--notion-gray-text)]" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 mt-1 w-52 rounded-md border border-[var(--notion-gray-border)] bg-[var(--background)] shadow-lg z-10 p-1">
                      <button
                        onClick={(e) => handleDelete(page.id, e)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-base text-[var(--foreground)] hover:bg-[var(--notion-gray-bg-hover)] transition-colors rounded-md"
                      >
                        <Trash2 className="w-5 h-5 text-[var(--notion-red-text)]" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[var(--notion-gray-text)] px-2 opacity-70">
            No pages yet
          </p>
        )}
      </nav>
    </div>
  );
}

