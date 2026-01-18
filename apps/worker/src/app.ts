import redis from "./infra/redis"
import logger from "./util/winston";
import WorkerManager from "./infra/workerManager";

// Start the worker manager
const workerManager = new WorkerManager(redis, logger)

// Run jobs
workerManager.start();

function shutdown() {
    // Stop the worker manager from running more jobs
    workerManager.destroy();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);