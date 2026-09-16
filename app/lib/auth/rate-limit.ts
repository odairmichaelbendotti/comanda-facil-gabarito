// In-process brute-force guard, keyed by document. No external store: a plain
// Map is enough to stop a naive script hammering one CPF/CNPJ from a single
// server instance. It resets on deploy and is per-instance in a multi-instance
// deployment (e.g. several serverless functions), so it isn't a substitute for
// a shared store like Redis if the project ever needs one — but it costs zero
// setup and blocks the attack this project actually has to worry about today.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface AttemptRecord {
  count: number;
  windowStartedAt: number;
}

const attemptsByDocument = new Map<string, AttemptRecord>();

// Login handlers run per-request, so nothing else clears stale entries. Without
// this, every distinct document that ever attempted a login stays in the Map
// forever — a slow memory leak that only shows up after the process has been
// up for days. Sweeping opportunistically on each check keeps the map bounded
// without needing a background timer.
function sweepExpired(now: number) {
  for (const [key, record] of attemptsByDocument) {
    if (now - record.windowStartedAt >= WINDOW_MS) {
      attemptsByDocument.delete(key);
    }
  }
}

export function isRateLimited(documento: string): boolean {
  const record = attemptsByDocument.get(documento);
  if (!record) return false;
  if (Date.now() - record.windowStartedAt >= WINDOW_MS) return false;
  return record.count >= MAX_ATTEMPTS;
}

export function registerFailedAttempt(documento: string): void {
  const now = Date.now();
  sweepExpired(now);

  const record = attemptsByDocument.get(documento);
  if (!record || now - record.windowStartedAt >= WINDOW_MS) {
    attemptsByDocument.set(documento, { count: 1, windowStartedAt: now });
    return;
  }
  record.count += 1;
}

// A successful login means the real owner of the document showed up — keep
// punishing them for someone else's earlier bad guesses would be counterproductive.
export function clearAttempts(documento: string): void {
  attemptsByDocument.delete(documento);
}
