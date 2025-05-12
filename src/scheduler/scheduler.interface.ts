export interface Scheduler {
    setRate(newRate: number): void;
    start(): void;
    stop(): void;
}
