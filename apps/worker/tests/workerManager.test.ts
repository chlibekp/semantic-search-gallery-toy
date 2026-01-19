import WorkerManager from "../src/infra/workerManager";
import redis from "../src/infra/redis"
import logger from "../src/util/winston"
import { describe, expect, it, afterAll } from "vitest";



const workerManager = new WorkerManager(redis, logger, 1); // Use 1s timeout for tests

describe("WorkerManager", () => {
    afterAll(async () => {
        await workerManager.destroy();
        redis.disconnect();
    });

    it("Should not be running when initialized", () => {
        expect(workerManager.running).toBe(false);
    })

    it("Should be running after start", async () => {
        const startPromise = workerManager.start();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(workerManager.running).toBe(true);

        await workerManager.destroy();
        
        await startPromise;
        
        expect(workerManager.running).toBe(false);
    })

    it("Should throw error when start is called multiple times", async () => {
        const startPromise = workerManager.start();
        
        await expect(workerManager.start()).rejects.toThrow("WorkerManager is already running");
        
        await workerManager.destroy();
        await startPromise;
    })
})
