import { Module } from '@nestjs/common';
import { ProfilerModule } from '../profiler/profiler.module.js';
import { OllamaClient } from './ollama-client.injection-token.js';
import { OllamaClientService } from './ollama-client.service.js';

@Module({
  imports: [ProfilerModule],
  providers: [
    {
      provide: OllamaClient,
      useClass: OllamaClientService,
    },
  ],
  exports: [OllamaClient],
})
export class OllamaClientModule {}
