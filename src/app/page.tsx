'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Search, BookOpen, Plus, Sparkles, Brain, FileText, Zap, ArrowRight, Check, Edit3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { NotebookCard } from '@/components/NotebookCard';
import { Button } from '@/components/Button';
import { NewNotebookModal } from '@/components/NewNotebookModal';
import { useNotebookStore } from '@/stores/notebookStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageEditor } from '@/components/editor/PageEditor';
import Link from 'next/link';
import type { Notebook } from '@/lib/mock-data';
import type { JSONContent } from 'novel';

// Demo Editor Component
function DemoEditor() {
  const demoContent: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Welcome to the Notebook Editor' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This is a ' },
          { type: 'text', marks: [{ type: 'bold' }], text: 'fully interactive' },
          { type: 'text', text: ' demo. Try editing this text, or use ' },
          { type: 'text', marks: [{ type: 'code' }], text: '/commands' },
          { type: 'text', text: ' to explore features!' },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Try These Features' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Type / to see slash commands' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Select text to format it' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Create headings, lists, and code blocks' }],
              },
            ],
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Code Example' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'javascript' },
        content: [
          {
            type: 'text',
            text: '// Try editing this code!\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\ngreet("World");',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Quote' }],
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'The best way to learn is by doing. Edit this quote and make it your own!',
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Ready to create your own notebooks? ' },
          { type: 'text', marks: [{ type: 'italic' }], text: 'Sign up' },
          { type: 'text', text: ' to get started!' },
        ],
      },
    ],
  };

  return (
    <PageEditor
      initialContent={demoContent}
      onUpdate={() => {
        // Demo mode - updates are not saved
      }}
      onAskAI={() => {
        // Show message that AI features require sign up
        alert('AI features are available after signing up! Create an account to unlock AI-powered insights.');
      }}
      onMakeFlashCard={() => {
        // Show message that flashcard features require sign up
        alert('Flashcard features are available after signing up! Create an account to generate flashcards from your notes.');
      }}
    />
  );
}

