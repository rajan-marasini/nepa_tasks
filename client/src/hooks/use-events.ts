import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createEvent,
  fetchAnalytics,
  fetchEvents,
  type GetAnalyticsParams,
  type GetEventsParams,
} from "@/lib/api";
import type { CreateEventInput, EventItem, EventsResponse } from "@/types/event";

export const useEvents = (
  params: GetEventsParams = {},
  options?: { refetchInterval?: number | false },
) => {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => fetchEvents(params),
    refetchInterval: options?.refetchInterval ?? 5000,
  });
};

export const useAnalytics = (
  params: GetAnalyticsParams = {},
  options?: { refetchInterval?: number | false },
) => {
  return useQuery({
    queryKey: ["analytics", params],
    queryFn: () => fetchAnalytics(params),
    refetchInterval: options?.refetchInterval ?? 10000,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventInput) => createEvent(data),
    onSuccess: (res) => {
      const createdEvent = res?.data as EventItem | undefined;
      if (createdEvent) {
        queryClient.setQueriesData<EventsResponse>(
          { queryKey: ["events"] },
          (oldData) => {
            if (!oldData || !oldData.data) return oldData;
            if (oldData.data.some((item) => item.id === createdEvent.id)) {
              return oldData;
            }
            return {
              ...oldData,
              data: [createdEvent, ...oldData.data],
              pagination: {
                ...oldData.pagination,
                total: (oldData.pagination?.total || 0) + 1,
              },
            };
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};
