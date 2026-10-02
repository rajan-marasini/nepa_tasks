import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Sparkles,
  Inbox,
  Filter,
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
  availableTypes?: string[];
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEventTypeChange: (newType: string) => void;
  onSelectEvent: (event: EventItem) => void;
  latestEventId?: string;
}

const DEFAULT_EVENT_TYPES = [
  { value: "ALL", label: "All Event Types" },
  { value: "page_view", label: "Page View (page_view)" },
  { value: "user_signup", label: "User Signup (user_signup)" },
  { value: "checkout_completed", label: "Checkout Completed (checkout_completed)" },
  { value: "button_clicked", label: "Button Clicked (button_clicked)" },
  { value: "error_occurred", label: "API Error (error_occurred)" },
];

export const EventFeed = ({
  eventsData,
  isLoading = false,
  page,
  limit,
  eventType,
  availableTypes = [],
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

  // Merge default types with any discovered from the backend
  const allTypeOptions = useMemo(() => {
    const knownValues = new Set(DEFAULT_EVENT_TYPES.map((t) => t.value));
    const combined = [...DEFAULT_EVENT_TYPES];

    availableTypes.forEach((type) => {
      if (type && !knownValues.has(type)) {
        combined.push({
          value: type,
          label: `${type} (custom)`,
        });
        knownValues.add(type);
      }
    });

    return combined;
  }, [availableTypes]);

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

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "user_signup":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "checkout_completed":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "page_view":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "button_clicked":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "error_occurred":
      case "api_error_log":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  return (
    <Card className="shadow-xs overflow-hidden">
      <CardHeader className="border-b border-border pb-4 bg-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">
                Live Activity Feed
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                {pagination.total} {pagination.total === 1 ? "event" : "events"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live ingest stream. Click any event row to inspect full JSON payload.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search user, payload, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>

            {/* Filter by Event Type Dropdown */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={eventType}
                  onChange={(e) => onEventTypeChange(e.target.value)}
                  aria-label="Filter by event type"
                  className="h-8 rounded-lg border border-border bg-background px-2.5 pr-7 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {allTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Filter className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Limit Selector */}
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/50 transition-colors"
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
                ? "Try changing your search query or selecting a different event type filter."
                : "No activity events have been recorded yet. Click your avatar to ingest a test event."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                <TableRow>
                  <TableHead className="w-[160px]">Event Type</TableHead>
                  <TableHead className="w-[150px]">Actor / User</TableHead>
                  <TableHead>Payload Preview</TableHead>
                  <TableHead className="w-[170px]">Timestamp</TableHead>
                  <TableHead className="w-[80px] text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const isRecent = event.id === latestEventId;
                  const payloadPreview =
                    typeof event.payload === "string"
                      ? event.payload
                      : JSON.stringify(event.payload);

                  const dateObj = new Date(event.timestamp);
                  const timeFormatted = dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const dateFormatted = dateObj.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });

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
                            <Sparkles className="h-3 w-3 text-emerald-500 shrink-0 animate-bounce" />
                          )}
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono font-medium ${getBadgeVariant(
                              event.event_type,
                            )}`}
                          >
                            {event.event_type}
                          </span>
                        </div>
                      </TableCell>

                      {/* User ID */}
                      <TableCell className="font-mono text-muted-foreground truncate max-w-[150px]">
                        <span className="font-semibold text-foreground">
                          {event.user_id.length > 14
                            ? `${event.user_id.slice(0, 12)}…`
                            : event.user_id}
                        </span>
                      </TableCell>

                      {/* Payload Preview */}
                      <TableCell className="font-mono text-muted-foreground truncate max-w-[340px]">
                        {payloadPreview}
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1.5" title={event.timestamp}>
                          <Clock className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                          <span>
                            {dateFormatted}, {timeFormatted}
                          </span>
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(event);
                          }}
                          title="Inspect Event Payload"
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
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
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs bg-card">
          <span className="text-muted-foreground">
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)} (
            {pagination.total} total)
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
