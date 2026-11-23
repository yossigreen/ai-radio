import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

// Workflow code must be deterministic: no Date.now(), Math.random() or I/O here.
// Anything non-deterministic belongs in an activity.
const { ping } = proxyActivities<typeof activities>({ startToCloseTimeout: '10 seconds' });

export async function pingWorkflow(name: string): Promise<string> {
  return await ping(name);
}
