import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Clock } from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Book, label: 'Notebooks', href: '/' },
  { icon: Clock, label: 'Recent', href: '/recent' },
];

export function NavigationItems() {
  const pathname = usePathname();

  return (
    <nav className="px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors mb-1 ${
              isActive
                ? 'bg-[var(--notion-blue-bg)] text-[var(--notion-blue-text)]'
                : 'text-[var(--notion-gray-text)] hover:bg-[var(--notion-gray-bg-hover)] hover:text-[var(--foreground)]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

