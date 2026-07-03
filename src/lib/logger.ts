type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function formatLog(payload: LogPayload): string {
  const base = `[${payload.timestamp}] [${payload.level.toUpperCase()}]`;
  const ctx = payload.context ? ` [${payload.context}]` : "";
  const data = payload.data ? ` ${JSON.stringify(payload.data)}` : "";
  return `${base}${ctx} ${payload.message}${data}`;
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>) {
  const payload: LogPayload = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };
  const line = formatLog(payload);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("info", message, context, data),
  warn: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("warn", message, context, data),
  error: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("error", message, context, data),
  debug: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("debug", message, context, data),
};

export function logRequest(method: string, path: string, status: number, durationMs: number) {
  logger.info(`${method} ${path} → ${status}`, "http", { durationMs });
}
