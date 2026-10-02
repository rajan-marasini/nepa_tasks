import { useState } from "react";
import { Send, Sparkles, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCreateEvent } from "@/hooks/use-events";

interface EventIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_TEMPLATES = [
  {
    label: "Page View",
    event_type: "page_view",
    user_id: "usr_alex88",
    payload: {
      path: "/pricing",
      referrer: "google.com",
      device: "macOS",
      browser: "Chrome",
    },
  },
  {
    label: "User Signup",
    event_type: "user_signup",
    user_id: "usr_sarah_k",
    payload: {
      plan: "pro_monthly",
      referral_code: "LAUNCH2026",
      marketing_consent: true,
    },
  },
  {
    label: "Checkout Completed",
    event_type: "checkout_completed",
    user_id: "usr_david99",
    payload: {
      order_id: "ord_884920",
      amount_usd: 129.0,
      items_count: 2,
      payment_method: "stripe",
    },
  },
  {
    label: "Button Clicked",
    event_type: "button_clicked",
    user_id: "usr_emily_r",
    payload: {
      button_id: "btn_upgrade_now",
      section: "feature_matrix",
    },
  },
  {
    label: "API Error Log",
    event_type: "error_occurred",
    user_id: "system_backend",
    payload: {
      status_code: 504,
      service: "payment-gateway",
      error_message: "Upstream timeout after 5000ms",
    },
  },
];

export const EventIngestModal = ({
  isOpen,
  onClose,
}: EventIngestModalProps) => {
  const [eventType, setEventType] = useState("page_view");
  const [userId, setUserId] = useState("usr_dev_demo");
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(PRESET_TEMPLATES[0].payload, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const createEventMutation = useCreateEvent();

  const handleApplyPreset = (preset: (typeof PRESET_TEMPLATES)[0]) => {
    setEventType(preset.event_type);
    setUserId(preset.user_id);
    setPayloadText(JSON.stringify(preset.payload, null, 2));
    setJsonError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch {
      setJsonError("Invalid JSON format in payload.");
      return;
    }

    if (!eventType.trim()) {
      setJsonError("Event type is required.");
      return;
    }

    if (!userId.trim()) {
      setJsonError("User ID is required.");
      return;
    }

    try {
      await createEventMutation.mutateAsync({
        user_id: userId.trim(),
        event_type: eventType.trim(),
        payload: parsedPayload,
        timestamp: new Date().toISOString(),
      });

      onClose();
    } catch (err: unknown) {
      setJsonError(
        err instanceof Error ? err.message : "Failed to send event.",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Send className="h-4 w-4 text-foreground" />
            Ingest Event Simulator
          </DialogTitle>
          <DialogDescription className="text-xs">
            Send a sample event to test real-time WebSocket broadcasting and database persistence.
          </DialogDescription>
        </DialogHeader>

        {/* Quick Presets */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Quick Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map((preset) => (
              <Badge
                key={preset.label}
                variant="outline"
                className="cursor-pointer hover:bg-muted/80 text-[11px] py-1 px-2.5 transition-colors"
                onClick={() => handleApplyPreset(preset)}
              >
                {preset.label}
              </Badge>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            {/* Event Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Event Type
              </label>
              <Input
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="e.g. user_signup"
                className="h-8 text-xs font-mono"
                required
              />
            </div>

            {/* User ID */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                User / Actor ID
              </label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. usr_12345"
                className="h-8 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* JSON Payload Editor */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Payload (JSON)
              </label>
              <span className="text-[10px] text-muted-foreground">
                Valid JSON object or primitives
              </span>
            </div>
            <textarea
              value={payloadText}
              onChange={(e) => {
                setPayloadText(e.target.value);
                setJsonError(null);
              }}
              rows={5}
              className="w-full rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-xs text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>

          {/* Error Message */}
          {jsonError && (
            <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createEventMutation.isPending}
              className="h-8 text-xs gap-1.5"
            >
              <Send className="h-3 w-3" />
              {createEventMutation.isPending ? "Ingesting..." : "Send Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
