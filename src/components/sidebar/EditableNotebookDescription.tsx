import { useState, useRef, useEffect } from 'react';
import { type Notebook } from '@/lib/mock-data';

interface EditableNotebookDescriptionProps {
  notebook: Notebook;
  notebookId: string;
  onUpdate: (updates: { description?: string }) => void;
}

export function EditableNotebookDescription({ notebook, notebookId, onUpdate }: EditableNotebookDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(notebook.description || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    setEditedDescription(notebook.description || '');
  }, [notebook.description]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize on mount
      adjustTextareaHeight();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [editedDescription, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedDescription(e.target.value);
    adjustTextareaHeight();
  };

  const handleSave = () => {
    if (editedDescription !== notebook.description) {
      onUpdate({ description: editedDescription.trim() || undefined });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDescription(notebook.description || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={editedDescription}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full !text-base text-[var(--notion-gray-text)] bg-[var(--background)] border border-[var(--notion-blue-border)] rounded-md px-3 py-1 -mx-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--notion-blue-text)] overflow-hidden"
        style={{ lineHeight: '1.5', paddingTop: '0.5rem', paddingBottom: '0.5rem', minHeight: 'auto' }}
        rows={1}
      />
    );
  }

  return (
    <p
      onClick={() => setIsEditing(true)}
      className={`text-base text-[var(--notion-gray-text)] mb-4 line-clamp-3 cursor-text hover:bg-[var(--notion-gray-bg-hover)] rounded px-3 py-1 -mx-2 transition-colors ${
        !notebook.description ? 'italic opacity-50' : ''
      }`}
      style={{ lineHeight: '1.5', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
    >
      {notebook.description || 'Click to add description...'}
    </p>
  );
}

