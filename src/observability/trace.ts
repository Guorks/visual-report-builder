import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type TraceEvent = {
  ts: string;
  step: string;
  duration_ms?: number;
  details?: Record<string, unknown>;
};

export class Trace {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  emit(step: string, details?: Record<string, unknown>, duration_ms?: number): void {
    const event: TraceEvent = {
      ts: new Date().toISOString(),
      step,
      ...(duration_ms !== undefined ? { duration_ms } : {}),
      ...(details ? { details } : {}),
    };
    appendFileSync(this.path, JSON.stringify(event) + "\n", "utf8");
  }

  async time<T>(step: string, fn: () => Promise<T>, details?: Record<string, unknown>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.emit(step, details, Date.now() - start);
      return result;
    } catch (e) {
      this.emit(`${step}:error`, { ...details, error: (e as Error).message }, Date.now() - start);
      throw e;
    }
  }
}
