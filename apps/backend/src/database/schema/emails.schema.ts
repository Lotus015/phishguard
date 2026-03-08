import { pgTable, uuid, varchar, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { sessions } from './sessions.schema';

export const emails = pgTable('emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  fromName: varchar('from_name', { length: 255 }).notNull(),
  fromEmail: varchar('from_email', { length: 255 }).notNull(),
  replyToName: varchar('reply_to_name', { length: 255 }),
  replyToEmail: varchar('reply_to_email', { length: 255 }),
  toName: varchar('to_name', { length: 255 }).notNull(),
  toEmail: varchar('to_email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  bodyHtml: text('body_html').notNull(),
  receivedAt: timestamp('received_at').notNull(),
  isPhishing: boolean('is_phishing').notNull(),
  indicators: jsonb('indicators').notNull().default([]),
  difficulty: varchar('difficulty', { length: 10 }).notNull(),
  userMarkedAsPhishing: boolean('user_marked_as_phishing'),
  phishingSiteUrl: varchar('phishing_site_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
