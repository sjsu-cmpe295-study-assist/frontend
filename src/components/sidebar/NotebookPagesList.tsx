import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { type Page } from '@/lib/mock-data';

interface NotebookPagesListProps {
  notebookId: string;
  pages: Page[];
  onAddPage?: () => void;
  onDeletePage?: (pageId: string) => void;
}

export function NotebookPagesList({ notebookId, pages, onAddPage, onDeletePage }: NotebookPagesListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  return (
    <div>
      <nav className="">
        {pages.length > 0 ? (
          pages.map((page) => {
            const isActive = pathname === `/notebooks/${notebookId}/pages/${page.id}`;
            const isMenuOpen = openMenuId === page.id;
            return (
              <div
                key={page.id}
                onClick={() => {
                  if (!isMenuOpen) {
                    router.push(`/notebooks/${notebookId}/pages/${page.id}`);
                  }
                }}
                className={`group flex items-center gap-3 px-2 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--notion-gray-bg)] text-[var(--foreground)]'
                    : 'text-[var(--notion-gray-text)] hover:bg-[var(--notion-gray-bg-hover)] hover:text-[var(--foreground)]'
                }`}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span className="truncate flex-1 min-w-0">{page.title}</span>
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

