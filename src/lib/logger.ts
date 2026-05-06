type Level = "debug" | "info" | "warn" | "error" | "fatal";

type LogContext = Record<string, unknown>;

function emit(level: Level, msg: string, ctx?: LogContext) {
  const payload = { ts: new Date().toISOString(), level, msg, ...ctx };
  const line = JSON.stringify(payload);
  if (level === "error" || level === "fatal") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit("error", msg, ctx),
  fatal: (msg: string, ctx?: LogContext) => emit("fatal", msg, ctx),
};
