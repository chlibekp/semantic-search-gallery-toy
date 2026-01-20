import HealthService from "@/src/services/health.service";
import { Request, Response } from "express";

async function healthController(req: Request, res: Response) {
  const healthService = new HealthService();
  const health = await healthService.getHealth();
  res.json(health);
}

export default healthController;
