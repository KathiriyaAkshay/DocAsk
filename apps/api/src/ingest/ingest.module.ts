import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [RagModule],
  providers: [IngestService],
  exports: [IngestService],
})
export class IngestModule {}
