import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GeneratedEmail } from '@phishguard/shared';
import { mockEmails } from '../mock-data';

interface InboxState {
  emails: GeneratedEmail[];
  selectedEmailId: string | null;
  decisions: Record<string, boolean>; // emailId -> markedAsPhishing
  isSubmitted: boolean;
}

interface InboxContextValue extends InboxState {
  selectedEmail: GeneratedEmail | null;
  selectEmail: (id: string | null) => void;
  markEmail: (emailId: string, asPhishing: boolean) => void;
  clearDecision: (emailId: string) => void;
  submitAnalysis: () => void;
  allDecided: boolean;
  decidedCount: number;
}

const InboxContext = createContext<InboxContextValue | null>(null);

export function InboxProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, setState] = useState<InboxState>({
    emails: mockEmails,
    selectedEmailId: null,
    decisions: {},
    isSubmitted: false,
  });

  const selectedEmail = state.emails.find((e) => e.id === state.selectedEmailId) ?? null;

  const selectEmail = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedEmailId: id }));
  }, []);

  const markEmail = useCallback((emailId: string, asPhishing: boolean) => {
    setState((prev) => ({
      ...prev,
      decisions: { ...prev.decisions, [emailId]: asPhishing },
    }));
  }, []);

  const clearDecision = useCallback((emailId: string) => {
    setState((prev) => {
      const decisions = { ...prev.decisions };
      delete decisions[emailId];
      return { ...prev, decisions };
    });
  }, []);

  const submitAnalysis = useCallback(() => {
    setState((prev) => ({ ...prev, isSubmitted: true }));
  }, []);

  const decidedCount = Object.keys(state.decisions).length;
  const allDecided = decidedCount === state.emails.length;

  return (
    <InboxContext.Provider
      value={{
        ...state,
        selectedEmail,
        selectEmail,
        markEmail,
        clearDecision,
        submitAnalysis,
        allDecided,
        decidedCount,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox(): InboxContextValue {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error('useInbox must be used within InboxProvider');
  return ctx;
}
