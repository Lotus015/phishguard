import { useState } from 'react';
import { ArrowLeft, Star, Archive, Trash2, Mail, MoreVertical, Printer, ExternalLink, ShieldAlert, ShieldCheck, Globe, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInbox } from '../context/InboxContext';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-500',
    'bg-pink-600', 'bg-teal-600', 'bg-indigo-600', 'bg-amber-600',
  ];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 1);
}

export function EmailViewer(): React.JSX.Element | null {
  const { selectedEmail, selectEmail, decisions, markEmail, clearDecision, isSubmitted, analysisResult, phishingSiteUrls } = useInbox();

  if (!selectedEmail) return null;

  const [phishingSiteOpen, setPhishingSiteOpen] = useState<string | null>(null);

  const decision = decisions[selectedEmail.id];
  const hasDecision = decision !== undefined;
  const verdict = isSubmitted && analysisResult
    ? analysisResult.perEmail.find((v) => v.emailId === selectedEmail.id)
    : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center gap-1 border-b border-border px-2 py-1">
        <button
          onClick={() => selectEmail(null)}
          className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
          title="Back to Inbox"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100" title="Archive">
          <Archive className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100" title="Delete">
          <Trash2 className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100" title="Mark as unread">
          <Mail className="h-5 w-5" />
        </button>

        <div className="flex-1" />

        <button className="hidden rounded-full p-2 text-neutral-600 hover:bg-neutral-100 md:inline-flex" title="Print">
          <Printer className="h-5 w-5" />
        </button>
        <button className="hidden rounded-full p-2 text-neutral-600 hover:bg-neutral-100 md:inline-flex" title="Open in new window">
          <ExternalLink className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100" title="More">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-16">
        {/* Subject */}
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-normal text-neutral-900">{selectedEmail.subject}</h1>
          <button className="ml-4 shrink-0 text-neutral-300 hover:text-amber-400">
            <Star className="h-5 w-5" />
          </button>
        </div>

        {/* Sender info */}
        <div className="mt-6 flex items-start gap-3">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-medium text-white',
            getAvatarColor(selectedEmail.from.name),
          )}>
            {getInitials(selectedEmail.from.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900">{selectedEmail.from.name}</span>
              <span className="text-sm text-neutral-500">&lt;{selectedEmail.from.email}&gt;</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <span>to me</span>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
            </div>

            {/* Reply-To warning */}
            {selectedEmail.replyTo && (
              <div className="mt-1 flex items-center gap-1 text-sm text-amber-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
                Reply-To: {selectedEmail.replyTo.name} &lt;{selectedEmail.replyTo.email}&gt;
              </div>
            )}
          </div>

          <span className="shrink-0 text-xs text-neutral-500">
            {formatDate(selectedEmail.receivedAt)}
          </span>
        </div>

        {/* Email body */}
        <div className="mt-6 pl-0 md:pl-[52px]">
          <div
            className="text-sm leading-relaxed text-neutral-800"
            dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
          />
        </div>

        {/* PhishGuard action buttons */}
        {!isSubmitted && (
          <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-border pl-0 pt-6 md:flex-row md:items-center md:pl-[52px]">
            <button
              onClick={() =>
                hasDecision && decision === true
                  ? clearDecision(selectedEmail.id)
                  : markEmail(selectedEmail.id, true)
              }
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                hasDecision && decision === true
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'border border-neutral-300 text-neutral-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700',
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
                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                hasDecision && decision === false
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'border border-neutral-300 text-neutral-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700',
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Mark as Safe
            </button>
          </div>
        )}

        {/* Verdict panel (after submission) */}
        {verdict && (
          <div className={cn(
            'mt-8 rounded-lg border pl-0 pt-0 md:pl-[52px]',
          )}>
            <div className={cn(
              'rounded-lg p-4',
              verdict.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
            )}>
              <div className="flex items-center gap-2">
                {verdict.correct ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                )}
                <span className={cn(
                  'font-medium',
                  verdict.correct ? 'text-green-800' : 'text-red-800',
                )}>
                  {verdict.correct ? 'Correct!' : 'Incorrect'}
                </span>
                <span className="text-sm text-neutral-600">
                  — This email was {verdict.wasPhishing ? 'phishing' : 'legitimate'}
                </span>
              </div>

              {verdict.indicators.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-sm font-medium text-neutral-700">Phishing Indicators:</p>
                  <ul className="space-y-1.5">
                    {verdict.indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <span className="mt-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                          {ind.type.replace(/_/g, ' ')}
                        </span>
                        <span>{ind.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* See The Attack button for phishing emails */}
              {verdict.wasPhishing && (() => {
                const siteUrl = phishingSiteUrls[selectedEmail.id];
                if (siteUrl) {
                  return (
                    <button
                      onClick={() => setPhishingSiteOpen(siteUrl)}
                      className="mt-4 flex w-full items-center gap-2 rounded-lg bg-purple-50 px-4 py-2.5 text-left text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
                    >
                      <Globe className="h-4 w-4" />
                      See The Attack — View the phishing site this email links to
                      <ExternalLink className="ml-auto h-3.5 w-3.5" />
                    </button>
                  );
                }
                if (siteUrl === null) {
                  return (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-neutral-50 px-4 py-2.5 text-sm text-neutral-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Building phishing site simulation...
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Phishing site iframe modal */}
      {phishingSiteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative flex h-[90vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between bg-red-600 px-5 py-3 text-white">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">Phishing Site Simulation</p>
                  <p className="text-xs text-red-200">This is a safe educational recreation — no real data is collected</p>
                </div>
              </div>
              <button
                onClick={() => setPhishingSiteOpen(null)}
                className="rounded-full p-1.5 transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-4 py-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-neutral-500">
                <Globe className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{phishingSiteOpen}</span>
              </div>
            </div>

            {/* Iframe */}
            <iframe
              src={phishingSiteOpen}
              className="flex-1"
              title="Phishing Site Simulation"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
