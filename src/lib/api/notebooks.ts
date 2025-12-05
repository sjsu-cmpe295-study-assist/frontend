/**
 * API service for notebooks and pages
 * Connects to FastAPI backend
 */

import type { Notebook, Page } from '@/lib/mock-data';
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: response.statusText,
    }));
    throw new ApiError(response.status, errorData.detail || 'Request failed');
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Transform backend notebook response to frontend format
 */
function transformNotebook(backendNotebook: any): Notebook {
  return {
    id: backendNotebook.id,
    title: backendNotebook.title,
    description: backendNotebook.description || undefined,
    color: backendNotebook.color || undefined,
    updatedAt: backendNotebook.updatedAt,
    createdAt: backendNotebook.createdAt,
    pagesCount: backendNotebook.pagesCount || 0,
    documentsCount: backendNotebook.documentsCount || 0,
    flashCardsCount: backendNotebook.flashCardsCount || 0,
    pages: backendNotebook.pages
      ? backendNotebook.pages.map(transformPage)
      : undefined,
    documents: backendNotebook.documents || undefined,
  };
}

/**
 * Transform backend page response to frontend format
 */
function transformPage(backendPage: any): Page {
  return {
    id: backendPage.id,
    title: backendPage.title,
    content: backendPage.content || undefined,
    updatedAt: backendPage.updatedAt,
    createdAt: backendPage.createdAt,
    notebookId: backendPage.notebookId,
  };
}

/**
 * Get all notebooks
 */
export async function getNotebooks(): Promise<Notebook[]> {
  const notebooks = await apiRequest<any[]>('/notebooks');
  return notebooks.map(transformNotebook);
}

/**
 * Get notebook by ID
 */
export async function getNotebookById(id: string): Promise<Notebook | undefined> {
  try {
    const notebook = await apiRequest<any>(`/notebooks/${id}`);
    return transformNotebook(notebook);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

/**
 * Create a new notebook
 * For notebooks with documents, processing can take 30-120 seconds
 */
export async function createNotebook(data: {
  prompt?: string;
  documents?: any[];
  title?: string;
}): Promise<Notebook> {
  const requestBody: any = {};
  
  if (data.title) {
    requestBody.title = data.title;
  }
  
  if (data.prompt) {
    requestBody.prompt = data.prompt;
    requestBody.description = data.prompt;
  }
  
  if (data.documents && data.documents.length > 0) {
    requestBody.documents = data.documents;
  }

  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout

  try {
    const response = await fetch(`${API_BASE_URL}/notebooks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new ApiError(response.status, errorData.detail || 'Request failed');
    }

    const notebook = await response.json();
    return transformNotebook(notebook);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout. Document processing is taking longer than expected.');
    }
    throw error;
  }
}

/**
 * Update a notebook
 */
export async function updateNotebook(
  id: string,
  updates: { title?: string; description?: string }
): Promise<Notebook> {
  const requestBody: any = {};
  
  if (updates.title !== undefined) {
    requestBody.title = updates.title;
  }
  
  if (updates.description !== undefined) {
    requestBody.description = updates.description;
  }

  const notebook = await apiRequest<any>(`/notebooks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(requestBody),
  });
  
  return transformNotebook(notebook);
}

/**
 * Delete a notebook
 */
export async function deleteNotebook(id: string): Promise<void> {
  await apiRequest<void>(`/notebooks/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get all pages for a notebook
 */
export async function getPagesByNotebookId(notebookId: string): Promise<Page[]> {
  const pages = await apiRequest<any[]>(`/notebooks/${notebookId}/pages`);
  return pages.map(transformPage);
}

/**
 * Get a single page
 */
export async function getPageById(
  notebookId: string,
  pageId: string
): Promise<Page | undefined> {
  try {
    const page = await apiRequest<any>(`/notebooks/${notebookId}/pages/${pageId}`);
    return transformPage(page);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

/**
 * Add a page to a notebook
 */
export async function addPageToNotebook(notebookId: string): Promise<Page> {
  const page = await apiRequest<any>(`/notebooks/${notebookId}/pages`, {
    method: 'POST',
    body: JSON.stringify({ title: 'Untitled Page' }),
  });
  
  return transformPage(page);
}

/**
 * Update a page
 */
export async function updatePage(
  notebookId: string,
  pageId: string,
  updates: { title?: string; content?: any }
): Promise<Page> {
  const requestBody: any = {};
  
  if (updates.title !== undefined) {
    requestBody.title = updates.title;
  }
  
  if (updates.content !== undefined) {
    requestBody.content = updates.content;
  }

  const page = await apiRequest<any>(
    `/notebooks/${notebookId}/pages/${pageId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
    }
  );
  
  return transformPage(page);
}

/**
 * Delete a page from a notebook
 */
export async function deletePageFromNotebook(
  notebookId: string,
  pageId: string
): Promise<void> {
  await apiRequest<void>(`/notebooks/${notebookId}/pages/${pageId}`, {
    method: 'DELETE',
  });
}

/**
 * Chat with AI assistant
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  context?: string;
  conversation_id?: string;
  messages?: ChatMessage[];
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: string;
  conversation_id: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chatWithAI(
  notebookId: string,
  pageId: string,
  request: ChatRequest
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>(`/notebooks/${notebookId}/pages/${pageId}/chat`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Document interface matching backend response
 */
export interface Document {
  id?: string;
  name?: string;
  filename?: string;
  size?: number;
  url?: string;
  type?: string;
  uploaded_at?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Get document download URL
 * Returns a signed URL or direct URL for downloading the document
 * Note: This endpoint may not exist in the backend yet.
 * If it doesn't exist, documents should have URLs in their data.
 */
export async function getDocumentUrl(
  notebookId: string,
  documentId: string
): Promise<string> {
  try {
    // If backend provides a direct endpoint for document URLs
    const response = await apiRequest<{ url: string }>(
      `/notebooks/${notebookId}/documents/${documentId}/url`
    );
    return response?.url || '';
  } catch (error) {
    // If endpoint doesn't exist, return empty string
    // Documents might have direct URLs in their data
    if (error instanceof ApiError && error.status === 404) {
      return '';
    }
    throw error;
  }
}
