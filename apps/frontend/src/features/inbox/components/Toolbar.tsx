import { RefreshCw, MoreVertical, ChevronLeft, ChevronRight, Square } from 'lucide-react';
import { useInbox } from '../context/InboxContext';

export function Toolbar(): React.JSX.Element {
  const { decidedCount, emails, allDecided, isSubmitted, isSubmitting, submitAnalysis, analysisResult } = useInbox();

  return (
    <div className="flex items-center justify-between px-2 py-1">
      {/* Left: checkbox + actions */}
      <div className="flex items-center gap-0.5">
        <button className="rounded p-2 text-neutral-600 hover:bg-neutral-100">
          <Square className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
        <button className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100" title="More">
          <MoreVertical className="h-4 w-4" />
        </button>

        {decidedCount > 0 && !isSubmitted && (
          <button
            onClick={submitAnalysis}
            disabled={!allDecided || isSubmitting}
            className="ml-2 rounded-full bg-[#1a73e8] px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:bg-[#1557b0] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : `Submit Analysis (${decidedCount}/${emails.length})`}
          </button>
        )}

        {isSubmitted && analysisResult && (
          <div className="ml-2 flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-medium text-green-700">
            Score: {analysisResult.score}/{analysisResult.total} correct
          </div>
        )}
      </div>

      {/* Right: pagination */}
      <div className="flex items-center gap-1 text-xs text-neutral-600">
        <span>1–{emails.length} of {emails.length}</span>
        <button className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100" disabled>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100" disabled>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
