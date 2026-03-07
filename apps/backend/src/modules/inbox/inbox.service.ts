import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { DRIZZLE, type DrizzleDB } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';
import { AgentService, type Message } from '../agent/agent.service';
import { EMAIL_GENERATION_PROMPT } from '../agent/prompts/email-generation';
import type { CampaignConfig, GeneratedEmail, PhishingIndicator } from '@phishguard/shared';

// Zod schema for Mozaik structured output
const GeneratedEmailBatchSchema = z.object({
  emails: z.array(
    z.object({
      fromName: z.string(),
      fromEmail: z.string(),
      replyToName: z.string().optional(),
      replyToEmail: z.string().optional(),
      toName: z.string(),
      toEmail: z.string(),
      subject: z.string(),
      bodyHtml: z.string(),
      isPhishing: z.boolean(),
      indicators: z.array(
        z.object({
          type: z.string(),
          description: z.string(),
          location: z.string(),
        }),
      ),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    }),
  ),
});

@Injectable()
export class InboxService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private agentService: AgentService,
  ) {}

  async generateCampaign(config: CampaignConfig): Promise<{
    sessionId: string;
    emails: GeneratedEmail[];
  }> {
    // Create session
    const [session] = await this.db
      .insert(schema.sessions)
      .values({
        status: 'generating',
        campaignConfig: config,
      })
      .returning();

    const sessionId = session.id;

    // Build prompt for AI
    const task = this.buildGenerationTask(config);
    const messages: Message[] = [
      { role: 'system', content: EMAIL_GENERATION_PROMPT },
    ];

    console.log(`[INBOX] Generating ${config.emailCount} emails for session ${sessionId}`);

    // Generate emails via Mozaik structured output
    const result = await this.agentService.generateStructuredResponse(
      messages,
      task,
      GeneratedEmailBatchSchema,
      'gpt-4.1-mini',
    );

    // Save emails to database
    const generatedEmails: GeneratedEmail[] = [];

    for (const emailData of result.emails) {
      const id = uuidv4();
      const receivedAt = this.generateRecentTimestamp();

      await this.db.insert(schema.emails).values({
        id,
        sessionId,
        fromName: emailData.fromName,
        fromEmail: emailData.fromEmail,
        replyToName: emailData.replyToName ?? null,
        replyToEmail: emailData.replyToEmail ?? null,
        toName: emailData.toName,
        toEmail: emailData.toEmail,
        subject: emailData.subject,
        bodyHtml: emailData.bodyHtml,
        receivedAt,
        isPhishing: emailData.isPhishing,
        indicators: emailData.indicators,
        difficulty: emailData.difficulty,
      });

      generatedEmails.push({
        id,
        from: { name: emailData.fromName, email: emailData.fromEmail },
        replyTo: emailData.replyToName && emailData.replyToEmail
          ? { name: emailData.replyToName, email: emailData.replyToEmail }
          : undefined,
        to: { name: emailData.toName, email: emailData.toEmail },
        subject: emailData.subject,
        bodyHtml: emailData.bodyHtml,
        receivedAt: receivedAt.toISOString(),
        isPhishing: emailData.isPhishing,
        indicators: emailData.indicators as PhishingIndicator[],
        difficulty: emailData.difficulty,
      });
    }

    // Update session status
    await this.db
      .update(schema.sessions)
      .set({ status: 'active', total: generatedEmails.length, updatedAt: new Date() })
      .where(eq(schema.sessions.id, sessionId));

    console.log(`[INBOX] Generated ${generatedEmails.length} emails for session ${sessionId}`);

    return { sessionId, emails: generatedEmails };
  }

  async getInbox(sessionId: string): Promise<{
    session: typeof schema.sessions.$inferSelect;
    emails: GeneratedEmail[];
  }> {
    const [session] = await this.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const emailRows = await this.db
      .select()
      .from(schema.emails)
      .where(eq(schema.emails.sessionId, sessionId));

    const emails: GeneratedEmail[] = emailRows.map((row) => ({
      id: row.id,
      from: { name: row.fromName, email: row.fromEmail },
      replyTo: row.replyToName && row.replyToEmail
        ? { name: row.replyToName, email: row.replyToEmail }
        : undefined,
      to: { name: row.toName, email: row.toEmail },
      subject: row.subject,
      bodyHtml: row.bodyHtml,
      receivedAt: row.receivedAt.toISOString(),
      isPhishing: row.isPhishing,
      indicators: row.indicators as PhishingIndicator[],
      difficulty: row.difficulty as GeneratedEmail['difficulty'],
    }));

    return { session, emails };
  }

  private buildGenerationTask(config: CampaignConfig): string {
    const parts = [
      `Generate exactly ${config.emailCount} realistic emails for a phishing training exercise.`,
      ``,
      `Campaign type: ${config.phishingType}`,
      `Difficulty: ${config.difficulty}`,
    ];

    if (config.targetRole) {
      parts.push(`Target role: ${config.targetRole} (tailor emails to what this role would typically receive)`);
    }

    if (config.industry) {
      parts.push(`Industry: ${config.industry} (use industry-specific terminology and scenarios)`);
    }

    parts.push(
      ``,
      `Requirements:`,
      `- Mix of approximately 40-60% phishing emails`,
      `- All emails should be addressed to "John Smith" <john.smith@company.com>`,
      `- Use varied and realistic sender names and email addresses`,
      `- Phishing emails should use techniques appropriate for the "${config.phishingType}" category`,
      `- HTML body should include proper inline styling`,
      `- For phishing emails, include detailed indicators array`,
      `- For legitimate emails, indicators array should be empty`,
    );

    return parts.join('\n');
  }

  private generateRecentTimestamp(): Date {
    const now = new Date();
    const minutesAgo = Math.floor(Math.random() * 480); // 0-8 hours ago
    return new Date(now.getTime() - minutesAgo * 60 * 1000);
  }
}
