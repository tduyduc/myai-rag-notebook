import { Module } from '@nestjs/common';
import { OllamaClientModule } from '../ollama-client/ollama-client.module.js';
import { ProfilerModule } from '../profiler/profiler.module.js';
import { VectorDatabase } from './vector-database.injection-token.js';
import { VectorDatabaseService } from './vector-database.service.js';

@Module({
  imports: [ProfilerModule, OllamaClientModule],
  providers: [
    {
      provide: VectorDatabase,
      useClass: VectorDatabaseService,
    },
  ],
  exports: [VectorDatabase],
})
export class VectorDatabaseModule {}
