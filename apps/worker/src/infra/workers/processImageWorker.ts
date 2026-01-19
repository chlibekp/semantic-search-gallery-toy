import sharp from "sharp";
import VisionModel from "../../ai/visionModel";
import { ProcessImagesJob } from "../../interfaces/jobs";
import logger from "../../util/winston";
import { RawImage } from "@xenova/transformers";
import { tryCatch } from "@/src/util/trycatch";
import redis from "../redis";

/**
 * Send a GET request to the url and try to fetch the image as buffer
 * @param url - The URL of the image.
 * @returns Image buffer
 */
async function getBufferFromUrl(url: string): Promise<Buffer> {
  // Get the image from s3
  const { data: result, error } = await tryCatch(
    fetch(url).then((res) => {
      if (res.status !== 200) {
        throw new Error(
          "non 200 status code received while attempting to fetch the image",
        );
      }
      return res.arrayBuffer();
    }),
  );

  // If we fail to fetch the image, throw an error
  if (error) {
    throw error;
  }

  // Convert from ArrayBuffer to Buffer
  return Buffer.from(result);
}

async function getRawImage(image: Buffer): Promise<RawImage> {
  // Remove alpha and get back raw buffer
  const { data: result, error } = await tryCatch(
    sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  );

  // If we fail to modify the image, throw an error
  if (error) {
    throw error;
  }

  const { data, info } = result;

  // Create a new raw image instance for transfomers library
  const rawImage = new RawImage(data, info.width, info.height, info.channels);

  return rawImage;
}

async function processImage(job: ProcessImagesJob, visionModel: VisionModel) {
  logger.info("Starting to process image", { job: job.id });

  // Get the image bufffer
  const imageBuffer = await getBufferFromUrl(job.imageUrl);

  // Get the raw image for transformers lib
  const rawImage = await getRawImage(imageBuffer);

  // Get vector from the rawImage
  const vector = await visionModel.getVectors(rawImage);

  // send the image to processed queue
  await redis.lpush(
    "process-images:processed",
    JSON.stringify({
      id: job.id,
      aiEmbedding: vector,
    }),
  );

  logger.info("Finished processing image", { job: job.id });
}

export default processImage;
