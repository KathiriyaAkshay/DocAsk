// Load .env for local runs; Docker injects env via compose — skip if dotenv unavailable
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv/config');
} catch {
  // optional in production images
}

import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { getLangfuseConfig, isLangfuseEnabled } from './observability/langfuse.config';

let spanProcessor: LangfuseSpanProcessor | null = null;

if (isLangfuseEnabled()) {
  const config = getLangfuseConfig();
  spanProcessor = new LangfuseSpanProcessor({
    publicKey: config.publicKey,
    secretKey: config.secretKey,
    baseUrl: config.baseUrl,
    environment: config.environment,
  });

  const sdk = new NodeSDK({
    spanProcessors: [spanProcessor],
  });

  sdk.start();
  console.log(`Langfuse tracing enabled → ${config.baseUrl} (${config.environment})`);
}

export { spanProcessor };
