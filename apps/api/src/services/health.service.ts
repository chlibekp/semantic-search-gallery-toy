import orm from "@/src/database/pg";
import { redisApi } from "@/src/infra/redis";

class HealthService {
    async getHealth() {
        const dbResult = await orm.checkConnection()
        const redisResult = await redisApi.ping(); 

        if (redisResult !== "PONG") {
            throw new Error("Redis connection failed");
        }

        if (dbResult.ok !== true) {
            throw new Error("Database connection failed");
        }

        return {
            redis: "ok",
            db: "ok"
        }
    }
}

export default HealthService;