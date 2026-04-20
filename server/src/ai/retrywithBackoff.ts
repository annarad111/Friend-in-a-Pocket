type RetryOptions = {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status;
  }

  return undefined;
}

function isRetryableError(error: unknown) {
  const status = getErrorStatus(error);
  return status === 429 || status === 500 || status === 503;
}

function computeDelay(attempt: number, initialDelayMs: number, maxDelayMs: number) {
  const exponentialDelay = Math.min(initialDelayMs * 2 ** attempt, maxDelayMs);

  const jitter = Math.floor(Math.random() * exponentialDelay * 0.3);

  return exponentialDelay + jitter;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 4,
    initialDelayMs = 800,
    maxDelayMs = 8000,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxAttempts - 1) {
        throw error;
      }

      const delay = computeDelay(attempt, initialDelayMs, maxDelayMs);

      console.warn(
        `Gemini retry attempt ${attempt + 1}/${maxAttempts - 1} after ${delay}ms`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}