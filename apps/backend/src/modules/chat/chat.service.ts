import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';
import { AgentService, type Message } from '../agent/agent.service';
import { buildDebriefSystemPrompt } from './debrief.prompt';
import type { PhishingIndicator } from '@phishguard/shared';

@Injectable()
export class ChatService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private agentService: AgentService,
  ) {}

  async *streamDebrief(
    sessionId: string,
    userMessage: string,
  ): AsyncGenerator<string, void, unknown> {
    // Get session
    const [session] = await this.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Get emails for context
    const emailRows = await this.db
      .select()
      .from(schema.emails)
      .where(eq(schema.emails.sessionId, sessionId));

    // Get chat history
    const chatHistory = await this.db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.sessionId, sessionId));

    // Build debrief context
    const perEmail = emailRows.map((e) => ({
      correct: e.userMarkedAsPhishing === e.isPhishing,
      wasPhishing: e.isPhishing,
      userMarkedAsPhishing: e.userMarkedAsPhishing ?? false,
      subject: e.subject,
      fromEmail: e.fromEmail,
      indicators: (e.indicators as PhishingIndicator[]) || [],
    }));

    const systemPrompt = buildDebriefSystemPrompt({
      score: session.score ?? 0,
      total: session.total ?? emailRows.length,
      perEmail,
    });

    // Save user message
    await this.db.insert(schema.chatMessages).values({
      sessionId,
      role: 'user',
      content: userMessage,
    });

    // Build messages array
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((m) => ({ role: m.role as Message['role'], content: m.content })),
    ];

    // Stream response
    let fullResponse = '';
    for await (const chunk of this.agentService.streamResponse(messages, userMessage)) {
      fullResponse += chunk;
      yield chunk;
    }

    // Save assistant response
    await this.db.insert(schema.chatMessages).values({
      sessionId,
      role: 'assistant',
      content: fullResponse,
    });
  }

  async getChatHistory(sessionId: string) {
    const messages = await this.db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.sessionId, sessionId));

    return messages
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      }));
  }
}
