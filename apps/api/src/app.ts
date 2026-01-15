import shutdown from "./util/shutdown";
import logger from "./util/winston";
import express from 'express';
import morgan from "morgan";

import v1Router from './routes/v1.route';
import env from "./util/env";

logger.info("Starting app...");

const app = express();

// Configure morgan to use winston for logging
const morganMiddleware = morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    {
        stream: {
            write: (msg) => logger.info(msg.trim())
        }
    }
)

// middleware for logging requests
app.use(morganMiddleware);

// middleware for parsing JSON bodies
app.use(express.json());

// serve static files
app.use(express.static("static"));

// API versioning, v1 -> /v1
app.use('/api/v1', v1Router);

const server = app.listen(env.PORT, (err) => {
    if(err) {
        logger.error("Failed to start app...", { error: err, port: env.PORT })
        process.exit(-1);
    }
    logger.info(`App started on port ${env.PORT}`);
})


// Listen for SIGINT and SIGTERM signals to trigger a graceful shutdown
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default server;