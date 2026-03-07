import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpektrumSDK } from '@spektrum-ai/sdk';
import type { AnalysisResult } from '@phishguard/shared';

@Injectable()
export class ExerciseService {
  private readonly spektrum: SpektrumSDK;

  constructor(private configService: ConfigService) {
    this.spektrum = new SpektrumSDK({
      apiKey: this.configService.get<string>('spektrum.apiKey'),
      endpoint: this.configService.get<string>('spektrum.endpoint'),
    });
  }

  async generateExercise(analysisResult: AnalysisResult): Promise<{ appUrl: string }> {
    const { score, total, perEmail } = analysisResult;
    const percentage = Math.round((score / total) * 100);

    // Identify weak areas
    const mistakes = perEmail.filter((v) => !v.correct);
    const missedIndicators = mistakes
      .flatMap((v) => v.indicators)
      .map((ind) => ind.type.replace(/_/g, ' '));
    const uniqueIndicators = [...new Set(missedIndicators)];

    const title = `Phishing Awareness Exercise — ${percentage}% Score`;
    const description = this.buildExerciseDescription(percentage, uniqueIndicators, perEmail);

    console.log(`[EXERCISE] Creating Spektrum project...`);

    // Create project
    const project = await this.spektrum.createProject('phishguard');
    console.log(`[EXERCISE] Project created: ${project.id}`);

    // Create task
    const task = await this.spektrum.createTask(project.id, title, description);
    console.log(`[EXERCISE] Task created: ${task.id}`);

    // Code and deploy
    console.log(`[EXERCISE] Building and deploying...`);
    await this.spektrum.codeAndDeploy(task);

    // Get app URL
    const appUrl = await this.spektrum.getAppUrl(project.id);
    console.log(`[EXERCISE] Deployed at: ${appUrl}`);

    return { appUrl };
  }

  private buildExerciseDescription(
    percentage: number,
    weakAreas: string[],
    perEmail: AnalysisResult['perEmail'],
  ): string {
    const focusAreas = weakAreas.length > 0
      ? `Focus on these phishing indicators the user missed: ${weakAreas.join(', ')}.`
      : 'The user identified all phishing emails correctly. Create an advanced exercise to further sharpen their skills.';

    const emailSummaries = perEmail.map((e, i) => {
      const type = e.wasPhishing ? 'PHISHING' : 'LEGITIMATE';
      const result = e.correct ? 'correctly identified' : 'missed';
      const indicators = e.indicators.length > 0
        ? ` (indicators: ${e.indicators.map((ind) => ind.type.replace(/_/g, ' ')).join(', ')})`
        : '';
      return `${i + 1}. ${type} email — ${result}${indicators}`;
    }).join('\n');

    return `Create an interactive React phishing awareness training exercise.

USER PERFORMANCE:
- Score: ${percentage}%
- ${focusAreas}

EMAIL RESULTS:
${emailSummaries}

REQUIREMENTS:
- Build a single-page interactive React application
- The exercise should teach the user to recognize phishing indicators they missed
- Include 3-5 interactive scenarios or quiz questions
- Each scenario should present an email element (sender, URL, content) and ask the user to identify if it's suspicious
- Provide immediate feedback with explanations after each answer
- Show a final score at the end
- Use a clean, modern UI with good spacing and readable typography
- Use inline styles (no external CSS frameworks)
- Colors: blue (#1a73e8) for primary, green for correct, red for incorrect
- Make it educational and engaging, not just a simple quiz`;
  }
}
