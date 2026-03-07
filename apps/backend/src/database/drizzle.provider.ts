import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

export type DrizzleDB = PostgresJsDatabase<typeof schema>;

export const drizzleProvider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<DrizzleDB> => {
    const connectionString = configService.get<string>('database.url');

    if (!connectionString) {
      throw new Error('DATABASE_URL is required but not configured');
    }

    const client = postgres(connectionString, {
      max: 20,
      idle_timeout: 30,
      connect_timeout: 10,
    });

    const db = drizzle(client, { schema });

    console.log('Drizzle ORM connected to PostgreSQL');

    return db;
  },
};
