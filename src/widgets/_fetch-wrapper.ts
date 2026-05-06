import type { ZodType } from "zod";

const DEFAULT_TIMEOUT_MS = 7000;
const DEFAULT_RETRIES = 1;

export type FetchOptions<T> = {
  url: string;
  schema: ZodType<T>;
  init?: RequestInit;
  abort: AbortSignal;
  timeoutMs?: number;
  retries?: number;
};

export class WidgetFetchError extends Error {
  constructor(
    message: string,
    readonly kind: "timeout" | "http" | "network" | "schema" | "aborted",
    readonly status?: number,
  ) {
    super(message);
    this.name = "WidgetFetchError";
  }
}

export async function fetchWidget<T>(opts: FetchOptions<T>): Promise<T> {
  const retries = opts.retries ?? DEFAULT_RETRIES;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await runOnce(opts);
    } catch (err) {
      lastError = err;
      if (err instanceof WidgetFetchError) {
        if (err.kind === "aborted" || err.kind === "schema") throw err;
        if (err.kind === "http" && err.status && err.status < 500 && err.status !== 429) throw err;
      }
      if (attempt < retries) await sleep(250 * Math.pow(2, attempt));
    }
  }
  throw lastError;
}

async function runOnce<T>(opts: FetchOptions<T>): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort(opts.abort.reason);
  if (opts.abort.aborted) ctrl.abort(opts.abort.reason);
  else opts.abort.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => ctrl.abort(new Error("timeout")), timeoutMs);

  try {
    const res = await fetch(opts.url, { ...opts.init, signal: ctrl.signal });
    if (!res.ok) {
      throw new WidgetFetchError(`HTTP ${res.status}`, "http", res.status);
    }
    const json = (await res.json()) as unknown;
    const parsed = opts.schema.safeParse(json);
    if (!parsed.success) {
      throw new WidgetFetchError(
        `Schema drift: ${parsed.error.issues.map((i) => i.path.join(".") + ":" + i.message).join("; ")}`,
        "schema",
      );
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof WidgetFetchError) throw err;
    if (opts.abort.aborted) throw new WidgetFetchError("aborted", "aborted");
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new WidgetFetchError("timeout", "timeout");
    }
    if (err instanceof Error && err.message === "timeout") {
      throw new WidgetFetchError("timeout", "timeout");
    }
    throw new WidgetFetchError(
      err instanceof Error ? err.message : "network error",
      "network",
    );
  } finally {
    clearTimeout(timer);
    opts.abort.removeEventListener("abort", onAbort);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
