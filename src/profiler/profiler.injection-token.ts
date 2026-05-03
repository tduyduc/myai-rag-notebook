export abstract class Profiler {
  abstract time(label: string): void;
  abstract timeEnd(label: string): void;
}
