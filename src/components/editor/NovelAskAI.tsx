import { EditorBubbleItem, useEditor } from "novel";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/editor/ui/button";

interface NovelAskAIProps {
  onAskAI?: (selectedText: string) => void;
}

export const NovelAskAI = ({ onAskAI }: NovelAskAIProps) => {
  const { editor } = useEditor();
  
  if (!editor || !onAskAI) return null;

  const handleAskAI = () => {
    if (!editor) return;
    
    // Get selected text
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    if (selectedText.trim()) {
      // Pass complete selected text without truncation
      onAskAI(selectedText.trim());
    } else {
      // If no selection, get the current paragraph or block
      const { $from } = editor.state.selection;
      const paragraphText = $from.parent.textContent;
      if (paragraphText) {
        onAskAI(paragraphText.trim());
      }
    }
    
    // Close the EditorBubble by blurring the editor
    // This will hide the bubble menu
    editor.commands.blur();
  };

  return (
    <EditorBubbleItem onSelect={() => handleAskAI()}>
      <Button className='h-8 px-3 py-1.5 rounded-md flex items-center gap-2 mr-1' variant='ghost'>
        <Sparkles className="h-4 w-4 text-[var(--notion-blue-text)]" />
        <span className="text-sm text-[var(--notion-blue-text)] whitespace-nowrap">Ask AI</span>
      </Button>
    </EditorBubbleItem>
  );
};

