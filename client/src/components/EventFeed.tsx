import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Sparkles,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EventItem, EventsResponse } from "@/types/event";

interface EventFeedProps {
  eventsData?: EventsResponse;
  isLoading?: boolean;
  page: number;
  limit: number;
  eventType: string;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEventTypeChange: (newType: string) => void;
  onSelectEvent: (event: EventItem) => void;
  latestEventId?: string;
}

export const EventFeed = ({
  eventsData,
  isLoading = false,
  page,
  limit,
  eventType,
  onPageChange,
  onLimitChange,
  onEventTypeChange,
  onSelectEvent,
  latestEventId,
}: EventFeedProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const events = eventsData?.data ?? [];
  const pagination = eventsData?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Instant client-side search across user_id, event_type, and payload text
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();

    return events.filter((ev) => {
      const matchUserId = ev.user_id.toLowerCase().includes(query);
      const matchType = ev.event_type.toLowerCase().includes(query);
      const matchId = ev.id.toLowerCase().includes(query);
      const payloadStr =
        typeof ev.payload === "string"
          ? ev.payload.toLowerCase()
          : JSON.stringify(ev.payload).toLowerCase();
      const matchPayload = payloadStr.includes(query);

      return matchUserId || matchType || matchId || matchPayload;
    });
  }, [events, searchQuery]);

  return (
    <Card className="shadow-xs">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Live Activity Feed
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                {pagination.total} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time ingestion stream and event history
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search payload, user, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>

            {/* Filter by Event Type */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Filter by type..."
                value={eventType === "ALL" ? "" : eventType}
                onChange={(e) =>
                  onEventTypeChange(e.target.value.trim() || "ALL")
                }
                className="h-8 text-xs font-mono w-36"
              />
            </div>

            {/* Limit Selector */}
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              No events found
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchQuery || eventType !== "ALL"
                ? "Try adjusting your filters or search query."
                : "No activity events have been recorded yet. Click 'Ingest Event' to send a sample."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                <TableRow>
                  <TableHead className="w-[140px]">Event Type</TableHead>
                  <TableHead className="w-[140px]">User / Actor</TableHead>
                  <TableHead>Payload Preview</TableHead>
                  <TableHead className="w-[170px]">Timestamp</TableHead>
                  <TableHead className="w-[80px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const isRecent = event.id === latestEventId;
                  const payloadPreview =
                    typeof event.payload === "string"
                      ? event.payload
                      : JSON.stringify(event.payload);

                  const timeAgo = new Date(event.timestamp).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit", second: "2-digit" },
                  );

                  return (
                    <TableRow
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className={`cursor-pointer transition-colors hover:bg-muted/60 text-xs ${
                        isRecent
                          ? "bg-emerald-500/10 font-medium dark:bg-emerald-500/15"
                          : ""
                      }`}
                    >
                      {/* Event Type */}
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-1.5">
                          {isRecent && (
                            <Sparkles className="h-3 w-3 text-emerald-500 shrink-0" />
                          )}
                          <Badge variant="outline" className="font-mono text-[11px] py-0">
                            {event.event_type}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* User ID */}
                      <TableCell className="font-mono text-muted-foreground truncate max-w-[140px]">
                        {event.user_id}
                      </TableCell>

                      {/* Payload Preview */}
                      <TableCell className="font-mono text-muted-foreground truncate max-w-[320px]">
                        {payloadPreview}
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                          {timeAgo}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(event);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="sr-only">Inspect</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)} (
            {pagination.total} events)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!pagination.hasPrevPage || isLoading}
              className="h-7 px-2 text-xs gap-1"
            >
              <ChevronLeft className="h-3 w-3" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="h-7 px-2 text-xs gap-1"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
