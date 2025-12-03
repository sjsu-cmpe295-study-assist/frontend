'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Search, BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { NotebookCard } from '@/components/NotebookCard';
import { Button } from '@/components/Button';
import { NewNotebookModal } from '@/components/NewNotebookModal';
import { mockNotebooksWithPages, type Notebook } from '@/lib/mock-data';

export default function Home() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notebooks, setNotebooks] = useState<Notebook[]>(mockNotebooksWithPages);
  const [isNewNotebookModalOpen, setIsNewNotebookModalOpen] = useState(false);

  const handleDeleteNotebook = (notebookId: string) => {
    setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId));
  };

  const handleCreateNotebook = (data: { prompt?: string; documents?: any[] }) => {
    // TODO: Implement actual notebook creation API call
    const newNotebook: Notebook = {
      id: Math.random().toString(36).substring(7),
      title: 'Untitled Notebook',
      description: data.prompt,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      pagesCount: 0,
      documentsCount: data.documents?.length || 0,
    };
    setNotebooks((prev) => [newNotebook, ...prev]);
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
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-8 py-8 mt-12">
            {/* Header with Title, Search Bar, and New Notebook Button */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold text-[var(--foreground)]">
                Notebooks
              </h2>
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="flex-1">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search notebooks..."
                  />
                </div>
                <Button
                  variant="primary"
                  className="flex items-center gap-2 whitespace-nowrap"
                  onClick={() => setIsNewNotebookModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Notebook</span>
                </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
