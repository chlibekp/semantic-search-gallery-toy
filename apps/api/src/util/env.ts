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

  S3_ACCOUNT_ID: process.env.S3_ACCOUNT_ID || "",
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || "",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
  S3_URL: process.env.S3_URL || "",
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL || "",

  REDIS_USER: process.env.REDIS_USER || "app",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
  REDIS_HOST: process.env.REDIS_HOST || "redis",
};
