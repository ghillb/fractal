import { mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

type LogRecord = {
  ts: string;
  level: "info" | "warn" | "error";
  event: string;
  data?: Record<string, unknown>;
};

export class JsonLogger {
  private readonly path: string;

  constructor(baseDir = ".fractal/logs", filename = "run.jsonl") {
    mkdirSync(baseDir, { recursive: true });
    this.path = join(baseDir, filename);
  }

  write(level: LogRecord["level"], event: string, data?: Record<string, unknown>): void {
    const record: LogRecord = {
      ts: new Date().toISOString(),
      level,
      event,
      data
    };
    appendFileSync(this.path, `${JSON.stringify(record)}\n`, "utf8");
  }

  info(event: string, data?: Record<string, unknown>): void {
    this.write("info", event, data);
  }

  warn(event: string, data?: Record<string, unknown>): void {
    this.write("warn", event, data);
  }

  error(event: string, data?: Record<string, unknown>): void {
    this.write("error", event, data);
  }
}
