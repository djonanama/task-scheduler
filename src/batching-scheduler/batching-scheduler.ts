import { Scheduler } from "app/scheduler";
import { BASE_PERIOD_MS, MAX_RATE_MS, MIN_RATE_MS } from "./constants";
import { DynamicSchedulerError } from "./errors";
import { AsyncTask } from "./types";

export class BatchingScheduler implements Scheduler {
    private rate: number;
    private timerId: ReturnType<typeof setInterval> | null = null;
    private readonly task: AsyncTask;
    private readonly minInterval = 4; // минимальная разумная задержка таймера, мс

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
            this.resetTimer();
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
            this.resetTimer();
        }
    }

    private checkRate(value: number): void {
        if (value < MIN_RATE_MS || value > MAX_RATE_MS) {
            throw DynamicSchedulerError.byRate(value);
        }
    }

    private resetTimer(): void {
        const period = BASE_PERIOD_MS / this.rate;  // мс между одиночными запусками

        // Базовый сценарий: Если период больше минимальной разрешённой таймером задержки (≈4 мс), запускаем задачи по одной через setInterval(period).
        let interval = Math.floor(period);
        let batchSize = 1;

        // Если период меньше, группируем несколько запусков в «пакет» и ставим setInterval(minInterval)
        if (period < this.minInterval) {
            interval = this.minInterval;
            batchSize = Math.max(1, Math.floor(interval / period));
        }

        this.timerId = setInterval(() => {
            for (let i = 0; i < batchSize; i++) {
                this.task().catch((error) => console.error(error));
            }
        }, interval);
    }
}
