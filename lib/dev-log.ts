/** Logs only in development; no-op in production bundles. */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
}

export function devWarn(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(...args);
  }
}
