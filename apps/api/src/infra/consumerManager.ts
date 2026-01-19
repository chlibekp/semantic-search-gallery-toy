import { ProcessImagesJob } from "@/src/interfaces/jobs";
import IORedis from "ioredis";
import winston from "winston";
import { processedEmbeddings } from "./consumers/processedEmbeddings";

class ConsumerManager {
  private redis: IORedis;
  private logger: winston.Logger;

  public running: boolean;
  constructor(redis: IORedis, logger: winston.Logger) {
    this.redis = redis;
    this.logger = logger;

    this.running = true;
  }

  async destroy() {
    // Stop getting jobs from the queue
    this.running = false;
  }

  async start() {
    while (this.running) {
      try {
        // Process the image from queue
        await this.processImageJob();
      } catch (err) {
        this.logger.error("Error processing image job", err);
      }
    }
  }

  async processImageJob() {
    // Get the processed image
    const processedImageString = await this.redis.blpop(
      "process-images:processed",
      5,
    );

    // If we fail to get the processed image, return;
    if (!processedImageString) {
      return;
    }

    // Parse the processed image string to JSON
    const processedImage = JSON.parse(
      processedImageString[1],
    ) as ProcessImagesJob;

    // Process the image
    await processedEmbeddings(processedImage);
  }
}

export default ConsumerManager;
