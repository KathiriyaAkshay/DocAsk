import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IngestService } from './ingest/ingest.service';

// Load repo-root .env when running via `pnpm seed` from apps/api
config({ path: resolve(__dirname, '../../.env') });
config({ path: resolve(__dirname, '../../../.env') });

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ingest = app.get(IngestService);

  console.log('Starting document ingestion…');
  const result = await ingest.ingestAll(true);
  console.log(
    `Done: ${result.documentsProcessed} documents, ${result.chunksIndexed} chunks → collection "${result.collection}"`,
  );

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
