import type { Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { eventEmitter } from "@/lib/event-emitter";
import logger from "@/lib/logger";

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

export const initWebSocketServer = (httpServer: HttpServer): WebSocketServer => {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    const extWs = ws as ExtendedWebSocket;
    extWs.isAlive = true;

    const clientIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    logger.info(`WebSocket client connected from ${clientIp}. Total: ${wss.clients.size}`);

    // Send connection acknowledgement
    extWs.send(
      JSON.stringify({
        type: "CONNECTED",
        message: "Real-time event stream connected",
        timestamp: new Date().toISOString(),
      }),
    );

    extWs.on("pong", () => {
      extWs.isAlive = true;
    });

    extWs.on("close", () => {
      logger.info(
        `WebSocket client disconnected. Remaining: ${wss.clients.size}`,
      );
    });

    extWs.on("error", (error) => {
      logger.error("WebSocket client error", { error });
    });
  });

  // Broadcast newly created events to all active clients
  const onEventCreated = (event: unknown) => {
    const payload = JSON.stringify({
      type: "EVENT_CREATED",
      data: event,
    });

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  eventEmitter.on("event:created", onEventCreated);

  // Heartbeat ping every 30 seconds to clean up dead connections
  const interval = setInterval(() => {
    for (const client of wss.clients) {
      const extWs = client as ExtendedWebSocket;
      if (!extWs.isAlive) {
        extWs.terminate();
        continue;
      }
      extWs.isAlive = false;
      extWs.ping();
    }
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
    eventEmitter.off("event:created", onEventCreated);
  });

  return wss;
};
