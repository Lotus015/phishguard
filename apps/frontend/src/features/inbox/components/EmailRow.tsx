import { Star, Archive, Trash2, Mail, Clock, ShieldAlert, ShieldCheck, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedEmail } from '@phishguard/shared';
import { useInbox } from '../context/InboxContext';

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent?.trim().replace(/\s+/g, ' ') ?? '';
}

interface EmailRowProps {
  email: GeneratedEmail;
}

export function EmailRow({ email }: EmailRowProps): React.JSX.Element {
  const { selectEmail, decisions, isSubmitted, analysisResult } = useInbox();
  const decision = decisions[email.id];
  const hasDecision = decision !== undefined;
  const isUnread = !hasDecision;

  const verdict = isSubmitted && analysisResult
    ? analysisResult.perEmail.find((v) => v.emailId === email.id)
    : null;

  const snippet = stripHtml(email.bodyHtml).slice(0, 120);

  return (
    <div
      onClick={() => selectEmail(email.id)}
      className={cn(
        'group flex h-10 cursor-pointer items-center border-b border-neutral-100 pl-2 pr-4 text-sm transition-colors',
        isUnread ? 'bg-white font-medium' : 'bg-[#f2f6fc]/50',
        'hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)]',
        'hover:z-10 hover:relative',
      )}
    >
      {/* Checkbox */}
      <div className="flex w-10 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="h-[18px] w-[18px] cursor-pointer rounded border-neutral-300 text-neutral-600"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Star */}
      <button
        className="mr-2 flex shrink-0 items-center text-neutral-300 hover:text-amber-400"
        onClick={(e) => e.stopPropagation()}
      >
        <Star className="h-5 w-5" />
      </button>

      {/* Decision indicator / verdict */}
      {verdict ? (
        <div className="mr-2 shrink-0">
          {verdict.correct ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      ) : hasDecision ? (
        <div className="mr-2 shrink-0">
          {decision ? (
            <ShieldAlert className="h-4 w-4 text-red-500" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-green-500" />
          )}
        </div>
      ) : null}

      {/* Sender */}
      <div className={cn(
        'w-[200px] shrink-0 truncate pr-4',
        isUnread ? 'font-bold text-neutral-900' : 'text-neutral-700',
      )}>
        {email.from.name}
      </div>

      {/* Subject + snippet */}
      <div className="flex min-w-0 flex-1 items-baseline truncate">
        <span className={cn(
          'shrink-0',
          isUnread ? 'font-bold text-neutral-900' : 'text-neutral-700',
        )}>
          {email.subject}
        </span>
        <span className="ml-1 truncate text-neutral-500">
          {' '}- {snippet}
        </span>
      </div>

      {/* Hover actions (shown on hover, hide time) */}
      <div className="ml-2 hidden shrink-0 items-center gap-0.5 group-hover:flex">
        <button
          className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-200"
          onClick={(e) => e.stopPropagation()}
          title="Archive"
        >
          <Archive className="h-4 w-4" />
        </button>
        <button
          className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-200"
          onClick={(e) => e.stopPropagation()}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-200"
          onClick={(e) => e.stopPropagation()}
          title="Mark as read"
        >
          <Mail className="h-4 w-4" />
        </button>
        <button
          className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-200"
          onClick={(e) => e.stopPropagation()}
          title="Snooze"
        >
          <Clock className="h-4 w-4" />
        </button>
      </div>

      {/* Time (hidden on hover) */}
      <div className={cn(
        'ml-2 w-[52px] shrink-0 text-right text-xs group-hover:hidden',
        isUnread ? 'font-bold text-neutral-900' : 'text-neutral-500',
      )}>
        {formatTime(email.receivedAt)}
      </div>
    </div>
  );
}
