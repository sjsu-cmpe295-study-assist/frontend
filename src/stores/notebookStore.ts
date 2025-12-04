import { create } from 'zustand';
import type { Notebook, Page } from '@/lib/mock-data';
import * as notebookApi from '@/lib/api/notebooks';

interface NotebookStore {
  // State
  notebooks: Notebook[];
  isLoading: boolean;
  error: string | null;
  loadedPages: Record<string, Page[]>; // Cache of loaded pages by notebookId

  // Actions
  fetchNotebooks: () => Promise<void>;
  getNotebookById: (id: string) => Notebook | undefined;
  fetchNotebookById: (id: string) => Promise<Notebook | undefined>;
  getPagesByNotebookId: (notebookId: string) => Page[];
  fetchPagesForNotebook: (notebookId: string) => Promise<void>;
  
  // Notebook CRUD
  createNotebook: (data: { prompt?: string; documents?: any[]; title?: string }) => Promise<Notebook>;
  updateNotebook: (id: string, updates: { title?: string; description?: string }) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  
  // Page CRUD
  addPageToNotebook: (notebookId: string) => Promise<Page>;
  updatePage: (notebookId: string, pageId: string, updates: { title?: string; content?: any }) => Promise<Page>;
  deletePageFromNotebook: (notebookId: string, pageId: string) => Promise<void>;
  getPageById: (notebookId: string, pageId: string) => Promise<Page | undefined>;
}

