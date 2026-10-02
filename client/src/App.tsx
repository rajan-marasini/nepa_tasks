import { useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { AnalyticsCards } from "@/components/AnalyticsCards";
import { EventFeed } from "@/components/EventFeed";
import { EventDetailModal } from "@/components/EventDetailModal";
import { EventIngestModal } from "@/components/EventIngestModal";
import { useAnalytics, useEvents } from "@/hooks/use-events";
import { useWebSocket } from "@/hooks/use-websocket";
import type { EventItem } from "@/types/event";

export default function App() {
  // Feed filters & pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [analyticsHours, setAnalyticsHours] = useState(24);

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [latestEventId, setLatestEventId] = useState<string | undefined>(
    undefined,
  );

  // WebSocket for live event streaming
  const handleEventReceived = useCallback((event: EventItem) => {
    setLatestEventId(event.id);
    // Clear flash highlight after 4 seconds
    setTimeout(() => {
      setLatestEventId(undefined);
    }, 4000);
  }, []);

  const { status: wsStatus } = useWebSocket({
    onEventReceived: handleEventReceived,
  });

  // TanStack React Query for events list & analytics
  const eventsQuery = useEvents({
    page,
    limit,
    event_type: eventTypeFilter === "ALL" ? undefined : eventTypeFilter,
  });

  const analyticsQuery = useAnalytics({
    hours: analyticsHours,
    event_type: eventTypeFilter === "ALL" ? undefined : eventTypeFilter,
  });

  const handleManualRefresh = () => {
    eventsQuery.refetch();
    analyticsQuery.refetch();
  };

  const isRefreshing =
    eventsQuery.isFetching && !eventsQuery.isLoading;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-muted">
      {/* Top Navigation */}
      <Navbar
        wsStatus={wsStatus}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Aggregate Analytics Section */}
        <AnalyticsCards
          analytics={analyticsQuery.data?.data}
          isLoading={analyticsQuery.isLoading}
          selectedHours={analyticsHours}
          onSelectHours={(hours) => setAnalyticsHours(hours)}
        />

        {/* Live Activity Feed */}
        <EventFeed
          eventsData={eventsQuery.data}
          isLoading={eventsQuery.isLoading}
          page={page}
          limit={limit}
          eventType={eventTypeFilter}
          onPageChange={(newPage) => setPage(newPage)}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onEventTypeChange={(newType) => {
            setEventTypeFilter(newType);
            setPage(1);
          }}
          onSelectEvent={(event) => setSelectedEvent(event)}
          latestEventId={latestEventId}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Real-Time Event Dashboard &bull; Ingestion Pipeline</span>
          <span className="font-mono text-[11px]">
            API: {wsStatus === "connected" ? "ws://localhost:8000/ws" : "REST Polling Active"}
          </span>
        </div>
      </footer>

      {/* Ingest Event Simulator Modal */}
      <EventIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
      />

      {/* Event Detail Inspector Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
