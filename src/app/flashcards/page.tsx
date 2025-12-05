'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { FlashCardCard } from '@/components/FlashCardCard';
import { FlashCardPopover } from '@/components/FlashCardPopover';
import { getFlashCards, type FlashCard } from '@/lib/api/flashcards';
import { FileQuestion } from 'lucide-react';

export default function FlashCardsPage() {
  const router = useRouter();
  const { user, isLoading: loading } = useAuthStore();
  const isAuthenticated = !!user;
  const [searchQuery, setSearchQuery] = useState('');
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlashCard, setSelectedFlashCard] = useState<FlashCard | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch flash cards
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setIsLoading(true);
      getFlashCards()
        .then((cards) => {
          setFlashCards(cards);
        })
        .catch((error) => {
          console.error('Failed to fetch flash cards:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isAuthenticated, loading]);

  // Filter flash cards by search query
  const filteredFlashCards = useMemo(() => {
    if (!searchQuery.trim()) return flashCards;
    const query = searchQuery.toLowerCase();
    return flashCards.filter(
      (card) =>
        card.question.toLowerCase().includes(query) ||
        card.notebookTitle.toLowerCase().includes(query)
    );
  }, [flashCards, searchQuery]);

  const handleFlashCardClick = (flashCard: FlashCard) => {
    setSelectedFlashCard(flashCard);
    setIsPopoverOpen(true);
  };

  const handleClosePopover = () => {
    setIsPopoverOpen(false);
    setSelectedFlashCard(null);
  };

  const handleDeleteFlashCard = async (flashCardId: string) => {
    try {
      const { deleteFlashCard } = await import('@/lib/api/flashcards');
      await deleteFlashCard(flashCardId);
      // Remove from local state
      setFlashCards((prev) => prev.filter((card) => card.id !== flashCardId));
      // Close popover if the deleted card was open
      if (selectedFlashCard?.id === flashCardId) {
        setIsPopoverOpen(false);
        setSelectedFlashCard(null);
      }
    } catch (error) {
      console.error('Failed to delete flash card:', error);
      alert('Failed to delete flash card. Please try again.');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--foreground)]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="ml-80 flex flex-col overflow-hidden min-h-screen">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-8 py-8 mt-12">
            {/* Header with Title and Search Bar */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold text-[var(--foreground)] flex-shrink-0">
                Flash Cards
              </h2>
              <div className="w-80">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search flash cards..."
                />
              </div>
            </div>

            {/* Empty State - No Search Results */}
            {filteredFlashCards.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--notion-gray-bg)] to-[var(--notion-gray-text)]/20 flex items-center justify-center mb-8 shadow-lg">
                  <FileQuestion className="w-10 h-10 text-[var(--notion-gray-text)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3 text-center">
                  No flash cards found
                </h3>
                <p className="text-sm text-[var(--notion-gray-text)] text-center max-w-md">
                  Try searching with different keywords
                </p>
              </div>
            )}

            {/* Empty State - No Flash Cards */}
            {filteredFlashCards.length === 0 && !searchQuery && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--notion-gray-bg)] to-[var(--notion-gray-text)]/20 flex items-center justify-center mb-8 shadow-lg">
                  <FileQuestion className="w-10 h-10 text-[var(--notion-gray-text)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3 text-center">
                  No flash cards yet
                </h3>
                <p className="text-sm text-[var(--notion-gray-text)] text-center max-w-md">
                  Flash cards will appear here when they are generated from your notebooks.
                </p>
              </div>
            )}

            {/* Flash Cards Grid */}
            {filteredFlashCards.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
                {filteredFlashCards.map((flashCard) => (
                  <FlashCardCard
                    key={flashCard.id}
                    flashCard={flashCard}
                    onClick={() => handleFlashCardClick(flashCard)}
                    onDelete={handleDeleteFlashCard}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Flash Card Popover */}
      <FlashCardPopover
        isOpen={isPopoverOpen}
        onClose={handleClosePopover}
        flashCard={selectedFlashCard}
      />
    </div>
  );
}

