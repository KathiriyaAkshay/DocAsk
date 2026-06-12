import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { ChatModule } from './chat/chat.module';
import { HealthController } from './health/health.controller';
import { IngestModule } from './ingest/ingest.module';
import { LangfuseModule } from './observability/langfuse.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [AppConfigModule, LangfuseModule, RagModule, IngestModule, ChatModule],
  controllers: [HealthController],
})
export class AppModule {}
