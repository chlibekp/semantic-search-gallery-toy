import { Router } from "express";
import imagesController from "../../controllers/v1/images/images.controller";

const router = Router();

router.get("/", imagesController);

export default router;
