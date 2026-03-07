import { ShieldAlert, ShieldCheck, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInbox } from '../context/InboxContext';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function EmailViewer(): React.JSX.Element | null {
  const { selectedEmail, selectEmail, decisions, markEmail, clearDecision, isSubmitted } = useInbox();

  if (!selectedEmail) return null;

  const decision = decisions[selectedEmail.id];
  const hasDecision = decision !== undefined;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <button
          onClick={() => selectEmail(null)}
          className="mb-3 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-xl font-normal text-neutral-900">{selectedEmail.subject}</h1>

        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
            {selectedEmail.from.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900">{selectedEmail.from.name}</span>
              <span className="text-sm text-neutral-400">&lt;{selectedEmail.from.email}&gt;</span>
            </div>
            <div className="text-sm text-neutral-500">
              to {selectedEmail.to.name} &lt;{selectedEmail.to.email}&gt;
            </div>
            {selectedEmail.replyTo && (
              <div className="text-sm text-amber-600">
                Reply-To: {selectedEmail.replyTo.name} &lt;{selectedEmail.replyTo.email}&gt;
              </div>
            )}
          </div>
          <span className="shrink-0 text-xs text-neutral-400">
            {formatDate(selectedEmail.receivedAt)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
        />
      </div>

      {/* Action buttons */}
      {!isSubmitted && (
        <div className="flex items-center gap-3 border-t border-border px-6 py-4">
          <button
            onClick={() =>
              hasDecision && decision === true
                ? clearDecision(selectedEmail.id)
                : markEmail(selectedEmail.id, true)
            }
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
              hasDecision && decision === true
                ? 'bg-red-500 text-white'
                : 'border border-red-200 text-red-600 hover:bg-red-50',
            )}
          >
            <ShieldAlert className="h-4 w-4" />
            Report as Phishing
          </button>

          <button
            onClick={() =>
              hasDecision && decision === false
                ? clearDecision(selectedEmail.id)
                : markEmail(selectedEmail.id, false)
            }
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
              hasDecision && decision === false
                ? 'bg-green-500 text-white'
                : 'border border-green-200 text-green-600 hover:bg-green-50',
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Mark as Safe
          </button>
        </div>
      )}
    </div>
  );
}
