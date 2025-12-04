'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

export function AIChatPopover({ isOpen, onClose }: AIChatPopoverProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: query.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setQuery('');
      
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I understand your question. This is a placeholder response.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 500);
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
      <div className="fixed bottom-6 right-6 w-[500px] h-[700px] max-h-[calc(100vh-3rem)] bg-[var(--background)] border border-[var(--notion-gray-border)] rounded-4xl z-50 flex flex-col shadow-2xl transition-all duration-300 pb-5">
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
        <div className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-8 pb-36">
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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-[var(--notion-blue-bg)] text-[var(--notion-blue-text)]'
                        : 'bg-[var(--notion-gray-bg)] text-[var(--foreground)]'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 rounded-b-2xl absolute bottom-0 left-0 right-0">
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="relative mx-4 my-4">
            <div className="flex flex-col gap-2 bg-[var(--notion-gray-bg)] rounded-2xl border border-[var(--notion-gray-border)] px-3 py-3 focus-within:border-[var(--notion-blue-border)] focus-within:ring-2 focus-within:ring-[var(--notion-blue-bg)] transition-all">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or start a conversation..."
                rows={1}
                className="w-full resize-none bg-transparent text-[var(--foreground)] placeholder:text-[var(--notion-gray-text)] placeholder:opacity-50 focus:outline-none text-sm leading-relaxed max-h-[200px] overflow-y-auto"
                style={{ minHeight: '24px' }}
              />
              <div className='flex justify-end'>
              <button
                type="submit"
                disabled={!query.trim()}
                className="p-2 rounded-lg bg-[var(--notion-blue-text)] text-white hover:bg-[var(--notion-blue-text-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex flex-row items-center gap-2"
                aria-label="Send"
              >
                <Send className="w-4 h-4" /> Send
              </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
