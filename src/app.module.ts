import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { OllamaClientModule } from './ollama-client/ollama-client.module.js';
import { ProfilerModule } from './profiler/profiler.module.js';
import { VectorDatabaseModule } from './vector-database/vector-database.module.js';

@Module({
  imports: [ProfilerModule, OllamaClientModule, VectorDatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
