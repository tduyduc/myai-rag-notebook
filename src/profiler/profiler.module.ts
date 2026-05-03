import { Module } from '@nestjs/common';
import { Profiler } from './profiler.injection-token.js';
import { ProfilerService } from './profiler.service.js';

@Module({
  providers: [
    {
      provide: Profiler,
      useClass: ProfilerService,
    },
  ],
  exports: [Profiler],
})
export class ProfilerModule {}
