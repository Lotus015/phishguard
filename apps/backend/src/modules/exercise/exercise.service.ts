import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { SpektrumSDK } from '@spektrum-ai/sdk';
import { DRIZZLE, type DrizzleDB } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';
import type { PhishingIndicator } from '@phishguard/shared';

@Injectable()
export class ExerciseService {
  private readonly spektrum: SpektrumSDK;

  constructor(
    private configService: ConfigService,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {
    this.spektrum = new SpektrumSDK({
      apiKey: this.configService.get<string>('spektrum.apiKey'),
      endpoint: this.configService.get<string>('spektrum.endpoint'),
    });
  }

  /**
   * Fire-and-forget: generate phishing site clones for all phishing emails in a session.
   * Runs in background after analysis submission.
   */
  async generatePhishingSitesInBackground(sessionId: string): Promise<void> {
    const emailRows = await this.db
      .select()
      .from(schema.emails)
      .where(eq(schema.emails.sessionId, sessionId));

    const phishingEmails = emailRows.filter((e) => e.isPhishing);

    if (phishingEmails.length === 0) return;

    console.log(`[EXERCISE] Starting background generation of ${phishingEmails.length} phishing sites for session ${sessionId}`);

    // Launch all in parallel — don't await the outer promise (fire-and-forget)
    const promises = phishingEmails.map((email) =>
      this.generateSinglePhishingSite(email).catch((err) => {
        console.error(`[EXERCISE] Failed to generate site for email ${email.id}:`, err.message);
      }),
    );

    await Promise.allSettled(promises);
    console.log(`[EXERCISE] All phishing site generation completed for session ${sessionId}`);
  }

  /**
   * Get phishing site URLs for a session (for frontend polling).
   */
  async getPhishingSiteStatus(sessionId: string): Promise<Record<string, string | null>> {
    const emailRows = await this.db
      .select({
        id: schema.emails.id,
        isPhishing: schema.emails.isPhishing,
        phishingSiteUrl: schema.emails.phishingSiteUrl,
      })
      .from(schema.emails)
      .where(eq(schema.emails.sessionId, sessionId));

    const result: Record<string, string | null> = {};
    for (const email of emailRows) {
      if (email.isPhishing) {
        result[email.id] = email.phishingSiteUrl;
      }
    }
    return result;
  }

  private async generateSinglePhishingSite(email: typeof schema.emails.$inferSelect): Promise<void> {
    const indicators = email.indicators as PhishingIndicator[];
    const indicatorList = indicators
      .map((ind) => `- ${ind.type.replace(/_/g, ' ')}: ${ind.description}`)
      .join('\n');

    // Determine what kind of phishing site to generate
    const hasCredentialHarvest = indicators.some((i) =>
      i.type === 'request_for_credentials' || i.type === 'suspicious_url',
    );
    const hasBrandImpersonation = indicators.some((i) => i.type === 'brand_impersonation');

    // Extract brand from email content
    const brandHints = this.extractBrandHints(email.fromName, email.fromEmail, email.subject);

    const title = `Phishing Site: ${email.subject.slice(0, 50)}`;
    const description = this.buildPhishingSitePrompt({
      fromName: email.fromName,
      fromEmail: email.fromEmail,
      subject: email.subject,
      indicators: indicatorList,
      brandHints,
      isCredentialHarvest: hasCredentialHarvest,
      hasBrandImpersonation,
    });

    console.log(`[EXERCISE] Generating phishing site for "${email.subject.slice(0, 40)}..."...`);

    // Create project
    const projectResponse = await this.spektrum.createProject('phishguard') as any;
    const projectId = projectResponse.project?.id ?? projectResponse.id;

    // Create task
    const taskResponse = await this.spektrum.createTask(projectId, title, description) as any;
    const task = taskResponse.task ?? taskResponse;

    // Code and deploy
    await this.spektrum.codeAndDeploy(task);

    // Get app URL
    const appUrl = await this.spektrum.getAppUrl(projectId);
    console.log(`[EXERCISE] Phishing site ready for email ${email.id}: ${appUrl}`);

    // Save URL to database
    await this.db
      .update(schema.emails)
      .set({ phishingSiteUrl: appUrl })
      .where(eq(schema.emails.id, email.id));
  }

  private extractBrandHints(fromName: string, fromEmail: string, subject: string): string {
    const text = `${fromName} ${fromEmail} ${subject}`.toLowerCase();
    const brands = ['microsoft', 'google', 'apple', 'paypal', 'amazon', 'netflix', 'dropbox', 'linkedin', 'slack', 'zoom', 'docusign'];
    const found = brands.filter((b) => text.includes(b));
    if (found.length > 0) return found.join(', ');

    // Fallback: use sender name as brand
    return fromName;
  }

  private buildPhishingSitePrompt(ctx: {
    fromName: string;
    fromEmail: string;
    subject: string;
    indicators: string;
    brandHints: string;
    isCredentialHarvest: boolean;
    hasBrandImpersonation: boolean;
  }): string {
    const pageType = ctx.isCredentialHarvest
      ? 'a fake login/credential verification page'
      : 'a fake action page (document signing, payment confirmation, or account verification)';

    return `Build ${pageType} that a phishing email would link to.

CONTEXT:
- Email from: ${ctx.fromName} <${ctx.fromEmail}>
- Subject: "${ctx.subject}"
- Brand to impersonate: ${ctx.brandHints}
- Phishing indicators found:
${ctx.indicators}

THE PAGE MUST INCLUDE:
1. A realistic-looking fake page impersonating "${ctx.brandHints}" — use their color scheme and style
2. A fake URL bar at the top showing a suspicious URL (e.g. "micros0ft-verify.com" or "secure-login-${ctx.brandHints.split(',')[0].trim().toLowerCase()}.com") — make it look like a browser address bar
3. A login form or action form appropriate for the attack type
4. Educational overlay mode: a sticky button "Reveal Red Flags" that when clicked highlights all suspicious elements with red borders and shows tooltip explanations

CRITICAL CONSTRAINTS FOR FAST GENERATION:
- Single file, single component — NO routing, NO multiple pages
- ALL styles inline — no CSS imports, no external stylesheets
- NO external dependencies — no icon libraries, no UI frameworks
- Keep it SIMPLE: one page, one form, educational toggles
- Use only basic HTML elements styled with inline React style objects
- Maximum ~200 lines of JSX
- The page should look realistic but the code should be minimal`;
  }
}
