/**
 * Prevents multiplayer poll/realtime merges from immediately overwriting a local action
 * (stale snapshot rollback). Pair with markLocalWriteLock on user-driven updates.
 */
export const DEFAULT_LOCAL_WRITE_LOCK_MS = 1500;

export function markLocalWriteLock(
  lockUntilRef: { current: number },
  ms: number = DEFAULT_LOCAL_WRITE_LOCK_MS
): void {
  lockUntilRef.current = Date.now() + ms;
}

export function shouldDeferRemoteSync(lockUntilRef: { current: number }): boolean {
  return Date.now() < lockUntilRef.current;
}
