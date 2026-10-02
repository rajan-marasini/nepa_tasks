export interface EventItem {
  id: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown> | string | number | boolean | null;
  timestamp: string;
  created_at: string;
}

export interface EventsResponse {
  success: boolean;
  data: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    event_type: string | null;
    date_from: string | null;
    date_to: string | null;
  };
}

export interface EventTypeCount {
  event_type: string;
  count: number;
  percentage: number;
}

export interface EventAnalytics {
  timeframe: {
    from: string;
    to: string;
    hours: number | null;
  };
  total_events: number;
  unique_users: number;
  by_type: EventTypeCount[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: EventAnalytics;
  filters: {
    event_type: string | null;
    date_from: string | null;
    date_to: string | null;
    hours: number | null;
  };
}

export interface CreateEventInput {
  id?: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown> | string | number | boolean;
  timestamp?: string;
}
