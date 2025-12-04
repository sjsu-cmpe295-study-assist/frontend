import {
    Check,
    ChevronDown,
    Heading1,
    Heading2,
    Heading3,
    TextQuote,
    ListOrdered,
    TextIcon,
    Code,
    CheckSquare,
    type LucideIcon,
  } from "lucide-react";
  import { EditorBubbleItem, useEditor } from "novel";
  
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/editor/ui/popover";
  import { Button } from "@/components/editor/ui/button";
  
  export type SelectorItem = {
    name: string;
    icon: LucideIcon;
    command: (editor: NonNullable<ReturnType<typeof useEditor>["editor"]>) => void;
    isActive: (editor: NonNullable<ReturnType<typeof useEditor>["editor"]>) => boolean;
  };
  
  const items: SelectorItem[] = [
    {
      name: "Text",
      icon: TextIcon,
      command: (editor) => editor.chain().focus().toggleNode("paragraph", "paragraph").run(),
      // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
      isActive: (editor) =>
        editor.isActive("paragraph") &&
        !editor.isActive("bulletList") &&
        !editor.isActive("orderedList"),
    },
    {
      name: "Heading 1",
      icon: Heading1,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (editor) => editor.isActive("heading", { level: 1 }),
    },
    {
      name: "Heading 2",
      icon: Heading2,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (editor) => editor.isActive("heading", { level: 2 }),
    },
    {
      name: "Heading 3",
      icon: Heading3,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (editor) => editor.isActive("heading", { level: 3 }),
    },
    {
      name: "To-do List",
      icon: CheckSquare,
      command: (editor) => editor.chain().focus().toggleTaskList().run(),
      isActive: (editor) => editor.isActive("taskItem"),
    },
    {
      name: "Bullet List",
      icon: ListOrdered,
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
      isActive: (editor) => editor.isActive("bulletList"),
    },
    {
      name: "Numbered List",
      icon: ListOrdered,
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
      isActive: (editor) => editor.isActive("orderedList"),
    },
    {
      name: "Quote",
      icon: TextQuote,
      command: (editor) =>
        editor.chain().focus().toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
      isActive: (editor) => editor.isActive("blockquote"),
    },
    {
      name: "Code",
      icon: Code,
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      isActive: (editor) => editor.isActive("codeBlock"),
    },
  ];
  interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
    const { editor } = useEditor();
    if (!editor) return null;
    const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
      name: "Multiple",
    };
  
    return (
      <Popover modal={true} open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger
          asChild
          className='gap-2 border-none focus:ring-0'>
          <Button variant='ghost' className='gap-2 text-[var(--foreground)] hover:bg-[var(--notion-gray-bg-hover)] pl-3 pr-2 py-1 m-1 rounded-md'>
            <span className='whitespace-nowrap text-sm'>{activeItem.name}</span>
            <ChevronDown className='h-4 w-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={5} align='start' className='w-64'>
          {items.map((item, index) => {
            const isActive = activeItem.name === item.name;
            return (
              <EditorBubbleItem
                key={index}
                aria-selected={isActive}
                onSelect={(editor) => {
                  item.command(editor);
                  onOpenChange(false);
                }}
                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-base transition-colors hover:bg-[var(--notion-gray-bg-hover)] ${
                  isActive
                    ? 'bg-[var(--notion-blue-bg)] text-[var(--notion-blue-text)] [&[aria-selected=true]]:bg-[var(--notion-blue-bg)]'
                    : 'text-[var(--foreground)] [&[aria-selected=true]]:bg-[var(--notion-blue-bg)] [&[aria-selected=true]]:text-[var(--notion-blue-text)]'
                }`}>
                <div className={`flex h-10 w-10 items-center justify-center border rounded-md ${
                  isActive
                    ? 'border-[var(--notion-blue-border)] bg-[var(--notion-blue-bg)]'
                    : 'border-[var(--notion-gray-border)] bg-[var(--background)]'
                }`}>
                  <item.icon className={`h-5 w-5 ${
                    isActive
                      ? 'text-[var(--notion-blue-text)]'
                      : 'text-[var(--foreground)]'
                  }`} />
                </div>
                <div className='flex-1'>
                  <p className='font-medium'>{item.name}</p>
                </div>
                {isActive && <Check className='h-4 w-4 text-[var(--notion-blue-text)] flex-shrink-0' />}
              </EditorBubbleItem>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  };