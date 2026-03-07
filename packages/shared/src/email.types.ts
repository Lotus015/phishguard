import { z } from 'zod';

export const EmailContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const PhishingIndicatorTypeSchema = z.enum([
  'spoofed_sender',
  'suspicious_url',
  'urgency',
  'grammar_errors',
  'mismatched_reply_to',
  'generic_greeting',
  'suspicious_attachment',
  'brand_impersonation',
  'too_good_to_be_true',
  'request_for_credentials',
]);

export const PhishingIndicatorSchema = z.object({
  type: PhishingIndicatorTypeSchema,
  description: z.string(),
  location: z.string(),
});

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const GeneratedEmailSchema = z.object({
  id: z.string().uuid(),
  from: EmailContactSchema,
  replyTo: EmailContactSchema.optional(),
  to: EmailContactSchema,
  subject: z.string(),
  bodyHtml: z.string(),
  receivedAt: z.string().datetime(),
  isPhishing: z.boolean(),
  indicators: z.array(PhishingIndicatorSchema),
  difficulty: DifficultySchema,
});

export type EmailContact = z.infer<typeof EmailContactSchema>;
export type PhishingIndicatorType = z.infer<typeof PhishingIndicatorTypeSchema>;
export type PhishingIndicator = z.infer<typeof PhishingIndicatorSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type GeneratedEmail = z.infer<typeof GeneratedEmailSchema>;
