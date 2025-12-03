import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { type Notebook } from '@/lib/mock-data';

interface SidebarHeaderProps {
  notebook?: Notebook;
}

export function SidebarHeader({ notebook }: SidebarHeaderProps) {
  return (
    <div className={`px-4 py-3 mt-2 ${!notebook ? 'border-b border-[var(--notion-gray-border)]' : ''}`}>
      {notebook ? (
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--notion-gray-text)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-semibold">Back to Notebooks</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[var(--foreground)]" />
          <span className="text-lg font-semibold text-[var(--foreground)]">Study Assist</span>
        </div>
      )}
    </div>
  );
}

