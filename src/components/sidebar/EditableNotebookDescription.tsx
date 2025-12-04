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

  return (
    <p
      onClick={() => setIsEditing(true)}
      className={`text-base text-[var(--notion-gray-text)] mb-4 ${!isEditing ? 'line-clamp-3' : ''} cursor-text hover:bg-[var(--notion-gray-bg-hover)] rounded px-3 py-1 -mx-2 transition-colors ${
        !notebook.description && !isEditing ? 'italic opacity-50' : ''
      }`}
      style={{ lineHeight: '1.5' }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editedDescription}
          onChange={handleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full !text-base text-[var(--notion-gray-text)] bg-transparent border-none outline-none resize-none overflow-hidden px-0 !py-0 !m-0"
          style={{ lineHeight: '1.5', minHeight: 'auto', width: '100%' }}
          rows={1}
          placeholder="Click to add description..."
        />
      ) : (
        notebook.description || 'Click to add description...'
      )}
    </p>
  );
}

