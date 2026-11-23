import { NativeConnection, Worker } from '@temporalio/worker';
import { loadConfig } from './platform/config/config';
import * as activities from './platform/temporal/activities';

async function run(): Promise<void> {
  const config = loadConfig();
  const connection = await NativeConnection.connect({ address: config.temporalAddress });
  const worker = await Worker.create({
    connection,
    namespace: config.temporalNamespace,
    taskQueue: 'skeleton',
    workflowsPath: require.resolve('./platform/temporal/workflows'),
    activities,
  });
  // The Temporal runtime shuts the worker down gracefully on SIGINT/SIGTERM.
  await worker.run();
  await connection.close();
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
