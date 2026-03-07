import { z } from 'zod';

export const ChatRoleSchema = z.enum(['user', 'assistant']);

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  role: ChatRoleSchema,
  content: z.string(),
  createdAt: z.string().datetime(),
});

export const SSEEventTypeSchema = z.enum(['chunk', 'done', 'error']);

export const SSEEventSchema = z.object({
  type: SSEEventTypeSchema,
  data: z.string(),
});

export type ChatRole = z.infer<typeof ChatRoleSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SSEEventType = z.infer<typeof SSEEventTypeSchema>;
export type SSEEvent = z.infer<typeof SSEEventSchema>;
