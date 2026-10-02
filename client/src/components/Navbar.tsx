import { Activity, Plus, RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WebSocketStatus } from "@/hooks/use-websocket";

interface NavbarProps {
  wsStatus: WebSocketStatus;
  onOpenIngestModal: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Navbar = ({
  wsStatus,
  onOpenIngestModal,
  onRefresh,
  isRefreshing = false,
}: NavbarProps) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted font-bold text-foreground">
            <Activity className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                EventStream
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                Live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Real-Time Event Ingestion & Analytics
            </p>
          </div>
        </div>

        {/* Actions & Connection Status */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs">
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                wsStatus === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : wsStatus === "connecting"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            />
            <span className="font-medium capitalize text-muted-foreground">
              {wsStatus === "connected" ? (
                <span className="flex items-center gap-1 text-foreground">
                  <Radio className="h-3 w-3 text-emerald-500" /> WebSocket Live
                </span>
              ) : wsStatus === "connecting" ? (
                "Connecting..."
              ) : (
                "Disconnected"
              )}
            </span>
          </div>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Ingest Event Modal Button */}
          <Button
            size="sm"
            onClick={onOpenIngestModal}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ingest Event</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
