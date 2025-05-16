import { Scheduler } from "app/scheduler";
import { BASE_PERIOD_MS, MAX_RATE_MS, MIN_RATE_MS } from "./constants";
import { DynamicSchedulerError } from "./errors";
import { AsyncTask } from "./types";

export class BatchingScheduler implements Scheduler {
    private rate: number;
    private timerId: ReturnType<typeof setInterval> | null = null;
    private readonly task: AsyncTask;
    private lastTick = Date.now();

    constructor(task: AsyncTask, initialRate: number = 1) {
        this.checkRate(initialRate);

        this.task = task;
        this.rate = initialRate;
    }

    public setRate(newRate: number): void {
        this.checkRate(newRate);

        if (this.rate !== newRate) {
            this.rate = newRate;

            this.timerId.close();
            this.loop();
        }
    }

    public stop(): void {
        if (this.timerId !== null) {
            console.log("Stopping scheduler");

            this.timerId.close();
            this.timerId = null;
        }
    }

    public start(): void {
        if (this.timerId === null) {
            console.log(`Starting scheduler with ${this.rate} tasks/sec`);
            this.loop();
        }
    }

    private checkRate(value: number): void {
        if (value < MIN_RATE_MS || value > MAX_RATE_MS) {
            throw DynamicSchedulerError.byRate(value);
        }
    }

    private loop(): void {
        const now = Date.now();
        const elapsed = now - this.lastTick;
        const expectedInterval = BASE_PERIOD_MS / this.rate;
        const taskCount = Math.floor(elapsed / expectedInterval);

        for (let i = 0; i < taskCount; i++) {
            this.task().catch((e) => console.error(e));
        }

        if (taskCount > 0) {
            this.lastTick += taskCount * expectedInterval;
        }

        const nextDelay = Math.max(0, expectedInterval - (Date.now() - this.lastTick));
        this.timerId = setTimeout(this.loop, nextDelay);
    };
}