// Landing Page Component
function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Generate notebooks from prompts, get AI insights, and chat with your content',
    },
    {
      icon: FileText,
      title: 'Rich Text Editor',
      description: 'Beautiful, Notion-inspired editor with formatting, lists, code blocks, and more',
    },
    {
      icon: Zap,
      title: 'Smart Flashcards',
      description: 'Automatically generate flashcards from your notes and study efficiently',
    },
    {
      icon: BookOpen,
      title: 'Organized Workspace',
      description: 'Create multiple notebooks and pages, search instantly, and stay organized',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--notion-gray-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--notion-blue-text)]" />
            <span className="text-lg font-semibold text-[var(--foreground)]">Study Assist</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--notion-blue-bg)] border border-[var(--notion-blue-border)] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[var(--notion-blue-text)]" />
            <span className="text-xs font-medium text-[var(--notion-blue-text)]">
              AI-Powered Learning Platform
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:!text-6xl font-bold text-[var(--foreground)] mb-5 leading-tight !tracking-tighter">
            <span className='text-4xl md:text-6xl lg:!text-8xl'>Study Assist</span>
            <br />
            <span className="text-[var(--notion-blue-text)] mt-4">Your Intelligent Learning Companion</span>

          </h1>
          <p className="max-w-3xl mx-auto text-base md:text-lg text-[var(--foreground)] opacity-70 mb-8 mt-5 leading-relaxed">
            Create, organize, and study with AI-powered notebooks. Generate content from prompts,
            turn notes into flashcards, and chat with your documents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button variant="primary" className="text-base px-6 py-2.5 flex items-center gap-2">
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="text-base px-6 py-2.5">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-5 rounded-lg border transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--notion-gray-bg)',
                borderColor: 'var(--notion-gray-border)',
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--notion-blue-bg)' }}>
                <feature.icon className="w-5 h-5 text-[var(--notion-blue-text)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--foreground)] opacity-70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Editor Demo */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--notion-purple-bg)] border border-[var(--notion-purple-border)] mb-4">
            <Edit3 className="w-3.5 h-3.5 text-[var(--notion-purple-text)]" />
            <span className="text-xs font-medium text-[var(--notion-purple-text)]">
              Try it out
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3">
            Experience the editor yourself
          </h2>
          <p className="text-base md:text-lg text-[var(--foreground)] opacity-70 max-w-2xl mx-auto">
            Click anywhere and start typing. Try slash commands (<code className="px-1.5 py-0.5 rounded bg-[var(--notion-gray-bg)] text-xs">/</code>), format text, create lists, and more.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--notion-gray-border)',
            }}
          >
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--notion-gray-border)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--notion-red-bg)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--notion-yellow-bg)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--notion-green-bg)]"></div>
              </div>
              <span className="text-xs text-[var(--notion-gray-text)]">Demo Editor</span>
            </div>
            <div className="p-6">
              <DemoEditor />
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-8 text-center">
            Everything you need to take better notes
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              'AI-powered notebook generation from prompts',
              'Rich text editing with Notion-inspired design',
              'Automatic flashcard creation from your content',
              'AI chat to interact with your documents',
              'Smart search across all your notebooks',
              'Dark and light themes',
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--notion-green-bg)' }}>
                  <Check className="w-3.5 h-3.5 text-[var(--notion-green-text)]" />
                </div>
                <p className="text-base text-[var(--foreground)] opacity-80 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div
          className="rounded-xl border p-8 md:p-10 text-center"
          style={{
            backgroundColor: 'var(--notion-blue-bg)',
            borderColor: 'var(--notion-blue-border)',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3">
            Ready to get started?
          </h2>
          <p className="text-base md:text-lg text-[var(--foreground)] opacity-70 mb-6 max-w-2xl mx-auto">
            Join thousands of users who are already using AI-powered notebooks to take better notes and study smarter.
          </p>
          <Link href="/signup">
            <Button variant="primary" className="text-base px-6 py-2.5 flex items-center gap-2 mx-auto">
              Create your first notebook
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--notion-gray-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--notion-blue-text)]" />
              <span className="text-base font-semibold text-[var(--foreground)]">Study Assist</span>
            </div>
            <p className="text-xs text-[var(--foreground)] opacity-60">
              © 2024 Study Assist. Built with Next.js and AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Authenticated Home Page Component
function AuthenticatedHome() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewNotebookModalOpen, setIsNewNotebookModalOpen] = useState(false);
  
  const { notebooks, fetchNotebooks, deleteNotebook, createNotebook } = useNotebookStore();

  useEffect(() => {
      fetchNotebooks();
  }, [fetchNotebooks]);

  const handleDeleteNotebook = async (notebookId: string) => {
    try {
      await deleteNotebook(notebookId);
    } catch (error) {
      console.error('Failed to delete notebook:', error);
    }
  };

  const handleCreateNotebook = async (data: { prompt?: string; documents?: any[] }) => {
    try {
      const notebook = await createNotebook(data);
      setIsNewNotebookModalOpen(false);
      
      if (notebook.pagesCount > 0) {
        if (notebook.pages && notebook.pages.length > 0) {
          router.push(`/notebooks/${notebook.id}/pages/${notebook.pages[0].id}`);
        } else {
          router.push(`/notebooks/${notebook.id}`);
        }
      } else if (data.documents && data.documents.length > 0) {
        alert('Notebook created, but no pages were generated. The documents may have failed to process.');
        router.push(`/notebooks/${notebook.id}`);
      } else {
        router.push(`/notebooks/${notebook.id}`);
      }
    } catch (error) {
      console.error('Failed to create notebook:', error);
      throw error;
    }
  };

  const handleCreateEmpty = async () => {
    try {
      await createNotebook({});
    } catch (error) {
      console.error('Failed to create empty notebook:', error);
    }
  };

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

// Main Home Component
export default function Home() {
  const { user, isLoading: loading } = useAuthStore();
  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--foreground)]">Loading...</div>
      </div>
    );
  }

  // Show landing page for unauthenticated users, notebooks list for authenticated users
  return isAuthenticated ? <AuthenticatedHome /> : <LandingPage />;
}
