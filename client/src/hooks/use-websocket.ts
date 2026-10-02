import { WS_BASE_URL } from "@/lib/api";
import type { EventItem } from "@/types/event";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export type WebSocketStatus = "connecting" | "connected" | "disconnected";

interface UseWebSocketOptions {
  onEventReceived?: (event: EventItem) => void;
  enabled?: boolean;
}

export const useWebSocket = ({
  onEventReceived,
  enabled = true,
}: UseWebSocketOptions = {}) => {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [lastEvent, setLastEvent] = useState<EventItem | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const onEventReceivedRef = useRef(onEventReceived);
  const queryClient = useQueryClient();

  useEffect(() => {
    onEventReceivedRef.current = onEventReceived;
  }, [onEventReceived]);

  useEffect(() => {
    (() => {
      if (!enabled) return;

      let isSubscribed = true;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      setStatus("connecting");
      const ws = new WebSocket(WS_BASE_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        if (isSubscribed) {
          setStatus("connected");
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "EVENT_CREATED" && message.data) {
            const newEvent: EventItem = message.data;
            if (isSubscribed) {
              setLastEvent(newEvent);
              onEventReceivedRef.current?.(newEvent);
            }
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
          }
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onclose = () => {
        if (isSubscribed) {
          setStatus("disconnected");
          timeoutId = setTimeout(() => {
            if (isSubscribed) {
              setRetryCount((prev) => prev + 1);
            }
          }, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      return () => {
        isSubscribed = false;
        if (timeoutId) clearTimeout(timeoutId);
        ws.close();
        socketRef.current = null;
      };
    })();
  }, [enabled, retryCount, queryClient]);

  const reconnect = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return {
    status,
    lastEvent,
    reconnect,
  };
};
