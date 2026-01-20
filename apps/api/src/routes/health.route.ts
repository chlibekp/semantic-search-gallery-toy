import healthController from "@/src/controllers/health/health.controller";
import { Router } from "express";

const router = Router();

router.get("/health", healthController);

export default router;
