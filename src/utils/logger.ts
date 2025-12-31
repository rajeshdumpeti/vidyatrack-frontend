type LogLevel = "debug" | "info" | "warn" | "error";

function traceId(): string {
  // lightweight client correlation id (no external service)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function write(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
) {
  const payload = meta ? { ...meta } : undefined;
  // keep console output (pilot-friendly), but structured + leveled
  if (level === "error") console.error(message, payload);
  else if (level === "warn") console.warn(message, payload);
  else if (level === "info") console.info(message, payload);
  else console.debug(message, payload);
}

export const logger = {
  traceId,
  debug: (message: string, meta?: Record<string, unknown>) =>
    write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) =>
    write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    write("error", message, meta),
};
