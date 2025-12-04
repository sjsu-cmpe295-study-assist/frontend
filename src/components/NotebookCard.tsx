'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Paperclip, MoreHorizontal, Trash2 } from 'lucide-react';
import { type Notebook } from '@/lib/mock-data';
import { useNotebookStore } from '@/stores/notebookStore';

interface NotebookCardProps {
  notebook: Notebook;
  titleSize?: 'sm' | 'md' | 'lg';
  onDelete?: (notebookId: string) => void;
}

export function NotebookCard({ notebook, titleSize = 'md', onDelete }: NotebookCardProps) {
  const router = useRouter();
  const { getPagesByNotebookId } = useNotebookStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notebook.id);
    }
    setIsMenuOpen(false);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Updated recently';
    }
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Handle future dates or same day
    if (diffInDays < 0) {
      return 'Updated today';
    }
    
    if (diffInDays === 0) return 'Updated today';
    if (diffInDays === 1) return 'Updated yesterday';
    if (diffInDays < 7) return `Updated ${diffInDays} days ago`;
    if (diffInDays < 30) return `Updated ${Math.floor(diffInDays / 7)} weeks ago`;
    return `Updated ${Math.floor(diffInDays / 30)} months ago`;
  };

  const titleSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const handleCardClick = () => {
    // Prefetch routes for smoother navigation
    router.prefetch(`/notebooks/${notebook.id}`);
    
    // Check if pages are already in cache
    const pages = getPagesByNotebookId(notebook.id);
    
    // Navigate directly to first page if pages exist in cache, otherwise to notebook detail
    // The notebook detail page will handle fetching and redirecting if needed
    if (pages.length > 0) {
      router.prefetch(`/notebooks/${notebook.id}/pages/${pages[0].id}`);
      router.push(`/notebooks/${notebook.id}/pages/${pages[0].id}`);
    } else {
      router.push(`/notebooks/${notebook.id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="h-full min-h-[240px] min-w-[350px] flex flex-col rounded-lg p-6 border border-[var(--notion-gray-border)] bg-[var(--background)] cursor-pointer transition-all hover:shadow-md hover:bg-[var(--notion-default-bg-hover)] relative"
    >
      <h3 className={`${titleSizeClasses[titleSize]} font-semibold mb-3 text-[var(--foreground)] line-clamp-2`}>
        {notebook.title}
      </h3>
      {notebook.description && (
        <p className="text-sm text-[var(--foreground)] opacity-70 line-clamp-3  leading-relaxed">
          {notebook.description}
        </p>
      )}
      
      {/* Chips */}
      <div className='flex-grow mt-2'>
      <div className="flex flex-wrap gap-2 mb-4 ">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--notion-blue-bg)] text-[var(--notion-blue-text)] border border-[var(--notion-blue-border)]">
          <FileText className="w-3.5 h-3.5" />
          {notebook.pagesCount} {notebook.pagesCount === 1 ? 'page' : 'pages'}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--notion-green-bg)] text-[var(--notion-green-text)] border border-[var(--notion-green-border)]">
          <Paperclip className="w-3.5 h-3.5" />
          {notebook.documentsCount} {notebook.documentsCount === 1 ? 'document' : 'documents'}
        </span>
      </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto">
        <p className="text-xs font-medium text-[var(--foreground)] opacity-60">
          {formatDate(notebook.updatedAt)}
        </p>
        
        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1.5 rounded-md hover:bg-[var(--notion-gray-bg-hover)] transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4 text-[var(--notion-gray-text)]" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 bottom-8 mb-1 w-52 rounded-md border border-[var(--notion-gray-border)] bg-[var(--background)] shadow-lg z-10 p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-base text-[var(--foreground)] hover:bg-[var(--notion-gray-bg-hover)] transition-colors rounded-md"
              >
                <Trash2 className="w-5 h-5 text-[var(--notion-red-text)]" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

