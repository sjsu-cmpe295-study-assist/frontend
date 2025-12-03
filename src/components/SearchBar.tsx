import { Search } from 'lucide-react';
import { Input } from './Input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search notebooks...' }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50"
        style={{ color: 'var(--foreground)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all bg-[var(--background)] border-[var(--notion-gray-border)] text-[var(--foreground)] placeholder:text-[var(--notion-gray-text)] placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--notion-blue-text)] focus:border-[var(--notion-blue-border)] hover:border-[var(--notion-gray-text-hover)]"
      />
    </div>
  );
}

