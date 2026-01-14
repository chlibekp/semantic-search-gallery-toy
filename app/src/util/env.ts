import dotenv from "dotenv";
import fs from "fs";

// Load env only if .env exists
if (fs.existsSync(".env")) {
  dotenv.config();
}

// Export env variables with default values
export default {
  PORT: process.env.PORT || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  POSTGRES_USER: process.env.POSTGRES_USER || "gallery",
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "gallery",
  POSTGRES_DB: process.env.POSTGRES_DB || "gallery",
  POSTGRES_HOST: process.env.POSTGRES_HOST || "postgres",
};
