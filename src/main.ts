import { BatchingScheduler } from "./batching-scheduler";
import { sleepMs } from "./utils/sleep";

async function runTask() {
    return new Promise<void>(resolve =>
        setTimeout(resolve, Math.random() * 300)
    );
}

(async function () {
    const tasksPerSecond = 3000 // 100 tasks/sec
    const scheduler = new BatchingScheduler(runTask, tasksPerSecond);

    scheduler.start();

    await sleepMs(1100);
    scheduler.setRate(500); // 500 tasks/sec

    await sleepMs(2500);
    scheduler.setRate(10); // 10 tasks/sec

    await sleepMs(1000);
    scheduler.stop();
})();
