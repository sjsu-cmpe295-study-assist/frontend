'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { FlashCard } from '@/lib/api/flashcards';

interface FlashCardCardProps {
  flashCard: FlashCard;
  onClick: () => void;
  onDelete?: (flashCardId: string) => void;
}

export function FlashCardCard({ flashCard, onClick, onDelete }: FlashCardCardProps) {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(flashCard.id);
    }
    setIsMenuOpen(false);
  };

  // Calculate percentage
  const percentage = flashCard.timesAnswered && flashCard.timesAnswered > 0
    ? Math.round((flashCard.timesAnsweredCorrectly || 0) / flashCard.timesAnswered * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="min-w-[350px] min-h-[240px] p-6 rounded-lg border border-[var(--notion-gray-border)] bg-[var(--background)] hover:bg-[var(--notion-default-bg-hover)] transition-colors cursor-pointer flex flex-col relative"
    >
      {/* Notebook Title */}
      <div className="mb-3">
        <span className="text-sm font-medium text-[var(--notion-gray-text)]">
          {flashCard.notebookTitle}
        </span>
      </div>

      {/* Question Preview */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 line-clamp-3">
          {flashCard.question}
        </h3>
      </div>

      {/* Correctness Percentage */}
      <div className="flex items-center justify-between mt-auto pt-4">
        {flashCard.timesAnswered !== undefined && flashCard.timesAnswered > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--notion-gray-text)]">
              {flashCard.timesAnsweredCorrectly || 0}/{flashCard.timesAnswered} correct
            </span>
            <span className="text-sm font-semibold text-[var(--foreground)]">
              ({percentage}%)
            </span>
          </div>
        ) : (
          <span className="text-sm font-medium text-[var(--notion-gray-text)]">
            Not answered
          </span>
        )}

        {/* Menu Button */}
        {onDelete && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1.5 rounded-full hover:bg-[var(--notion-gray-bg-hover)] transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-5 h-5 text-[var(--notion-gray-text)]" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 bottom-8 mb-1 w-52 rounded-md border border-[var(--notion-gray-border)] bg-[var(--background)] shadow-lg z-10 p-1">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base text-[var(--foreground)] hover:bg-[var(--notion-gray-bg-hover)] transition-colors rounded-md"
                >
                  <Trash2 className="w-5 h-5 text-[var(--notion-red-text)]" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

