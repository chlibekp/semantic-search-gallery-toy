import IORedis from "ioredis"
import env from "../util/env"

// Create a new IORedis singleton
const redis = new IORedis({
  host: env.REDIS_HOST,
  port: 6379,
  password: env.REDIS_PASSWORD
});

export default redis;