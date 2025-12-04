import { cn } from "@/lib/utils";
import { EditorBubbleItem, useEditor } from "novel";
import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CodeIcon } from "lucide-react";
import type { SelectorItem } from "./NovelNodeSelector";
import { Button } from "@/components/editor/ui/button";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (ed) => ed.isActive("bold"),
      command: (ed) => ed.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: (ed) => ed.isActive("italic"),
      command: (ed) => ed.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: (ed) => ed.isActive("underline"),
      command: (ed) => ed.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: (ed) => ed.isActive("strike"),
      command: (ed) => ed.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      isActive: (ed) => ed.isActive("code"),
      command: (ed) => ed.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];
  return (
    <div className='flex mx-2'>
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={(editor) => {
            item.command(editor);
          }}>
          <Button className='h-8 w-8 p-0 rounded-md' variant='ghost'>
            <item.icon
              className={cn("h-4 w-4", {
                "text-[var(--notion-blue-text)]": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};