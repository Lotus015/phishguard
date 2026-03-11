import { Inbox, Tag, Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  icon: typeof Inbox;
  label: string;
  badge?: number;
  badgeColor?: string;
  subtitle?: string;
}

const tabs: Tab[] = [
  { icon: Inbox, label: 'Primary' },
  { icon: Tag, label: 'Promotions', badge: 3, badgeColor: 'bg-green-600', subtitle: 'PhishGuard Training' },
  { icon: Users, label: 'Social', badge: 1, badgeColor: 'bg-blue-600' },
  { icon: Bell, label: 'Updates', badge: 2, badgeColor: 'bg-red-600' },
];

export function CategoryTabs(): React.JSX.Element {
  return (
    <div className="flex overflow-x-auto border-b border-border">
      {tabs.map((tab, i) => {
        const isActive = i === 0;
        return (
          <button
            key={tab.label}
            className={cn(
              'group relative flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap px-2 py-2.5 text-sm transition-colors md:px-4',
              isActive
                ? 'text-[#1a73e8]'
                : 'text-neutral-600 hover:bg-neutral-50',
            )}
          >
            <tab.icon className={cn('h-5 w-5', isActive ? 'text-[#1a73e8]' : 'text-neutral-500')} />

            <div className="flex items-center gap-2">
              <span className={cn('font-medium', isActive && 'font-bold')}>{tab.label}</span>
              {tab.badge && (
                <span className={cn('hidden rounded-full px-1.5 py-0.5 text-xs font-medium text-white md:inline', tab.badgeColor)}>
                  {tab.badge} new
                </span>
              )}
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#1a73e8]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
