import { Injectable } from '@nestjs/common';
import { Profiler } from './profiler.injection-token';

const noop = () => void 0;

@Injectable()
export class ProfilerService extends Profiler {
  private static readonly ALLOWED_LOGGING_VALUES: ReadonlySet<
    string | undefined
  > = new Set<string>(['true', '1']);

  public override time: (label: string) => void;
  public override timeEnd: (label: string) => void;

  constructor() {
    super();

    if (!ProfilerService.ALLOWED_LOGGING_VALUES.has(process.env['LOGGING'])) {
      this.time = this.timeEnd = noop;
      return;
    }

    this.time = console.time;
    this.timeEnd = console.timeEnd;
  }
}
