import type { GeneratedEmail } from '@phishguard/shared';

export const mockEmails: GeneratedEmail[] = [
  {
    id: '1a2b3c4d-0001-4000-8000-000000000001',
    from: { name: 'Google Security', email: 'no-reply@accounts.google.com' },
    to: { name: 'John Smith', email: 'john.smith@company.com' },
    subject: 'Security alert: New sign-in from Chrome on Windows',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <p>Hi John,</p>
        <p>We noticed a new sign-in to your Google Account on a Windows device. If this was you, you don't need to do anything. If not, we'll help you secure your account.</p>
        <p><strong>New sign-in</strong></p>
        <ul>
          <li>Device: Windows PC</li>
          <li>Location: New York, United States</li>
          <li>Time: March 7, 2026, 2:34 PM EST</li>
        </ul>
        <p>If you don't recognize this activity, please <a href="https://myaccount.google.com/security">review your account security</a>.</p>
        <p>Thanks,<br/>The Google Accounts team</p>
      </div>
    `,
    receivedAt: '2026-03-07T14:34:00Z',
    isPhishing: false,
    indicators: [],
    difficulty: 'easy',
  },
  {
    id: '1a2b3c4d-0002-4000-8000-000000000002',
    from: { name: 'Microsoft 365', email: 'security@micr0soft-365.com' },
    replyTo: { name: 'Support', email: 'support@micr0soft-365.com' },
    to: { name: 'John Smith', email: 'john.smith@company.com' },
    subject: 'URGENT: Your password expires in 24 hours',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <p>Dear User,</p>
        <p>Your Microsoft 365 password will expire in <strong>24 hours</strong>. To avoid losing access to your account, please update your password immediately.</p>
        <p><a href="https://micr0soft-365.com/password-reset" style="background: #0078d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Update Password Now</a></p>
        <p>If you do not update your password, your account will be locked and you will lose access to all Microsoft services.</p>
        <p>Microsoft 365 Support Team</p>
      </div>
    `,
    receivedAt: '2026-03-07T13:15:00Z',
    isPhishing: true,
    indicators: [
      { type: 'spoofed_sender', description: 'Sender domain "micr0soft-365.com" uses zero instead of "o" — not official Microsoft domain', location: 'From address' },
      { type: 'suspicious_url', description: 'Link points to micr0soft-365.com, not microsoft.com', location: 'Update Password button' },
      { type: 'urgency', description: 'Creates false urgency with "24 hours" deadline', location: 'Subject and body' },
      { type: 'generic_greeting', description: 'Uses "Dear User" instead of actual name', location: 'Greeting' },
    ],
    difficulty: 'easy',
  },
  {
    id: '1a2b3c4d-0003-4000-8000-000000000003',
    from: { name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
    to: { name: 'John Smith', email: 'john.smith@company.com' },
    subject: 'Q1 Marketing Report - Review needed',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <p>Hi John,</p>
        <p>I've finished the Q1 marketing report. Could you review the conversion metrics section before our Thursday meeting?</p>
        <p>The highlights:</p>
        <ul>
          <li>Website traffic up 23% YoY</li>
          <li>Email campaign CTR improved to 4.2%</li>
          <li>Social media engagement doubled</li>
        </ul>
        <p>I've shared it in the team Google Drive folder. Let me know if you have questions.</p>
        <p>Thanks,<br/>Sarah</p>
      </div>
    `,
    receivedAt: '2026-03-07T11:45:00Z',
    isPhishing: false,
    indicators: [],
    difficulty: 'easy',
  },
  {
    id: '1a2b3c4d-0004-4000-8000-000000000004',
    from: { name: 'DHL Express', email: 'tracking@dhl-shipment-notification.com' },
    to: { name: 'John Smith', email: 'john.smith@company.com' },
    subject: 'Your package delivery has been delayed - Action required',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <p>Dear Customer,</p>
        <p>We were unable to deliver your package (Tracking #: DHL-8374921). A delivery fee of $2.99 is required to reschedule.</p>
        <p>Tracking Number: DHL-8374921<br/>Status: Delivery Failed<br/>Reason: Incomplete address</p>
        <p><a href="https://dhl-shipment-notification.com/pay" style="background: #fc0; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Pay & Reschedule Delivery</a></p>
        <p>If no action is taken within 48 hours, your package will be returned to sender.</p>
        <p>DHL Express Team</p>
      </div>
    `,
    receivedAt: '2026-03-07T10:22:00Z',
    isPhishing: true,
    indicators: [
      { type: 'brand_impersonation', description: 'Domain "dhl-shipment-notification.com" is not the official DHL domain (dhl.com)', location: 'From address' },
      { type: 'suspicious_url', description: 'Payment link goes to unofficial domain', location: 'Pay & Reschedule button' },
      { type: 'urgency', description: '48-hour deadline to pressure quick action', location: 'Body text' },
      { type: 'request_for_credentials', description: 'Asks for payment on suspicious domain', location: 'CTA button' },
    ],
    difficulty: 'medium',
  },
  {
    id: '1a2b3c4d-0005-4000-8000-000000000005',
    from: { name: 'Slack', email: 'notifications@slack.com' },
    to: { name: 'John Smith', email: 'john.smith@company.com' },
    subject: 'New message from #engineering channel',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <p>You have a new message in <strong>#engineering</strong></p>
        <p><strong>Mike Chen</strong> (10:05 AM):</p>
        <p style="background: #f8f8f8; padding: 12px; border-radius: 4px;">"Hey team, the CI pipeline fix is deployed. All green now. Thanks for the patience!"</p>
        <p><a href="https://company-workspace.slack.com/archives/C02ENGINEERING">View in Slack</a></p>
        <p style="color: #888; font-size: 12px;">You're receiving this email because you have notifications enabled for #engineering.</p>
      </div>
    `,
    receivedAt: '2026-03-07T10:05:00Z',
    isPhishing: false,
    indicators: [],
    difficulty: 'easy',
  },
  {
    id: '1a2b3c4d-0006-4000-8000-000000000006',
    from: { name: 'David Miller - CEO', email: 'david.miller.ceo@gmail.com' },
    replyTo: { name: 'David Miller', email: 'david.miller.private@gmail.com' },
    to: { name: 'John Smith', email: 'john.smith@company.com' },
    subject: 'Quick favor - confidential',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <p>Hi John,</p>
        <p>I'm in a meeting right now and can't make a call. I need you to purchase some gift cards for our client appreciation event. Can you buy 5x $200 Amazon gift cards and send me the codes?</p>
        <p>I'll reimburse you right after. This is time-sensitive so please handle it ASAP.</p>
        <p>Thanks,<br/>David Miller<br/>CEO</p>
        <p style="color: #888; font-size: 11px;">Sent from my iPhone</p>
      </div>
    `,
    receivedAt: '2026-03-07T09:30:00Z',
    isPhishing: true,
    indicators: [
      { type: 'spoofed_sender', description: 'CEO is using a personal Gmail address instead of company email', location: 'From address' },
      { type: 'mismatched_reply_to', description: 'Reply-To is a different Gmail address than the From address', location: 'Email headers' },
      { type: 'urgency', description: 'Pressures immediate action — "ASAP", "time-sensitive"', location: 'Body text' },
      { type: 'request_for_credentials', description: 'Requests gift card codes — classic BEC scam pattern', location: 'Body text' },
    ],
    difficulty: 'medium',
  },
];
