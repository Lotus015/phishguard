import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GeneratedEmail, CampaignConfig, AnalysisResult } from '@phishguard/shared';
import { api } from '@/lib/api';

interface InboxState {
  emails: GeneratedEmail[];
  sessionId: string | null;
  selectedEmailId: string | null;
  decisions: Record<string, boolean>;
  isSubmitted: boolean;
  isGenerating: boolean;
  isSubmitting: boolean;
  showWizard: boolean;
  error: string | null;
  analysisResult: AnalysisResult | null;
}

interface InboxContextValue extends InboxState {
  selectedEmail: GeneratedEmail | null;
  selectEmail: (id: string | null) => void;
  markEmail: (emailId: string, asPhishing: boolean) => void;
  clearDecision: (emailId: string) => void;
  submitAnalysis: () => Promise<void>;
  generateCampaign: (config: CampaignConfig) => Promise<void>;
  openWizard: () => void;
  closeWizard: () => void;
  allDecided: boolean;
  decidedCount: number;
}

const InboxContext = createContext<InboxContextValue | null>(null);

export function InboxProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, setState] = useState<InboxState>({
    emails: [],
    sessionId: null,
    selectedEmailId: null,
    decisions: {},
    isSubmitted: false,
    isGenerating: false,
    isSubmitting: false,
    showWizard: false,
    error: null,
    analysisResult: null,
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

  const submitAnalysis = useCallback(async () => {
    if (!state.sessionId) return;
    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const decisions = Object.entries(state.decisions).map(([emailId, markedAsPhishing]) => ({
        emailId,
        markedAsPhishing,
      }));
      const result = await api.submitAnalysis(state.sessionId, decisions);
      setState((prev) => ({
        ...prev,
        isSubmitted: true,
        isSubmitting: false,
        analysisResult: result,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Failed to submit analysis',
      }));
    }
  }, [state.sessionId, state.decisions]);

  const generateCampaign = useCallback(async (config: CampaignConfig) => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));
    try {
      const result = await api.generateCampaign(config);
      setState((prev) => ({
        ...prev,
        emails: result.emails,
        sessionId: result.sessionId,
        selectedEmailId: null,
        decisions: {},
        isSubmitted: false,
        isGenerating: false,
        showWizard: false,
        analysisResult: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Failed to generate campaign',
      }));
    }
  }, []);

  const openWizard = useCallback(() => {
    setState((prev) => ({ ...prev, showWizard: true }));
  }, []);

  const closeWizard = useCallback(() => {
    setState((prev) => ({ ...prev, showWizard: false }));
  }, []);

  const decidedCount = Object.keys(state.decisions).length;
  const allDecided = state.emails.length > 0 && decidedCount === state.emails.length;

  return (
    <InboxContext.Provider
      value={{
        ...state,
        selectedEmail,
        selectEmail,
        markEmail,
        clearDecision,
        submitAnalysis,
        generateCampaign,
        openWizard,
        closeWizard,
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
