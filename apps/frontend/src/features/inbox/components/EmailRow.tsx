import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedEmail } from '@phishguard/shared';
import { useInbox } from '../context/InboxContext';

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-amber-500',
  ];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent?.trim() ?? '';
}

interface EmailRowProps {
  email: GeneratedEmail;
}

export function EmailRow({ email }: EmailRowProps): React.JSX.Element {
  const { selectEmail, decisions } = useInbox();
  const decision = decisions[email.id];
  const hasDecision = decision !== undefined;

  return (
    <button
      onClick={() => selectEmail(email.id)}
      className={cn(
        'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-neutral-50',
        !hasDecision && 'bg-white font-semibold',
        hasDecision && 'bg-neutral-50/50',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
          getAvatarColor(email.from.name),
        )}
      >
        {getInitials(email.from.name)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', !hasDecision ? 'font-semibold text-neutral-900' : 'text-neutral-700')}>
            {email.from.name}
          </span>
          <span className="shrink-0 text-xs text-neutral-400">
            {formatTime(email.receivedAt)}
          </span>
        </div>
        <div className="truncate text-sm text-neutral-800">{email.subject}</div>
        <div className="truncate text-xs text-neutral-400">{stripHtml(email.bodyHtml).slice(0, 80)}</div>
      </div>

      {/* Decision badge */}
      {hasDecision && (
        <div className="shrink-0">
          {decision ? (
            <ShieldAlert className="h-4 w-4 text-red-500" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-green-500" />
          )}
        </div>
      )}
    </button>
  );
}
