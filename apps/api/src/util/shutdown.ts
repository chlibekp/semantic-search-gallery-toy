import logger from "./winston";
import app from "../app";

/**
 * Function that handles graceful shutdown of the app.
 */
export default function shutdown() {
    logger.info("Shutting down app...");

    // close the http server
    app.server.close();

    // Stop the consumer manager from processing more jobs
    app.consumerManager.destroy();

    process.exit(0);
}