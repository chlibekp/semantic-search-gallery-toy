import winston from "winston";
import env from "./env";

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.json() }),
  ],
});

export default logger;
