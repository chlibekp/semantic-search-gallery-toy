import ImageService from "@/src/services/v1/image.service";
import { Request, Response } from "express";

async function imagesController(_: Request, res: Response) {
    const imageService = new ImageService();
    const images = await imageService.getAllImages();
    return res.status(200).json(images);
}

export default imagesController;