export const useNotebookStore = create<NotebookStore>((set, get) => ({
  // Initial state - empty, will be fetched from API
  notebooks: [],
  isLoading: false,
  error: null,
  loadedPages: {},

  // Fetch all notebooks
  fetchNotebooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const notebooks = await notebookApi.getNotebooks();
      set({ notebooks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch notebooks',
        isLoading: false 
      });
      throw error;
    }
  },

  // Get notebook by ID (from cache)
  getNotebookById: (id: string) => {
    return get().notebooks.find((nb) => nb.id === id);
  },

  // Fetch a single notebook by ID from API (with pages)
  fetchNotebookById: async (id: string) => {
    try {
      const notebook = await notebookApi.getNotebookById(id);
      if (notebook) {
        // Update notebooks list
        set((state) => {
          const existingIndex = state.notebooks.findIndex((nb) => nb.id === id);
          if (existingIndex >= 0) {
            // Update existing notebook
            const updated = [...state.notebooks];
            updated[existingIndex] = notebook;
            return { notebooks: updated };
          } else {
            // Add new notebook
            return { notebooks: [...state.notebooks, notebook] };
          }
        });
        
        // Update pages cache if notebook has pages
        if (notebook.pages && notebook.pages.length > 0) {
          set((state) => ({
            loadedPages: {
              ...state.loadedPages,
              [id]: notebook.pages!,
            },
          }));
        }
      }
      return notebook;
    } catch (error) {
      console.error('Failed to fetch notebook:', error);
      return undefined;
    }
  },

  // Get pages for a notebook (from cache)
  getPagesByNotebookId: (notebookId: string) => {
    return get().loadedPages[notebookId] || [];
  },

  // Fetch pages for a notebook from API
  fetchPagesForNotebook: async (notebookId: string) => {
    try {
      const pages = await notebookApi.getPagesByNotebookId(notebookId);
      // Deduplicate pages by ID to prevent duplicates
      const uniquePages = Array.from(
        new Map(pages.map(page => [page.id, page])).values()
      );
      set((state) => ({
        loadedPages: {
          ...state.loadedPages,
          [notebookId]: uniquePages,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  },

  // Create a new notebook
  createNotebook: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newNotebook = await notebookApi.createNotebook(data);
      set((state) => ({
        notebooks: [newNotebook, ...state.notebooks],
        isLoading: false,
      }));
      return newNotebook;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create notebook',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update a notebook
  updateNotebook: async (id: string, updates: { title?: string; description?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await notebookApi.updateNotebook(id, updates);
      set((state) => ({
        notebooks: state.notebooks.map((nb) => 
          nb.id === id ? updated : nb
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update notebook',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete a notebook
  deleteNotebook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await notebookApi.deleteNotebook(id);
      set((state) => ({
        notebooks: state.notebooks.filter((nb) => nb.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete notebook',
        isLoading: false 
      });
      throw error;
    }
  },

  // Add a page to a notebook
  addPageToNotebook: async (notebookId: string) => {
    set({ isLoading: true, error: null });
    try {
      const newPage = await notebookApi.addPageToNotebook(notebookId);
      set((state) => ({
        notebooks: state.notebooks.map((nb) => {
          if (nb.id === notebookId) {
            return {
              ...nb,
              pagesCount: (nb.pagesCount || 0) + 1,
              updatedAt: newPage.updatedAt,
            };
          }
          return nb;
        }),
        loadedPages: {
          ...state.loadedPages,
          [notebookId]: [newPage, ...(state.loadedPages[notebookId] || [])],
        },
        isLoading: false,
      }));
      return newPage;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add page',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update a page
  updatePage: async (notebookId: string, pageId: string, updates: { title?: string; content?: any }) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPage = await notebookApi.updatePage(notebookId, pageId, updates);
      set((state) => {
        const currentPages = state.loadedPages[notebookId] || [];
        const pageIndex = currentPages.findIndex((p) => p.id === pageId);
        
        // Update or add the page with full content
        let updatedPages: Page[];
        if (pageIndex >= 0) {
          updatedPages = [...currentPages];
          updatedPages[pageIndex] = updatedPage;
        } else {
          updatedPages = [...currentPages, updatedPage];
        }
        
        // Sort by updatedAt (newest first)
        updatedPages.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        
        return {
          notebooks: state.notebooks.map((nb) => {
            if (nb.id === notebookId) {
              return {
                ...nb,
                updatedAt: updatedPage.updatedAt,
              };
            }
            return nb;
          }),
          loadedPages: {
            ...state.loadedPages,
            [notebookId]: updatedPages,
          },
          isLoading: false,
        };
      });
      return updatedPage;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update page',
        isLoading: false 
      });
      throw error;
    }
  },

  // Get a single page by ID (fetches from API if not in cache)
  getPageById: async (notebookId: string, pageId: string) => {
    const cachedPages = get().loadedPages[notebookId];
    const cachedPage = cachedPages?.find((p) => p.id === pageId);
    
    if (cachedPage) {
      return cachedPage;
    }

    try {
      const page = await notebookApi.getPageById(notebookId, pageId);
      if (page) {
        set((state) => {
          const currentPages = state.loadedPages[notebookId] || [];
          // Check if page already exists to avoid duplicates
          const pageExists = currentPages.some((p) => p.id === pageId);
          if (pageExists) {
            // Update existing page
            return {
              loadedPages: {
                ...state.loadedPages,
                [notebookId]: currentPages.map((p) => (p.id === pageId ? page : p)),
              },
            };
          } else {
            // Add new page
            return {
              loadedPages: {
                ...state.loadedPages,
                [notebookId]: [...currentPages, page],
              },
            };
          }
        });
      }
      return page;
    } catch (error) {
      console.error('Failed to fetch page:', error);
      return undefined;
    }
  },

  // Delete a page from a notebook
  deletePageFromNotebook: async (notebookId: string, pageId: string) => {
    set({ isLoading: true, error: null });
    try {
      await notebookApi.deletePageFromNotebook(notebookId, pageId);
      set((state) => ({
        notebooks: state.notebooks.map((nb) => {
          if (nb.id === notebookId) {
            return {
              ...nb,
              pagesCount: Math.max(0, (nb.pagesCount || 0) - 1),
            };
          }
          return nb;
        }),
        loadedPages: {
          ...state.loadedPages,
          [notebookId]: (state.loadedPages[notebookId] || []).filter((p) => p.id !== pageId),
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete page',
        isLoading: false 
      });
      throw error;
    }
  },
}));

