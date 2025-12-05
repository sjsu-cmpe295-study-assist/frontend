'use client';

import { useEffect, useState, useRef } from 'react';
import { X, FileQuestion, MoreHorizontal, Trash2 } from 'lucide-react';
import { getFlashCardsByNotebookId, deleteFlashCard, type FlashCard } from '@/lib/api/flashcards';
import { FlashCardPopover } from './FlashCardPopover';

interface FlashCardsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  notebookTitle: string;
}

export function FlashCardsPopover({ isOpen, onClose, notebookId, notebookTitle }: FlashCardsPopoverProps) {
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlashCard, setSelectedFlashCard] = useState<FlashCard | null>(null);
  const [isFlashCardOpen, setIsFlashCardOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch flash cards when popover opens
  useEffect(() => {
    if (isOpen && notebookId) {
      setIsLoading(true);
      getFlashCardsByNotebookId(notebookId)
        .then((cards) => {
          // Filter to ensure only flash cards from this notebook are shown
          // (in case backend doesn't filter correctly)
          const filteredCards = cards.filter((card) => card.notebookId === notebookId);
          setFlashCards(filteredCards);
        })
        .catch((error) => {
          console.error('Failed to fetch flash cards:', error);
          setFlashCards([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setFlashCards([]);
    }
  }, [isOpen, notebookId]);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId]?.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleFlashCardClick = (flashCard: FlashCard, e?: React.MouseEvent) => {
    // Don't open if clicking on menu button
    if (e && (e.target as HTMLElement).closest('.menu-button')) {
      return;
    }
    setSelectedFlashCard(flashCard);
    setIsFlashCardOpen(true);
  };

  const handleDeleteFlashCard = async (flashCardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    
    if (!confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }

    try {
      await deleteFlashCard(flashCardId);
      // Remove from local state
      setFlashCards((prev) => prev.filter((card) => card.id !== flashCardId));
      // Close popover if the deleted card was open
      if (selectedFlashCard?.id === flashCardId) {
        setIsFlashCardOpen(false);
        setSelectedFlashCard(null);
      }
    } catch (error) {
      console.error('Failed to delete flash card:', error);
      alert('Failed to delete flash card. Please try again.');
    }
  };

  const handleCloseFlashCard = () => {
    setIsFlashCardOpen(false);
    setSelectedFlashCard(null);
    // Refresh flash cards when closing the individual flash card popover
    if (notebookId) {
      getFlashCardsByNotebookId(notebookId)
        .then((cards) => {
          // Filter to ensure only flash cards from this notebook are shown
          const filteredCards = cards.filter((card) => card.notebookId === notebookId);
          setFlashCards(filteredCards);
        })
        .catch((error) => {
          console.error('Failed to refresh flash cards:', error);
        });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (isNaN(date.getTime())) {
      return 'Recently';
    }

    if (diffInDays < 0) {
      return 'Today';
    }

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return '1 day ago';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Flash Cards Popover */}
      <div className="fixed bottom-6 right-6 w-[500px] h-[700px] max-h-[calc(100vh-3rem)] bg-[var(--background)] border border-[var(--notion-gray-border)] rounded-4xl z-50 flex flex-col shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--notion-purple-bg)] flex items-center justify-center">
              <FileQuestion className="w-4 h-4 text-[var(--notion-purple-text)]" />
            </div>
            <div>
              <span className="text-base font-semibold text-[var(--foreground)]">
                Flash Cards ({flashCards.length})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--notion-red-bg)] hover:text-[var(--notion-red-text)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flash Cards List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-[var(--notion-gray-text)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : flashCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--notion-purple-bg)] to-[var(--notion-purple-text)]/20 flex items-center justify-center mb-8 shadow-lg">
                <FileQuestion className="w-10 h-10 text-[var(--notion-purple-text)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3 text-center">
                No flash cards yet
              </h3>
              <p className="text-sm text-[var(--notion-gray-text)] text-center max-w-md leading-relaxed">
                Select text in your pages and click "Make Flashcard" to create flash cards for this notebook.
              </p>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-2">
              {flashCards.map((flashCard) => {
                const isMenuOpen = openMenuId === flashCard.id;
                return (
                  <div
                    key={flashCard.id}
                    onClick={(e) => handleFlashCardClick(flashCard, e)}
                    className="flex items-start gap-3 p-3 rounded-lg border border-[var(--notion-gray-border)] bg-[var(--background)] hover:bg-[var(--notion-gray-bg-hover)] transition-colors cursor-pointer relative"
                  >
                    <div className="w-10 h-10 rounded-md bg-[var(--notion-purple-bg)] flex items-center justify-center flex-shrink-0">
                      <FileQuestion className="w-5 h-5 text-[var(--notion-purple-text)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] line-clamp-2 mb-1">
                        {flashCard.question}
                      </p>
                      <p className="text-xs text-[var(--notion-gray-text)]">
                        {formatDate(flashCard.createdAt)}
                      </p>
                    </div>
                    
                    {/* Menu Button */}
                    <div 
                      className="relative menu-button" 
                      ref={(el) => {
                        menuRefs.current[flashCard.id] = el;
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : flashCard.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-[var(--notion-gray-bg-hover)] transition-colors"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="w-4 h-4 text-[var(--notion-gray-text)]" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 mt-1 w-52 rounded-md border border-[var(--notion-gray-border)] bg-[var(--background)] shadow-lg z-10 p-1">
                          <button
                            onClick={(e) => handleDeleteFlashCard(flashCard.id, e)}
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
              })}
            </div>
          )}
        </div>
      </div>

      {/* Individual Flash Card Popover */}
      <FlashCardPopover
        isOpen={isFlashCardOpen}
        onClose={handleCloseFlashCard}
        flashCard={selectedFlashCard}
      />
    </>
  );
}

