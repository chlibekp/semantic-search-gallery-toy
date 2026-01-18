import IORedis from "ioredis";
import { tryCatch } from "../util/trycatch";
import processImage from "../workers/processImageWorker";
import winston from "winston";
import { ProcessImagesJob } from "../interfaces/jobs";
import TextModel from "../ai/textModel";
import VisionModel from "../ai/visionModel";

class WorkerManager {
  private redis: IORedis;
  private logger: winston.Logger;

  private textModel: TextModel;
  private visionModel: VisionModel;
  private modelsLoaded: boolean;

  public running: boolean;
  constructor(redis: IORedis, logger: winston.Logger) {
    this.redis = redis;
    this.logger = logger;

    this.textModel = new TextModel();
    this.visionModel = new VisionModel();

    this.running = true;
    this.modelsLoaded = false;
  }

  async destroy() {
    this.running = false;
  }

  private async loadModels() {
    await this.textModel.load();
    await this.visionModel.load();
    this.modelsLoaded = true;
    this.logger.info("Models loaded");
  }

  async start() {
    while (this.running) {
      if (!this.modelsLoaded) {
        this.logger.info("Loading models...");
        await this.loadModels();
      }
      try {
        await this.processImageJob();
      } catch (err) {
        this.logger.error("Error processing image job", err);
      }
    }
  }

  async processImageJob() {
    // Move the image to processing list
    const imageToProcessString = await this.redis.brpoplpush(
      "process-images:queue",
      "process-images:processing",
      5,
    );

    // If the image is null, don't process it
    if (!imageToProcessString) {
      return;
    }

    // try to parse the json string from redis
    let imageToProcess;
    try {
      imageToProcess = JSON.parse(imageToProcessString) as ProcessImagesJob;
    } catch (error) {
      this.logger.error("Error parsing image to process: ", error);
      return;
    }

    // If the images does not have retries, add them
    if (!imageToProcess.retries) {
      imageToProcess.retries = 0;
    }

    // Try to run the processImage function
    const result = await tryCatch(
      processImage(imageToProcess, {
        textModel: this.textModel,
        visionModel: this.visionModel,
      }),
    );

    if (result.error) {
      this.logger.error("Error processing image: ", result.error);

      // Increment the retries
      imageToProcess.retries++;

      // Remove the image from the processing list
      await this.redis.lrem(
        "process-images:processing",
        0,
        imageToProcessString,
      );

      // If the images fails to process after MAX_RETRIES retries, don't process it and move it to failed process-images:failed list
      if (imageToProcess.retries < parseInt(process.env.MAX_RETRIES || "3")) {
        await this.redis.lpush("process-images:failed", imageToProcessString);
        return;
      }

      // Add the image back to processing queue
      await this.redis.lpush("process-images:processing", imageToProcessString);

      this.logger.warn(
        "Image added back to processing queue: ",
        imageToProcess,
      );
    }
  }
}

export default WorkerManager;
