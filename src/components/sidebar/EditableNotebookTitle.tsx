import { useState, useRef, useEffect } from 'react';
import { type Notebook } from '@/lib/mock-data';

interface EditableNotebookTitleProps {
  notebook: Notebook;
  notebookId: string;
  onUpdate: (updates: { title?: string }) => void;
}

export function EditableNotebookTitle({ notebook, notebookId, onUpdate }: EditableNotebookTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(notebook.title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    setEditedTitle(notebook.title);
  }, [notebook.title]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize on mount
      adjustTextareaHeight();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTitle(e.target.value);
    adjustTextareaHeight();
  };

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== notebook.title) {
      onUpdate({ title: editedTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(notebook.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <h2
      onClick={() => setIsEditing(true)}
      className="text-2xl font-semibold mb-4 line-clamp-3 cursor-text hover:bg-[var(--notion-gray-bg-hover)] rounded px-1 py-1 -mx-3 transition-colors"
      style={{ lineHeight: '1.2',  }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editedTitle}
          onChange={handleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full !text-2xl !font-semibold text-[var(--foreground)] bg-transparent border-none outline-none resize-none overflow-hidden px-0 !py-0 !m-0"
          style={{ lineHeight: '1.2', minHeight: 'auto', width: '90%' }}
          rows={1}
        />
      ) : (
        notebook.title
      )}
    </h2>
  );
}

