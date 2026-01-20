import { describe, expect, it } from "vitest";
import S3Storage from "../../api/src/util/s3";
import fs from "fs";
import VisionModel from "@/src/ai/visionModel";
import processImage from "@/src/infra/workers/processImageWorker";
import { tryCatch } from "@/src/util/trycatch";
import redis from "../src/infra/redis";
import { ProcessImagesJob } from "@/src/interfaces/jobs";
import path from "path";

let url: string;

describe("S3Storage", () => {
  const s3 = new S3Storage();
  it("should upload an image to S3", async () => {
    // Load the test image
    const imageBuffer = fs.readFileSync(
      path.resolve(__dirname, "../../../static/cat.jpeg"),
    );

    // Upload the test image to s3
    const response = await s3.upload(imageBuffer, "cat-test.jpg", "image/jpeg");

    // Get the image and set it globally
    url = response.url;

    expect(url).not.toBeNull();
    expect(url).toContain("cat-test.jpg");
  });
});

describe("processImage", async () => {
  // Load the vision model for processing
  const visionModel = new VisionModel();
  await visionModel.load();

  it("Should return an error if the job does not exist", async () => {
    // Create a job with a non-existent imageUrl
    const job = {
      id: "123",
      imageUrl: "https://example.com/image.jpg",
      retries: 0,
    };

    // Attempt to process it
    const result = await tryCatch(processImage(job, visionModel));
    expect(result.error).toBeDefined();
  });

  it("Should push processed job to redis", async () => {
    await redis.del("process-images:queue");
    await redis.del("process-images:processing");

    // Create a fictional job with valid imageUrl
    const job = {
      id: "123",
      imageUrl: url,
      retries: 0,
    };

    // Process the job
    await processImage(job, visionModel);

    // Get the result from redis if any
    const redisResult = await redis.lpop("process-images:processed");
    expect(redisResult).toBeDefined();

    // Check if the id matches with the input id
    const processedJob = JSON.parse(redisResult || "{}") as ProcessImagesJob;
    expect(processedJob.id).toBe(job.id);
  });
});
