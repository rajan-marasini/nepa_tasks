import http from "http";

import app from "@/app";
import { testConnection } from "@/db";
import logger from "@/lib/logger";
import { initWebSocketServer } from "@/websocket";

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// Initialize WebSocket server
initWebSocketServer(server);

const startServer = async () => {
  try {
    await testConnection();
    logger.info("Database connection established");

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`WebSocket server listening on ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    logger.error("Failed to connect to the database", { error });
    process.exit(1);
  }
};

const shutdown = () => {
  logger.warn("Server is shutting down");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
