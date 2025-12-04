/**
 * Mock notebook data
 */

export interface Page {
  id: string;
  title: string;
  content?: any; // JSONContent from Novel editor (TipTap/ProseMirror JSON format)
  updatedAt: string;
  createdAt: string;
  notebookId?: string; // Reference to parent notebook
}

export interface Notebook {
  id: string;
  title: string;
  description?: string;
  color?: string;
  updatedAt: string;
  createdAt: string;
  pagesCount: number;
  documentsCount: number;
  pages?: Page[];
  documents?: any[]; // Array of document objects
}

export const mockNotebooks: Notebook[] = [
  {
    id: '1',
    title: 'Getting Started',
    description: 'Welcome to your first notebook. Start organizing your thoughts here.',
    color: 'blue',
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    pagesCount: 12,
    documentsCount: 3,
  },
  {
    id: '2',
    title: 'Project Ideas',
    description: 'A collection of creative project ideas and inspirations.',
    color: 'purple',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    pagesCount: 28,
    documentsCount: 7,
  },
  {
    id: '3',
    title: 'Meeting Notes',
    description: 'Important notes from team meetings and discussions.',
    color: 'green',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    pagesCount: 45,
    documentsCount: 12,
  },
  {
    id: '4',
    title: 'Learning Resources',
    description: 'Articles, tutorials, and resources for continuous learning.',
    color: 'yellow',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    pagesCount: 67,
    documentsCount: 15,
  },
  {
    id: '5',
    title: 'Personal Goals',
    description: 'Track your personal goals and achievements.',
    color: 'pink',
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    pagesCount: 8,
    documentsCount: 2,
  },
  {
    id: '6',
    title: 'Recipes',
    description: 'Favorite recipes and cooking notes.',
    color: 'orange',
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    pagesCount: 34,
    documentsCount: 9,
  },
  {
    id: '7',
    title: 'Travel Plans',
    description: 'Places to visit and travel itineraries.',
    color: 'red',
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    pagesCount: 19,
    documentsCount: 5,
  },
  {
    id: '8',
    title: 'Book Notes',
    description: 'Notes and insights from books I\'ve read.',
    color: 'brown',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    pagesCount: 52,
    documentsCount: 11,
  },
];

// Generate mock pages for notebooks
function generatePages(notebookId: string, count: number): Page[] {
  const pages: Page[] = [];
  const pageTitles = [
    'Introduction',
    'Overview',
    'Key Concepts',
    'Important Notes',
    'Summary',
    'References',
    'Appendix',
    'Chapter 1',
    'Chapter 2',
    'Chapter 3',
    'Meeting Notes - Week 1',
    'Meeting Notes - Week 2',
    'Action Items',
    'Decisions Made',
    'Follow-ups',
    'Ideas',
    'Brainstorming',
    'Research',
    'Findings',
    'Conclusion',
  ];

  const baseTime = Date.now();
  
  for (let i = 0; i < count; i++) {
    const titleIndex = i % pageTitles.length;
    const baseTitle = pageTitles[titleIndex];
    const title = count > pageTitles.length && i >= pageTitles.length 
      ? `${baseTitle} ${Math.floor(i / pageTitles.length) + 1}` 
      : baseTitle;
    
    // Use deterministic dates based on index (newer pages first)
    const daysAgo = i * 2; // Each page is 2 days older than the previous
    const updatedAt = new Date(baseTime - daysAgo * 24 * 60 * 60 * 1000);
    const createdAt = new Date(baseTime - (daysAgo + 10) * 24 * 60 * 60 * 1000);
    
    pages.push({
      id: `${notebookId}-page-${i + 1}`,
      title,
      updatedAt: updatedAt.toISOString(),
      createdAt: createdAt.toISOString(),
    });
  }

  // Sort by updatedAt (newest first) - this should already be sorted, but ensure consistency
  return pages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

// Add pages to notebooks
export const mockNotebooksWithPages = mockNotebooks.map((notebook) => ({
  ...notebook,
  pages: generatePages(notebook.id, notebook.pagesCount),
}));

// Helper function to get notebook by ID
export function getNotebookById(id: string): Notebook | undefined {
  return mockNotebooksWithPages.find((nb) => nb.id === id);
}

// Helper function to get pages for a notebook
export function getPagesByNotebookId(notebookId: string): Page[] {
  const notebook = getNotebookById(notebookId);
  const pages = notebook?.pages || [];
  // Always return pages sorted by updatedAt (newest first) for consistency
  return [...pages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

// Helper function to update a notebook (for local state management)
export function updateNotebook(id: string, updates: { title?: string; description?: string }): Notebook | undefined {
  const notebook = getNotebookById(id);
  if (!notebook) return undefined;
  
  const updated = {
    ...notebook,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  // Update in the array
  const index = mockNotebooksWithPages.findIndex((nb) => nb.id === id);
  if (index !== -1) {
    mockNotebooksWithPages[index] = updated;
  }
  
  return updated;
}

// Helper function to add a new page to a notebook
export function addPageToNotebook(notebookId: string): Page | undefined {
  const notebook = getNotebookById(notebookId);
  if (!notebook) return undefined;
  
  const newPage: Page = {
    id: `${notebookId}-page-${Date.now()}`,
    title: 'Untitled Page',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  // Add page to notebook
  if (!notebook.pages) {
    notebook.pages = [];
  }
  notebook.pages = [newPage, ...notebook.pages]; // Add to beginning
  
  // Sort by updatedAt (newest first) to maintain consistent order
  notebook.pages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Update pagesCount
  notebook.pagesCount = notebook.pages.length;
  notebook.updatedAt = new Date().toISOString();
  
  return newPage;
}

// Helper function to update a page
export function updatePage(notebookId: string, pageId: string, updates: { title?: string }): Page | undefined {
  const notebook = getNotebookById(notebookId);
  if (!notebook || !notebook.pages) return undefined;
  
  const pageIndex = notebook.pages.findIndex((p) => p.id === pageId);
  if (pageIndex === -1) return undefined;
  
  const updatedPage = {
    ...notebook.pages[pageIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  notebook.pages[pageIndex] = updatedPage;
  notebook.updatedAt = new Date().toISOString();
  
  // Sort by updatedAt (newest first) to maintain consistent order
  notebook.pages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  return updatedPage;
}

// Helper function to delete a page from a notebook
export function deletePageFromNotebook(notebookId: string, pageId: string): boolean {
  const notebook = getNotebookById(notebookId);
  if (!notebook || !notebook.pages) return false;
  
  // Remove page from array
  notebook.pages = notebook.pages.filter((p) => p.id !== pageId);
  
  // Update pagesCount
  notebook.pagesCount = notebook.pages.length;
  notebook.updatedAt = new Date().toISOString();
  
  return true;
}

