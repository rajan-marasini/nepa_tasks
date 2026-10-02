import http from "http";

import app from "@/app";
import logger from "@/lib/logger";

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const startServer = () => {
  try {
    server.listen(PORT, () => {
      logger.info(`Sever is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const shutdown = () => {
  console.log("Server is shutting down");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
