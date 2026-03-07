import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { AgentModule } from './modules/agent/agent.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ChatModule } from './modules/chat/chat.module';
import { ExerciseModule } from './modules/exercise/exercise.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AgentModule,
    InboxModule,
    AnalysisModule,
    ChatModule,
    ExerciseModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
