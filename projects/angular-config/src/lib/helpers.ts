export function isPromise(x: unknown): boolean {
  return x != null && typeof (x as Promise<unknown>).then === 'function';
}
