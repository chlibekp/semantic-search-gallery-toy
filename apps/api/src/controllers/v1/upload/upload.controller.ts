import ImageService from "@/src/services/v1/image.service";
import { Request, Response } from "express";

async function uploadController(req: Request, res: Response) {
    const files = req.files;
    if(files?.length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const imageService = new ImageService();

    const uploadedFiles = await imageService.upload(Array.isArray(files) ? files : files ? Object.values(files).flat() : []);

    return res.status(200).json(uploadedFiles);
}

export default uploadController;