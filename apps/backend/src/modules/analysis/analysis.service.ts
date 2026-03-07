import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';
import type { AnalysisSubmission, AnalysisResult, EmailVerdict, PhishingIndicator } from '@phishguard/shared';

@Injectable()
export class AnalysisService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async submitAnalysis(submission: AnalysisSubmission): Promise<AnalysisResult> {
    const { sessionId, decisions } = submission;

    // Verify session exists
    const [session] = await this.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Get all emails for this session
    const emailRows = await this.db
      .select()
      .from(schema.emails)
      .where(eq(schema.emails.sessionId, sessionId));

    const emailMap = new Map(emailRows.map((e) => [e.id, e]));

    // Evaluate each decision
    const perEmail: EmailVerdict[] = [];
    let score = 0;

    for (const decision of decisions) {
      const email = emailMap.get(decision.emailId);
      if (!email) continue;

      const correct = decision.markedAsPhishing === email.isPhishing;
      if (correct) score++;

      // Update the email record with user's decision
      await this.db
        .update(schema.emails)
        .set({ userMarkedAsPhishing: decision.markedAsPhishing })
        .where(eq(schema.emails.id, decision.emailId));

      perEmail.push({
        emailId: decision.emailId,
        correct,
        wasPhishing: email.isPhishing,
        userMarkedAsPhishing: decision.markedAsPhishing,
        indicators: email.indicators as PhishingIndicator[],
      });
    }

    const total = decisions.length;

    // Update session with score
    await this.db
      .update(schema.sessions)
      .set({ status: 'completed', score, total, updatedAt: new Date() })
      .where(eq(schema.sessions.id, sessionId));

    console.log(`[ANALYSIS] Session ${sessionId}: ${score}/${total} correct`);

    return { sessionId, score, total, perEmail };
  }
}
