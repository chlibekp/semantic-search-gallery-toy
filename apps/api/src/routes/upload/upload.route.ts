import { Router } from "express";
import uploadController from "../../controllers/v1/upload/upload.controller";
import uploadFileMiddleware from "../../midlewares/uploadFile.middleware";

const router = Router();

// add middleware that handles file uploads from "images" field
router.post("/", uploadFileMiddleware.array("images"), uploadController);

export default router;