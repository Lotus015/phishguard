import {
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  ChevronDown,
  Plus,
  Tag,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInbox } from '../context/InboxContext';

const mainItems = [
  { icon: Inbox, label: 'Inbox', countKey: 'inbox' as const },
  { icon: Star, label: 'Starred' },
  { icon: Clock, label: 'Snoozed' },
  { icon: Send, label: 'Sent' },
  { icon: FileText, label: 'Drafts', countKey: 'drafts' as const },
];

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps): React.JSX.Element {
  const { emails } = useInbox();

  const counts = {
    inbox: emails.length,
    drafts: 0,
  };

  if (collapsed) {
    return (
      <aside className="flex w-[72px] flex-col items-center pt-2">
        {/* Compose button - icon only */}
        <button className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c2e7ff] shadow-sm transition-shadow hover:shadow-md">
          <Plus className="h-6 w-6 text-neutral-700" />
        </button>

        {mainItems.map((item) => {
          const isActive = item.label === 'Inbox';
          return (
            <button
              key={item.label}
              className={cn(
                'mb-0.5 flex h-8 w-14 items-center justify-center rounded-full text-neutral-600 transition-colors',
                isActive && 'bg-[#d3e3fd]',
                !isActive && 'hover:bg-neutral-100',
              )}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </button>
          );
        })}
      </aside>
    );
  }

  return (
    <aside className="flex w-[256px] flex-col pt-2">
      {/* Compose button */}
      <div className="px-4 pb-4">
        <button className="flex h-14 items-center gap-3 rounded-2xl bg-[#c2e7ff] px-6 shadow-sm transition-shadow hover:shadow-md">
          <Plus className="h-6 w-6 text-neutral-700" />
          <span className="text-sm font-medium text-neutral-700">Compose</span>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3">
        {mainItems.map((item) => {
          const isActive = item.label === 'Inbox';
          const count = item.countKey ? counts[item.countKey] : undefined;
          return (
            <button
              key={item.label}
              className={cn(
                'flex w-full items-center gap-4 rounded-r-full py-1 pl-3 pr-4 text-sm transition-colors',
                'h-8',
                isActive
                  ? 'bg-[#d3e3fd] font-bold text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-100',
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-neutral-900')} />
              <span className="flex-1 text-left">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn('text-xs', isActive ? 'font-bold' : 'text-neutral-500')}>
                  {count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}

        {/* More */}
        <button className="flex h-8 w-full items-center gap-4 rounded-r-full py-1 pl-3 pr-4 text-sm text-neutral-700 hover:bg-neutral-100">
          <ChevronDown className="h-5 w-5" />
          <span>More</span>
        </button>

        {/* Labels section */}
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-sm font-medium text-neutral-700">Labels</span>
            <button className="rounded-full p-0.5 text-neutral-500 hover:bg-neutral-100">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button className="flex h-8 w-full items-center gap-4 rounded-r-full py-1 pl-3 pr-4 text-sm text-neutral-700 hover:bg-neutral-100">
            <Tag className="h-5 w-5 text-green-500" />
            <span>Phishing Training</span>
          </button>
        </div>
      </nav>

      {/* PhishGuard branding at bottom */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-neutral-400">
          <Shield className="h-4 w-4" />
          <span className="text-xs">PhishGuard Demo</span>
        </div>
      </div>
    </aside>
  );
}
