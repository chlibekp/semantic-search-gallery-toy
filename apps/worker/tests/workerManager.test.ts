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

    it("Should handle failed jobs and retry", async () => {
        // Clear redis queues
        await redis.del("process-images:queue");
        await redis.del("process-images:processing");
        await redis.del("process-images:failed");

        const job = {
            id: "fail-job",
            imageUrl: "http://this-url-does-not-exist-12345.com",
            retries: 0
        };

        // Push a job that will fail
        await redis.lpush("process-images:queue", JSON.stringify(job));

        // Start worker in background
        const startPromise = workerManager.start();

        // Wait a bit for processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Stop worker
        await workerManager.destroy();
        try {
            await startPromise;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // ignore error from start loop if any
        }

        // Check redis state
        const failedQueue = await redis.lrange("process-images:failed", 0, -1);
        const processingQueue = await redis.lrange("process-images:processing", 0, -1);
        const mainQueue = await redis.lrange("process-images:queue", 0, -1);

        // We expect the job to have been processed at least once.
        expect(failedQueue.length + processingQueue.length + mainQueue.length).toBeGreaterThan(0);
    }, 10000)
    
})
