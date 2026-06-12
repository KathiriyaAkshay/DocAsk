import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './configuration';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  get port(): number {
    return this.config.get('port', { infer: true });
  }

  get corsOrigin(): string {
    return this.config.get('corsOrigin', { infer: true });
  }

  get llmProvider(): AppConfig['llmProvider'] {
    return this.config.get('llmProvider', { infer: true });
  }

  get openai() {
    return this.config.get('openai', { infer: true });
  }

  get anthropic() {
    return this.config.get('anthropic', { infer: true });
  }

  get chroma() {
    return this.config.get('chroma', { infer: true });
  }

  get rag() {
    return this.config.get('rag', { infer: true });
  }

  get sampleDataPath(): string {
    return this.config.get('sampleDataPath', { infer: true });
  }
}
