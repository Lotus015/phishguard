import { z } from 'zod';
import { PhishingIndicatorSchema } from './email.types';

export const EmailDecisionSchema = z.object({
  emailId: z.string().uuid(),
  markedAsPhishing: z.boolean(),
});

export const AnalysisSubmissionSchema = z.object({
  sessionId: z.string().uuid(),
  decisions: z.array(EmailDecisionSchema),
});

export const EmailVerdictSchema = z.object({
  emailId: z.string().uuid(),
  correct: z.boolean(),
  wasPhishing: z.boolean(),
  userMarkedAsPhishing: z.boolean(),
  indicators: z.array(PhishingIndicatorSchema),
});

export const AnalysisResultSchema = z.object({
  sessionId: z.string().uuid(),
  score: z.number(),
  total: z.number(),
  perEmail: z.array(EmailVerdictSchema),
});

export type EmailDecision = z.infer<typeof EmailDecisionSchema>;
export type AnalysisSubmission = z.infer<typeof AnalysisSubmissionSchema>;
export type EmailVerdict = z.infer<typeof EmailVerdictSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
