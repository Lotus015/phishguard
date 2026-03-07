import { Menu, Search, Settings, HelpCircle, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps): React.JSX.Element {
  return (
    <header className="flex h-16 items-center gap-2 border-b border-border px-4">
      {/* Left: hamburger + logo */}
      <button
        onClick={onToggleSidebar}
        className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1 px-2">
        <svg viewBox="0 0 75 24" className="h-6 w-auto" aria-label="PhishGuard">
          <text x="0" y="19" className="fill-neutral-500" style={{ fontSize: '20px', fontFamily: 'Product Sans, Arial, sans-serif', fontWeight: 400 }}>
            PhishGuard
          </text>
        </svg>
      </div>

      {/* Center: search bar */}
      <div className="mx-4 flex w-full max-w-[720px]">
        <div className="flex w-full items-center rounded-full bg-[#eaf1fb] px-4 py-2.5 transition-colors focus-within:bg-white focus-within:shadow-md">
          <Search className="mr-3 h-5 w-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search mail"
            className="flex-1 bg-transparent text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
          />
          <button className="ml-2 rounded-full p-1 text-neutral-500 hover:bg-neutral-200">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Spacer pushes icons to the right */}
      <div className="flex-1" />

      {/* Right: action icons + profile */}
      <div className="flex shrink-0 items-center gap-1">
        <button className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
          <Settings className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
          <LayoutGrid className="h-5 w-5" />
        </button>
        <button className={cn(
          'ml-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white',
          'bg-purple-600',
        )}>
          J
        </button>
      </div>
    </header>
  );
}
