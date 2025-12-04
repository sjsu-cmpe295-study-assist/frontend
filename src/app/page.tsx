'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Search, BookOpen, Plus, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { NotebookCard } from '@/components/NotebookCard';
import { Button } from '@/components/Button';
import { NewNotebookModal } from '@/components/NewNotebookModal';
import { useNotebookStore } from '@/stores/notebookStore';

export default function Home() {
  const router = useRouter();
  const { user, isLoading: loading } = useAuthStore();
  const isAuthenticated = !!user;
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewNotebookModalOpen, setIsNewNotebookModalOpen] = useState(false);
  
  const { notebooks, fetchNotebooks, deleteNotebook, createNotebook } = useNotebookStore();

  // Fetch notebooks on mount
  useEffect(() => {
    if (isAuthenticated && !loading) {
      fetchNotebooks();
    }
  }, [isAuthenticated, loading, fetchNotebooks]);

  const handleDeleteNotebook = async (notebookId: string) => {
    try {
      await deleteNotebook(notebookId);
    } catch (error) {
      console.error('Failed to delete notebook:', error);
    }
  };

  const handleCreateNotebook = async (data: { prompt?: string; documents?: any[] }) => {
    try {
      await createNotebook(data);
      setIsNewNotebookModalOpen(false);
    } catch (error) {
      console.error('Failed to create notebook:', error);
    }
  };

  const handleCreateEmpty = async () => {
    try {
      await createNotebook({});
    } catch (error) {
      console.error('Failed to create empty notebook:', error);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const filteredNotebooks = useMemo(() => {
    if (!searchQuery.trim()) {
      return notebooks;
    }
    const query = searchQuery.toLowerCase();
    return notebooks.filter(
      (notebook) =>
        notebook.title.toLowerCase().includes(query) ||
        notebook.description?.toLowerCase().includes(query)
    );
  }, [searchQuery, notebooks]);

  const groupedNotebooks = useMemo(() => {
    const groups: Record<string, Notebook[]> = {};
    
    filteredNotebooks.forEach((notebook) => {
      const date = new Date(notebook.updatedAt);
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(notebook);
    });

    // Sort groups by date (newest first)
    const sortedGroups = Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].updatedAt);
      const dateB = new Date(b[1][0].updatedAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Sort notebooks within each group by date (newest first)
    sortedGroups.forEach(([_, notebooks]) => {
      notebooks.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });

    return sortedGroups;
  }, [filteredNotebooks]);

  const getTitleSize = (index: number): 'sm' | 'md' | 'lg' => {
    const sizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg', 'md', 'sm', 'lg', 'md', 'sm'];
    return sizes[index % sizes.length];
  };

  if (loading) {
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
            {/* Header with Title, Search Bar, and New Notebook Button */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold text-[var(--foreground)] flex-shrink-0">
                Notebooks
              </h2>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-80">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search notebooks..."
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2 whitespace-nowrap"
                    onClick={handleCreateEmpty}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Empty</span>
                  </Button>
                  <Button
                    variant="primary"
                    className="flex items-center gap-2 whitespace-nowrap"
                    onClick={() => setIsNewNotebookModalOpen(true)}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create Notebook</span>
                  </Button>
                </div>
              </div>
            </div>

            {filteredNotebooks.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center py-32 min-h-[60vh]">
                <div className="w-24 h-24 rounded-full bg-[var(--notion-gray-bg)] flex items-center justify-center mb-6">
                  <Search className="w-12 h-12 text-[var(--notion-gray-text)] opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  No notebooks found
                </h3>
                <p className="text-sm text-[var(--notion-gray-text)] opacity-70">
                  Try searching with different keywords
          </p>
        </div>
            ) : filteredNotebooks.length > 0 ? (
              <div className="gap-3 flex flex-col">
                {groupedNotebooks.map(([monthYear, notebooks]) => (
                  <div key={monthYear} className="gap-3 flex flex-col mt-5">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] tracking-wider">
                      {monthYear}
                    </h3>
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                      {notebooks.map((notebook, index) => (
                        <NotebookCard
                          key={notebook.id}
                          notebook={notebook}
                          titleSize={getTitleSize(index)}
                          onDelete={handleDeleteNotebook}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 min-h-[60vh]">
                <div className="w-24 h-24 rounded-full bg-[var(--notion-gray-bg)] flex items-center justify-center mb-6">
                  <BookOpen className="w-12 h-12 text-[var(--notion-gray-text)] opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  No notebooks yet
                </h3>
                <p className="text-sm text-[var(--notion-gray-text)] opacity-70">
                  Create your first notebook to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Notebook Modal */}
      <NewNotebookModal
        isOpen={isNewNotebookModalOpen}
        onClose={() => setIsNewNotebookModalOpen(false)}
        onCreate={handleCreateNotebook}
      />
    </div>
  );
}
