import {
  Inbox,
  Star,
  Send,
  FileText,
  AlertTriangle,
  Trash2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInbox } from '../context/InboxContext';

const navItems = [
  { icon: Inbox, label: 'Inbox', count: true },
  { icon: Star, label: 'Starred' },
  { icon: Send, label: 'Sent' },
  { icon: FileText, label: 'Drafts' },
  { icon: AlertTriangle, label: 'Spam' },
  { icon: Trash2, label: 'Trash' },
];

export function Sidebar(): React.JSX.Element {
  const { emails } = useInbox();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-neutral-50/50">
      <div className="p-4">
        <div className="flex items-center gap-2 px-3 py-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-neutral-900">PhishGuard</span>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = item.label === 'Inbox';
          return (
            <button
              key={item.label}
              className={cn(
                'flex w-full items-center gap-3 rounded-full px-4 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-red-100 font-bold text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-100',
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && isActive && (
                <span className="text-xs font-bold">{emails.length}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
