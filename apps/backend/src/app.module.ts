import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { AgentModule } from './modules/agent/agent.module';
import { InboxModule } from './modules/inbox/inbox.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AgentModule,
    InboxModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
