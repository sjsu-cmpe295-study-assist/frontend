'use client';

import { EditorContent, EditorRoot, JSONContent, EditorCommand, EditorCommandEmpty, EditorCommandList, EditorCommandItem, handleCommandNavigation } from 'novel';
import { defaultExtensions } from '@/components/editor/novel_extensions';
import { useDebouncedCallback } from 'use-debounce';
import { slashCommand, suggestionItems } from '@/components/editor/novel_slash';
import { EditorBubble } from 'novel';
import { NodeSelector } from '@/components/editor/NovelNodeSelector';
import { LinkSelector } from '@/components/editor/NovelLinkSelector';
import { TextButtons } from '@/components/editor/NovelTextButtons';
import { NovelAskAI } from '@/components/editor/NovelAskAI';
import { useState } from 'react';

interface PageEditorProps {
  className?: string;
  initialContent?: JSONContent;
  onUpdate?: (content: JSONContent) => void;
  onAskAI?: (selectedText: string) => void;
}

export function PageEditor({ className = '', initialContent, onUpdate, onAskAI }: PageEditorProps) {
  const [openNode, setOpenNode] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const debouncedOnUpdate = useDebouncedCallback(
    (json: JSONContent) => {
      if (onUpdate) {
        onUpdate(json);
      }
    },
    500
  );

  const extensions = [...defaultExtensions, slashCommand];

  return (
    <div className={`w-full ${className}`}>
      <EditorRoot>
      <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto border border-[var(--notion-gray-border)] rounded-xl bg-[var(--background)] px-1 py-2 shadow-md transition-all">
        <EditorCommandEmpty className='px-2 text-[var(--notion-gray-text)]'>No results</EditorCommandEmpty>
        <EditorCommandList>
            {suggestionItems.filter((item: any) => item.title !== 'Send Feedback').map((item: any) => (
            <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command(val)}
                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-base text-[var(--foreground)] [&[aria-selected='true']]:bg-[var(--notion-blue-bg)] [&[aria-selected='true']]:text-[var(--notion-blue-text)] transition-colors `}
                key={item.title}>
                <div className='flex h-10 w-10 items-center justify-center border border-[var(--notion-gray-border)] rounded-md bg-[var(--background)]'>
                {item.icon}
                </div>
                <div>
                <p className='font-medium'>{item.title}</p>
                <p className='text-xs text-[var(--notion-gray-text)]'>{item.description}</p>
                </div>
            </EditorCommandItem>
            ))}
        </EditorCommandList>
        </EditorCommand>
        <div className="max-w-[900px] mx-auto">
          <EditorContent
            className="w-full"
            extensions={extensions}
            initialContent={initialContent}
            editorProps={{
              handleDOMEvents: {
                  keydown: (_view, event) => handleCommandNavigation(event),
                },
              attributes: {
                class: 'novel-editor prose prose-xl max-w-none focus:outline-none min-h-[500px] text-lg !space-y-5',
              },
            }}
            onUpdate={({ editor }) => {
              const json = editor.getJSON();
              debouncedOnUpdate(json);
            }}
          >
          <EditorBubble
            tippyOptions={{
              placement: "top",
              
            }}
            className='flex w-fit max-w-[90vw] overflow-hidden rounded-lg border border-[var(--notion-gray-border)] bg-[var(--background)] shadow-xl items-center'>
              <NodeSelector open={openNode} onOpenChange={setOpenNode} />
              <div className='h-6 w-px bg-[var(--notion-gray-border)] mx-1' />
              <LinkSelector open={openLink} onOpenChange={setOpenLink} />
              <div className='h-6 w-px bg-[var(--notion-gray-border)] mx-1' />
              <TextButtons />
              <div className='h-6 w-px bg-[var(--notion-gray-border)] mx-1' />
              <NovelAskAI onAskAI={onAskAI} />
          </EditorBubble>
          </EditorContent>
        </div>
      </EditorRoot>
    </div>
  );
}

