/**
 * API service for flash cards
 * Connects to FastAPI backend
 */

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

  return response.json();
}

/**
 * Flash Card interface
 */
export interface FlashCard {
  id: string;
  notebookId: string;
  notebookTitle: string;
  question: string;
  answer?: string;
  explanation?: string;
  timesAnswered?: number;
  timesAnsweredCorrectly?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flash Card Submission Request
 */
export interface FlashCardSubmissionRequest {
  answer: string;
}

/**
 * Flash Card Submission Response
 */
export interface FlashCardSubmissionResponse {
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
}

/**
 * Get all flash cards
 */
export async function getFlashCards(): Promise<FlashCard[]> {
  const flashCards = await apiRequest<FlashCard[]>('/flashcards');
  return flashCards;
}

/**
 * Get flash cards for a specific notebook
 */
export async function getFlashCardsByNotebookId(notebookId: string): Promise<FlashCard[]> {
  const flashCards = await apiRequest<FlashCard[]>(`/flashcards?notebook_id=${notebookId}`);
  return flashCards;
}

/**
 * Submit answer for a flash card
 */
export async function submitFlashCardAnswer(
  flashCardId: string,
  answer: string
): Promise<FlashCardSubmissionResponse> {
  return apiRequest<FlashCardSubmissionResponse>(
    `/flashcards/${flashCardId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }
  );
}

/**
 * Create flash card request
 */
export interface CreateFlashCardRequest {
  notebookId: string;
  pageId: string;
  content: string;
}

/**
 * Create a flash card from selected content
 */
export async function createFlashCard(
  request: CreateFlashCardRequest
): Promise<FlashCard> {
  return apiRequest<FlashCard>('/flashcards', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Delete a flash card
 */
export async function deleteFlashCard(flashCardId: string): Promise<void> {
  await apiRequest<void>(`/flashcards/${flashCardId}`, {
    method: 'DELETE',
  });
}

