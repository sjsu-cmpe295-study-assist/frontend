'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { chatWithAI, type ChatMessage as ApiChatMessage } from '@/lib/api/notebooks';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string; // Context attached to user messages
}

interface AIChatPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  notebookId?: string;
  pageId?: string;
}

export function AIChatPopover({ isOpen, onClose, context, notebookId, pageId }: AIChatPopoverProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Track if context has been used (attached to a message)
  const [contextUsed, setContextUsed] = useState(false);

  // Reset when popover opens or context changes significantly
  useEffect(() => {
    if (isOpen) {
      // If context changes (new selection), reset conversation
      if (context && context.length > 50) {
        setMessages([]);
        setConversationId(undefined);
        setContextUsed(false);
      } else {
        setContextUsed(false);
      }
      setQuery('');
      setError(null);
    }
  }, [isOpen, context]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollToBottom = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      };
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        setTimeout(scrollToBottom, 100);
      });
    }
  }, [messages, isLoading]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading || !notebookId || !pageId) return;

    const userMessageText = query.trim();
    const messageContext = context && context.length > 50 ? context : undefined;
    setQuery('');
    setError(null);
    setIsLoading(true);

    // Mark context as used immediately (remove from input area)
    if (messageContext) {
      setContextUsed(true);
    }

    // Add user message to UI immediately with context attached
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date(),
      context: messageContext, // Attach context to message
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Prepare request payload - include context and full message thread
      const requestPayload = {
        message: userMessageText,
        context: messageContext, // Send context with the message
        conversation_id: conversationId,
        messages: [
          // Include all previous messages
          ...messages.map((msg): ApiChatMessage => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
          })),
          // Include the current user message
          {
            role: 'user' as const,
            content: userMessageText,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // Make API call
      const response = await chatWithAI(notebookId, pageId, requestPayload);

      // Add AI response to UI
      const aiMessage: Message = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(response.timestamp),
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Scroll to bottom after adding message
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 50);

      // Update conversation ID if provided
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
      
      // Remove user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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

      {/* AI Chat Popover */}
      <div className={`fixed bottom-6 right-6 ${context && context.length > 50 ? 'w-[550px] h-[750px]' : 'w-[500px] h-[700px]'} max-h-[calc(100vh-3rem)] bg-[var(--background)] border border-[var(--notion-gray-border)] rounded-4xl z-50 flex flex-col shadow-2xl transition-all duration-300 pb-5`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--notion-blue-bg)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--notion-blue-text)]" />
            </div>
            <span className="text-base font-semibold text-[var(--foreground)]">AI Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--notion-red-bg)] hover:text-[var(--notion-red-text)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto min-h-0"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-8 pb-48">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--notion-blue-bg)] to-[var(--notion-blue-text)]/20 flex items-center justify-center mb-8 shadow-lg">
                <Sparkles className="w-10 h-10 text-[var(--notion-blue-text)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3 text-center">
                How can I help you today?
              </h3>
              <p className="text-sm text-[var(--notion-gray-text)] text-center max-w-md leading-relaxed">
                I'm here to help with questions, analysis, writing, and more. What would you like to explore?
              </p>
            </div>
          ) : (
            <div className="px-4 py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--notion-blue-bg)] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-[var(--notion-blue-text)]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 flex flex-col gap-2 ${
                      message.role === 'user'
                        ? 'bg-[var(--notion-blue-bg)] text-[var(--notion-blue-text)]'
                        : 'bg-[var(--notion-gray-bg)] text-[var(--foreground)]'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'user' && message.context && (
                      <div className="mt-2 pt-2 border-t border-[var(--notion-blue-border)] opacity-70">
                        <p className="text-xs font-medium mb-1 opacity-80">Context:</p>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap line-clamp-4">
                          {message.context}
                        </p>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--notion-gray-bg)] flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-[var(--notion-blue-text)] flex items-center justify-center text-white text-xs font-medium">
                        U
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-[var(--notion-blue-bg)] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[var(--notion-blue-text)]" />
                  </div>
                  <div className="bg-[var(--notion-gray-bg)] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--notion-gray-text)]" />
                      <span className="text-sm text-[var(--notion-gray-text)]">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="px-4 py-2 bg-[var(--notion-red-bg)] border border-[var(--notion-red-border)] rounded-lg">
                  <p className="text-sm text-[var(--notion-red-text)]">{error}</p>
                </div>
              )}
              <div ref={chatEndRef} className="h-1" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 rounded-b-2xl left-0 right-0">
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="relative mx-4">
            <div className="flex flex-col gap-3 bg-[var(--notion-gray-bg)] rounded-2xl border border-[var(--notion-gray-border)] px-3 py-3 focus-within:border-[var(--notion-blue-border)] focus-within:ring-2 focus-within:ring-[var(--notion-blue-bg)] transition-all">
              {/* Context Preview (only show if context exists and hasn't been used yet) */}
              {context && context.length > 50 && !contextUsed && (
                <div className="bg-[var(--background)] border border-[var(--notion-gray-border)] rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium text-[var(--notion-gray-text)] mb-2">Selected context will be included:</p>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                    {context}
                  </p>
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder={context && context.length > 50 ? "Ask a question about the selected content..." : "Ask a question or start a conversation..."}
                rows={1}
                className="w-full resize-none bg-transparent text-[var(--foreground)] placeholder:text-[var(--notion-gray-text)] placeholder:opacity-50 focus:outline-none text-sm leading-relaxed max-h-[200px] overflow-y-auto"
                style={{ minHeight: '24px' }}
              />
              <div className='flex justify-end'>
              <button
                type="submit"
                disabled={!query.trim() || isLoading || !notebookId || !pageId}
                className="p-2 rounded-lg bg-[var(--notion-blue-text)] text-white hover:bg-[var(--notion-blue-text-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex flex-row items-center gap-2"
                aria-label="Send"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send
                  </>
                )}
              </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
