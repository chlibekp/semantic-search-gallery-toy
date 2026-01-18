import IORedis from "ioredis"
import env from "../util/env"

/**
  We need to have 2 redis instances, because blocking commands occupy the connection 
  and prevent other commands from being processed on the same redis instance

  This keeps API latency stable
 */

// Create a new redis instance for consumer
const redisConsumer = new IORedis({
  host: env.REDIS_HOST,
  port: 6379,
  password: env.REDIS_PASSWORD,
});

// Create a new redis instance for api
const redisApi = new IORedis({
  host: env.REDIS_HOST,
  port: 6379,
  password: env.REDIS_PASSWORD,
});

export {
  redisConsumer,
  redisApi,
}