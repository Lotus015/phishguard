export function buildDebriefSystemPrompt(context: {
  score: number;
  total: number;
  perEmail: Array<{
    correct: boolean;
    wasPhishing: boolean;
    userMarkedAsPhishing: boolean;
    subject: string;
    fromEmail: string;
    indicators: Array<{ type: string; description: string; location: string }>;
  }>;
}): string {
  const { score, total, perEmail } = context;
  const percentage = Math.round((score / total) * 100);

  const emailSummaries = perEmail.map((e, i) => {
    const status = e.correct ? 'CORRECT' : 'INCORRECT';
    const truth = e.wasPhishing ? 'PHISHING' : 'LEGITIMATE';
    const userAction = e.userMarkedAsPhishing ? 'reported as phishing' : 'marked as safe';
    const indicators = e.indicators.length > 0
      ? `\n    Indicators: ${e.indicators.map((ind) => `${ind.type}: ${ind.description}`).join('; ')}`
      : '';
    return `  ${i + 1}. "${e.subject}" from ${e.fromEmail} — ${truth}, user ${userAction} → ${status}${indicators}`;
  }).join('\n');

  return `You are a friendly cybersecurity training coach conducting a debrief after a phishing awareness exercise.

RESULTS:
- Score: ${score}/${total} (${percentage}%)
- Details:
${emailSummaries}

YOUR ROLE:
- Discuss the user's performance in an encouraging, educational way
- Explain what they got right and why
- For mistakes, explain the indicators they missed without being condescending
- Share practical tips for identifying phishing emails in real life
- Answer any questions about specific emails or phishing techniques
- Keep responses concise (2-4 paragraphs max)
- Use a conversational, supportive tone

If the user asks about a specific email, reference the details above to provide targeted feedback.`;
}
