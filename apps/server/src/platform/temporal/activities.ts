/** Activities run outside the workflow sandbox and may do I/O. */
export function ping(name: string): Promise<string> {
  return Promise.resolve(`pong: ${name}`);
}
