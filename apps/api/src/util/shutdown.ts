import { consumerManager, server } from "../app";
import logger from "./winston";

/**
 * Function that handles graceful shutdown of the app.
 */
export default function shutdown() {
  logger.info("Shutting down app...");

  // close the http server
  server.close();

  // Stop the consumer manager from processing more jobs
  consumerManager.destroy();

  process.exit(0);
}
