import logger from "./winston";
import app from "../app";

/**
 * Function that handles graceful shutdown of the app.
 */
export default function shutdown() {
    logger.info("Shutting down app...");

    // close the http server
    app.close();

    process.exit(0);
}