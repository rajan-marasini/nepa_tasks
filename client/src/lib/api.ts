import type {
  AnalyticsResponse,
  CreateEventInput,
  EventsResponse,
} from "@/types/event";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const WS_BASE_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

export interface GetEventsParams {
  page?: number;
  limit?: number;
  event_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface GetAnalyticsParams {
  hours?: number;
  event_type?: string;
  date_from?: string;
  date_to?: string;
}

export const fetchEvents = async (
  params: GetEventsParams = {},
): Promise<EventsResponse> => {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.event_type && params.event_type !== "ALL") {
    query.append("event_type", params.event_type);
  }
  if (params.date_from) query.append("date_from", params.date_from);
  if (params.date_to) query.append("date_to", params.date_to);

  const res = await fetch(`${API_BASE_URL}/api/events?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch events: ${res.status}`);
  }
  return res.json();
};

export const fetchAnalytics = async (
  params: GetAnalyticsParams = {},
): Promise<AnalyticsResponse> => {
  const query = new URLSearchParams();

  if (params.hours) query.append("hours", params.hours.toString());
  if (params.event_type && params.event_type !== "ALL") {
    query.append("event_type", params.event_type);
  }
  if (params.date_from) query.append("date_from", params.date_from);
  if (params.date_to) query.append("date_to", params.date_to);

  const res = await fetch(
    `${API_BASE_URL}/api/events/analytics?${query.toString()}`,
  );
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch analytics: ${res.status}`,
    );
  }
  return res.json();
};

export const createEvent = async (
  input: CreateEventInput,
): Promise<{ success: boolean; message: string; data: unknown }> => {
  const payloadToSend = {
    id: input.id || crypto.randomUUID(),
    user_id: input.user_id,
    event_type: input.event_type,
    payload: input.payload,
    timestamp: input.timestamp || new Date().toISOString(),
  };

  const res = await fetch(`${API_BASE_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloadToSend),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to create event: ${res.status}`,
    );
  }
  return res.json();
};
