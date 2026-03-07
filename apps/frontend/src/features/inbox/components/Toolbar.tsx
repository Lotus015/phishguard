import { RefreshCw, ChevronLeft } from 'lucide-react';
import { useInbox } from '../context/InboxContext';

export function Toolbar(): React.JSX.Element {
  const { selectedEmailId, selectEmail, decidedCount, emails, allDecided, isSubmitted, submitAnalysis } = useInbox();

  if (selectedEmailId) {
    return (
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <button
          onClick={() => selectEmail(null)}
          className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-neutral-500">Back to Inbox</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2">
      <div className="flex items-center gap-2">
        <button className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
          <RefreshCw className="h-4 w-4" />
        </button>
        <span className="text-sm text-neutral-500">
          {decidedCount}/{emails.length} classified
        </span>
      </div>

      {decidedCount > 0 && !isSubmitted && (
        <button
          onClick={submitAnalysis}
          disabled={!allDecided}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Submit Analysis ({decidedCount}/{emails.length})
        </button>
      )}
    </div>
  );
}
