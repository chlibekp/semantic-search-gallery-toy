import { redisApi } from "@/src/infra/redis";
import ImageService from "@/src/services/v1/image.service";
import { Request, Response } from "express";
import { textModel } from "@/src/app";

async function imagesController(req: Request, res: Response) {
  // Make sure we get string
  const query = req.query.query ? req.query.query.toString() : undefined;

  const cacheKey = `images:${query}:${textModel.isLoaded}`;

  // If the images are cached, return them
  const cachedImages = await redisApi.get(cacheKey);
  if (cachedImages) {
    res.setHeader("X-Cache-Status", "HIT");
    return res.status(200).json(JSON.parse(cachedImages));
  }

  const imageService = new ImageService();
  const images = await imageService.getImages(query);

  // Cache the images
  await redisApi.set(cacheKey, JSON.stringify(images), "EX", 30);

  res.setHeader("X-Cache-Status", "MISS");
  return res.status(200).json(images);
}

export default imagesController;
