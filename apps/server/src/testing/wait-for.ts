import { setTimeout as sleep } from 'node:timers/promises';

/** Polls until the condition holds, so tests wait for events instead of sleeping a fixed time. */
export async function waitFor(condition: () => boolean, timeoutMs = 5_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('Condition not met in time');
    await sleep(25);
  }
}
