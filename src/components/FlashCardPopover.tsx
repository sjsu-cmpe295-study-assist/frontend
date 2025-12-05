'use client';

import { useState } from 'react';
import { X, Send, CheckCircle2, XCircle } from 'lucide-react';
import { FlashCard, submitFlashCardAnswer, FlashCardSubmissionResponse } from '@/lib/api/flashcards';
import { Button } from '@/components/Button';

interface FlashCardPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  flashCard: FlashCard | null;
}

export function FlashCardPopover({ isOpen, onClose, flashCard }: FlashCardPopoverProps) {
  const [answer, setAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<FlashCardSubmissionResponse | null>(null);

  if (!isOpen || !flashCard) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;

    const trimmedAnswer = answer.trim();
    setIsSubmitting(true);
    setSubmissionResult(null);
    setSubmittedAnswer(trimmedAnswer);

    try {
      const result = await submitFlashCardAnswer(flashCard.id, trimmedAnswer);
      setSubmissionResult(result);
    } catch (error) {
      console.error('Failed to submit flash card answer:', error);
      alert('Failed to submit answer. Please try again.');
      setSubmittedAnswer('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAnswer('');
    setSubmittedAnswer('');
    setSubmissionResult(null);
    onClose();
  };

  const handleReset = () => {
    setAnswer('');
    setSubmittedAnswer('');
    setSubmissionResult(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 transition-opacity"
        onClick={handleClose}
      />

      {/* Popover */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] bg-[var(--background)] border border-[var(--notion-gray-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--notion-gray-border)] flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Flash Card
              </h2>
              <p className="text-sm text-[var(--notion-gray-text)] mt-1">
                From: {flashCard.notebookTitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-[var(--notion-red-bg)] hover:text-[var(--notion-red-text)] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
            {/* Question Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
              
                <label className="text-base font-semibold text-[var(--notion-gray-text)]">
                  Question
                </label>
              </div>
              <p className="text-xl text-[var(--foreground)] leading-relaxed font-semibold">
                {flashCard.question}
              </p>
            </div>

            {/* Answer Input Section */}
            {!submissionResult && (
              <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
                <div className="min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-base font-semibold text-[var(--notion-gray-text)]">
                      Answer
                    </label>
                  </div>
                  <div className="min-w-0 w-full">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full min-h-[200px] px-4 py-3 rounded-lg border border-[var(--notion-gray-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--notion-gray-text)] placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none box-border overflow-x-hidden break-words"
                      disabled={isSubmitting}
                      style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!answer.trim() || isSubmitting}
                    className="flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Answer</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Submission Result Section */}
            {submissionResult && (
              <div className="space-y-6">
                {/* Your Submitted Answer */}
                <div className="pb-4 border-b border-[var(--notion-gray-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-base font-semibold text-[var(--notion-gray-text)]">
                      Your Answer
                    </label>
                  </div>
                  <div className="">
                    <div className="p-4 rounded-lg bg-[var(--notion-gray-bg)] border border-[var(--notion-gray-border)]">
                      <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                        {submittedAnswer}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Result Status */}
                <div
                  className={`p-5 rounded-xl flex items-start gap-4 shadow-sm ${
                    submissionResult.isCorrect
                      ? 'bg-[var(--notion-green-bg)] border-2 border-[var(--notion-green-border)]'
                      : 'bg-[var(--notion-red-bg)] border-2 border-[var(--notion-red-border)]'
                  }`}
                >
                  
                  <div className="flex-1">
                    <p
                      className={`text-xl font-bold mb-3 ${
                        submissionResult.isCorrect
                          ? 'text-[var(--notion-green-text)]'
                          : 'text-[var(--notion-red-text)]'
                      }`}
                    >
                      {submissionResult.isCorrect ? 'Correct!' : 'Not Correct'}
                    </p>
                    {submissionResult.correctAnswer && !submissionResult.isCorrect && (
                      <div className="mt-3 pt-3 border-t border-[var(--notion-gray-border)]">
                        <p className="text-base font-semibold text-[var(--foreground)] mb-2">
                          Correct Answer:
                        </p>
                        <p className="text-[var(--foreground)] leading-relaxed">
                          {submissionResult.correctAnswer}
                        </p>
                        <p className="text-base font-semibold text-[var(--foreground)] mb-2 mt-5">
                          Explanation:
                        </p>
                        <p className="text-[var(--foreground)] leading-relaxed">
                          {submissionResult.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleClose}
                    className="flex items-center gap-2"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

