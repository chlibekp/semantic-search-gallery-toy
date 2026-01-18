import { redisApi } from "@/src/infra/redis";
import ImageService from "@/src/services/v1/image.service";
import { Request, Response } from "express";

async function imagesController(_: Request, res: Response) {
    // If the images are cached, return them
    const cachedImages = await redisApi.get("images");
    if(cachedImages) {
        res.setHeader("X-Cache-Status", "HIT");
        return res.status(200).json(JSON.parse(cachedImages));
    }
    // Get all images
    const imageService = new ImageService();
    const images = await imageService.getAllImages();

    // Cache the images
    await redisApi.set("images", JSON.stringify(images));

    res.setHeader("X-Cache-Status", "MISS");
    return res.status(200).json(images);
}

export default imagesController;