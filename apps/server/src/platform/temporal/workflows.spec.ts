import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import { pingWorkflow } from './workflows';

describe('pingWorkflow', () => {
  let env: TestWorkflowEnvironment;

  beforeAll(async () => {
    env = await TestWorkflowEnvironment.createTimeSkipping();
  });

  afterAll(async () => {
    await env.teardown();
  });

  it('runs the activity and returns its result', async () => {
    const worker = await Worker.create({
      connection: env.nativeConnection,
      taskQueue: 'test',
      workflowsPath: require.resolve('./workflows'),
      activities,
    });

    const result = await worker.runUntil(
      env.client.workflow.execute(pingWorkflow, {
        args: ['skeleton'],
        workflowId: 'ping-test',
        taskQueue: 'test',
      }),
    );

    expect(result).toBe('pong: skeleton');
  });
});
