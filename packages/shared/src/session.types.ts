import { z } from 'zod';
import { DifficultySchema } from './email.types';

export const PhishingTypeSchema = z.enum([
  'spear_phishing',
  'bec',
  'credential_harvest',
  'brand_impersonation',
  'invoice_fraud',
  'mixed',
]);

export const CampaignConfigSchema = z.object({
  phishingType: PhishingTypeSchema,
  difficulty: DifficultySchema,
  targetRole: z.string().optional(),
  industry: z.string().optional(),
  emailCount: z.number().min(4).max(12).default(8),
});

export const SessionStatusSchema = z.enum([
  'generating',
  'active',
  'submitted',
  'debriefed',
]);

export type PhishingType = z.infer<typeof PhishingTypeSchema>;
export type CampaignConfig = z.infer<typeof CampaignConfigSchema>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
