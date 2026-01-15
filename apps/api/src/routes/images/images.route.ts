import { Router } from "express";
import imagesController from "../../controllers/v1/images/images.controller";

const router = Router();

// add middleware that handles file uploads from "images" field
router.get("/", imagesController);

export default router;