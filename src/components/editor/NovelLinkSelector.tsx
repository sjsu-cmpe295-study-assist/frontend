import { cn } from "@/lib/utils";
import { useEditor } from "novel";
import { Check, Trash } from "lucide-react";
import { useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/editor/ui/popover";
import { Button } from "@/components/editor/ui/button";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (e) {
    return null;
  }
}
interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkSelector = ({ open, onOpenChange }: LinkSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { editor } = useEditor();

  // Autofocus on input by default
  useEffect(() => {
    inputRef.current && inputRef.current?.focus();
  });
  if (!editor) return null;

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='ghost' className='gap-2 text-[var(--foreground)] hover:bg-[var(--notion-gray-bg-hover)] pr-3 pl-2 py-1 m-1 rounded-md'>
          <p className='text-base'>↗</p>
          <p
            className={cn("underline underline-offset-4", {
              "text-[var(--notion-blue-text)] decoration-[var(--notion-blue-border)]": editor.isActive("link"),
              "text-[var(--notion-gray-text)] decoration-[var(--notion-gray-border)]": !editor.isActive("link"),
            })}>
            Link
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-72 p-3' sideOffset={8}>
        <form
          onSubmit={(e) => {
            const target = e.currentTarget as HTMLFormElement;
            e.preventDefault();
            const input = target[0] as HTMLInputElement;
            const url = getUrlFromString(input.value);
            url && editor.chain().focus().setLink({ href: url }).run();
            onOpenChange(false);
          }}
          className='flex gap-2 items-center'>
          <input
            ref={inputRef}
            type='text'
            placeholder='Paste a link'
            className='flex-1 bg-[var(--notion-gray-bg)] text-[var(--foreground)] border border-[var(--notion-gray-border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--notion-blue-text)] focus:border-[var(--notion-blue-border)] transition-all placeholder:text-[var(--notion-gray-text)] placeholder:opacity-50'
            defaultValue={editor.getAttributes("link").href || ""}
          />
          {editor.getAttributes("link").href ? (
            <Button
              variant='outline'
              type='button'
              className='flex h-9 w-9 items-center justify-center rounded-lg p-0 text-[var(--notion-red-text)] border-[var(--notion-red-border)] hover:bg-[var(--notion-red-bg)] transition-colors flex-shrink-0'
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                onOpenChange(false);
              }}>
              <Trash className='h-4 w-4' />
            </Button>
          ) : (
            <Button 
              type='submit'
              className='h-9 w-9 p-0 rounded-lg bg-[var(--notion-blue-text)] text-white hover:bg-[var(--notion-blue-text-hover)] border border-[var(--notion-blue-border)] transition-colors flex-shrink-0'>
              <Check className='h-4 w-4' />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};