import { Router } from "express";

import uploadRoute from "./upload/upload.route";
import imagesRoute from "./images/images.route";



const router = Router();

router.use("/upload", uploadRoute);
router.use("/images", imagesRoute);

export default router;