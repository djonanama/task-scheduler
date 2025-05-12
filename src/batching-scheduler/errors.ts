import { MIN_RATE_MS, MAX_RATE_MS } from "./constants";

export class DynamicSchedulerError extends Error {
    public static byRate(value: number): DynamicSchedulerError {
        return new DynamicSchedulerError(`Rate must be between ${MIN_RATE_MS} and ${MAX_RATE_MS} tasks/sec but not is ${value}`);
    }
}
