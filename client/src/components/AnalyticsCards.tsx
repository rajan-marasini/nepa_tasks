import { Activity, Users, Layers, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventAnalytics } from "@/types/event";

interface AnalyticsCardsProps {
  analytics?: EventAnalytics;
  isLoading?: boolean;
  selectedHours: number;
  onSelectHours: (hours: number) => void;
}

export const AnalyticsCards = ({
  analytics,
  isLoading = false,
  selectedHours,
  onSelectHours,
}: AnalyticsCardsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const totalEvents = analytics?.total_events ?? 0;
  const uniqueUsers = analytics?.unique_users ?? 0;
  const byType = analytics?.by_type ?? [];
  const topType = byType[0];

  const timeOptions = [
    { label: "Last 1h", value: 1 },
    { label: "Last 6h", value: 6 },
    { label: "Last 24h", value: 24 },
    { label: "Last 7d", value: 168 },
  ];

  return (
    <section className="space-y-4">
      {/* Timeframe Selector & Section Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Aggregate Metrics
          </h2>
          <p className="text-xs text-muted-foreground">
            Overview of ingested activity logs over the selected window
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelectHours(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedHours === opt.value
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Ingested Events
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {totalEvents.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Recorded in past {selectedHours}h
            </p>
          </CardContent>
        </Card>

        {/* Unique Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Unique Actors / Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {uniqueUsers.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Distinct user IDs tracked
            </p>
          </CardContent>
        </Card>

        {/* Distinct Event Types */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Event Types
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {byType.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Unique event categories
            </p>
          </CardContent>
        </Card>

        {/* Top Event Type */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Leading Event Type
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold tracking-tight text-foreground truncate">
              {topType ? topType.event_type : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {topType
                ? `${topType.count} events (${topType.percentage}%)`
                : "No events recorded"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Type Card */}
      {byType.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Event Type Distribution
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {totalEvents} total occurrences
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {byType.map((item) => (
              <div key={item.event_type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-medium text-foreground">
                    {item.event_type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono">
                      {item.count.toLocaleString()}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono px-1.5 py-0"
                    >
                      {item.percentage}%
                    </Badge>
                  </div>
                </div>
                {/* Clean Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-foreground transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(item.percentage, 1.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
};
