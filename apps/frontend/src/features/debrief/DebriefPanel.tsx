import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, X, Trophy, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useInbox } from '../inbox/context/InboxContext';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export function DebriefPanel(): React.JSX.Element | null {
  const { isSubmitted, analysisResult, sessionId } = useInbox();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [exerciseUrl, setExerciseUrl] = useState<string | null>(null);
  const [isGeneratingExercise, setIsGeneratingExercise] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-start debrief when panel opens for the first time
  useEffect(() => {
    if (open && !hasStarted && sessionId) {
      setHasStarted(true);
      sendMessage('Please give me a brief debrief on how I did and what I should look out for.');
    }
  }, [open, hasStarted, sessionId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!sessionId || isStreaming) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsStreaming(true);

    // Add empty assistant message that we'll stream into
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      for await (const chunk of api.streamChat(sessionId, text)) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'assistant' && last.content === '') {
          updated[updated.length - 1] = { ...last, content: 'Sorry, something went wrong. Please try again.' };
        }
        return updated;
      });
    }
    setIsStreaming(false);
  }, [sessionId, isStreaming]);

  const handleGenerateExercise = useCallback(async () => {
    if (!analysisResult || isGeneratingExercise) return;
    setIsGeneratingExercise(true);
    try {
      const result = await api.generateExercise(analysisResult);
      setExerciseUrl(result.appUrl);
    } catch (err) {
      console.error('Failed to generate exercise:', err);
    }
    setIsGeneratingExercise(false);
  }, [analysisResult, isGeneratingExercise]);

  if (!isSubmitted || !analysisResult) return null;

  const score = analysisResult.score;
  const total = analysisResult.total;
  const percentage = Math.round((score / total) * 100);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 flex items-center gap-3 rounded-2xl bg-[#1a73e8] px-6 py-3.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#1557b0] hover:shadow-xl"
      >
        <MessageCircle className="h-5 w-5" />
        Debrief Chat
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 flex h-[560px] w-[420px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1a73e8] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Debrief</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs">
            <Trophy className="h-3.5 w-3.5" />
            {score}/{total} ({percentage}%)
          </div>
          <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.filter((m) => m.role !== 'user' || m.content !== 'Please give me a brief debrief on how I did and what I should look out for.').map((msg, i) => (
          <div key={i} className={cn('mb-3', msg.role === 'user' ? 'flex justify-end' : '')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-[#1a73e8] text-white'
                  : 'bg-neutral-100 text-neutral-800',
              )}
            >
              {msg.content || (
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <span className="animate-pulse">Thinking</span>
                  <span className="animate-bounce">...</span>
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Exercise button / link */}
      <div className="border-t border-neutral-200 px-4 py-2">
        {exerciseUrl ? (
          <a
            href={exerciseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <ExternalLink className="h-4 w-4" />
            Open Interactive Exercise
          </a>
        ) : (
          <button
            onClick={handleGenerateExercise}
            disabled={isGeneratingExercise}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isGeneratingExercise ? 'Generating Exercise...' : 'Generate Practice Exercise'}
          </button>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) sendMessage(input.trim());
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the exercise..."
            disabled={isStreaming}
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm outline-none transition-colors focus:border-[#1a73e8] focus:bg-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="rounded-full bg-[#1a73e8] p-2 text-white transition-opacity hover:bg-[#1557b0] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
