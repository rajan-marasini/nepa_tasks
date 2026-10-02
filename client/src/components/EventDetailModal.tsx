import { useState } from "react";
import { Check, Copy, Clock, User, Tag, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventItem } from "@/types/event";

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal = ({
  event,
  isOpen,
  onClose,
}: EventDetailModalProps) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!event) return null;

  const copyToClipboard = (text: string, type: "id" | "payload") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const formattedPayload =
    typeof event.payload === "string"
      ? event.payload
      : JSON.stringify(event.payload, null, 2);

  const formattedDate = new Date(event.timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Event Inspector
            </DialogTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {event.event_type}
            </Badge>
          </div>
          <DialogDescription className="text-xs">
            Detailed inspection of ingested event record
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Event ID */}
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <Key className="h-3 w-3" /> Event ID
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-[10px]"
                  onClick={() => copyToClipboard(event.id, "id")}
                >
                  {copiedId ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="font-mono text-foreground truncate">{event.id}</p>
            </div>

            {/* User ID */}
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <div className="flex items-center text-muted-foreground mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <User className="h-3 w-3" /> User / Actor ID
                </span>
              </div>
              <p className="font-mono text-foreground truncate">
                {event.user_id}
              </p>
            </div>

            {/* Timestamp */}
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 sm:col-span-2">
              <div className="flex items-center text-muted-foreground mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="h-3 w-3" /> Timestamp
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-foreground font-medium">
                  {formattedDate}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {event.timestamp}
                </span>
              </div>
            </div>
          </div>

          {/* Payload Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">
                Event Payload (JSON)
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px] gap-1"
                onClick={() => copyToClipboard(formattedPayload, "payload")}
              >
                {copiedPayload ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy JSON
                  </>
                )}
              </Button>
            </div>
            <pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs font-mono text-foreground overflow-x-auto max-h-60">
              {formattedPayload}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
