import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateEvent } from "@/hooks/use-events";
import { useAuth } from "@/lib/auth-client";
import {
  AlertCircle,
  CheckCircle2,
  LogIn,
  Radio,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EventIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: (mode: "login" | "register") => void;
}

const PRESET_TEMPLATES = [
  {
    label: "Page View",
    event_type: "page_view",
    payload: {
      url: "/dashboard/overview",
      referrer: "https://google.com",
      device: "Desktop (macOS)",
      browser: "Chrome 128.0",
    },
  },
  {
    label: "User Signup",
    event_type: "user_signup",
    payload: {
      plan: "developer_pro",
      referral_code: "LAUNCH2026",
      marketing_consent: true,
      country: "US",
    },
  },
  {
    label: "Checkout Completed",
    event_type: "checkout_completed",
    payload: {
      order_id: "ord_998412",
      amount_usd: 199.0,
      currency: "USD",
      items_count: 2,
      payment_method: "stripe",
    },
  },
  {
    label: "Button Clicked",
    event_type: "button_clicked",
    payload: {
      button_id: "btn_deploy_pipeline",
      section: "dashboard_header",
      target_env: "production",
    },
  },
  {
    label: "API Error Log",
    event_type: "error_occurred",
    payload: {
      service: "payment_webhook",
      status_code: 504,
      error_message: "Gateway timeout after 5000ms",
      retry_count: 3,
    },
  },
];

export const EventIngestModal = ({
  isOpen,
  onClose,
  onOpenAuthModal,
}: EventIngestModalProps) => {
  const { user } = useAuth();
  const [eventType, setEventType] = useState("page_view");
  const [userId, setUserId] = useState("");
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(PRESET_TEMPLATES[0].payload, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const createEventMutation = useCreateEvent();

  // Set user ID whenever authenticated user changes
  useEffect(() => {
    (() => {
      if (user?.id) {
        setUserId(user.id);
      }
    })();
  }, [user]);

  const handleApplyPreset = (preset: (typeof PRESET_TEMPLATES)[0]) => {
    setEventType(preset.event_type);
    setPayloadText(JSON.stringify(preset.payload, null, 2));
    setJsonError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    if (!user) {
      setJsonError("You must be logged in to ingest events.");
      toast.error("Authentication Required", {
        description: "Please sign in to ingest events.",
      });
      return;
    }

    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch {
      const errMsg = "Invalid JSON format in payload editor.";
      setJsonError(errMsg);
      toast.error("Invalid JSON Payload", {
        description: "Please check your JSON syntax.",
      });
      return;
    }

    if (!eventType.trim()) {
      const errMsg = "Event type is required.";
      setJsonError(errMsg);
      toast.error("Validation Error", { description: errMsg });
      return;
    }

    const finalUserId = userId.trim() || user.id;

    try {
      await createEventMutation.mutateAsync({
        user_id: finalUserId,
        event_type: eventType.trim(),
        payload: parsedPayload,
        timestamp: new Date().toISOString(),
      });

      toast.success("Event Ingested Successfully!", {
        description: `Type: ${eventType.trim()} • Broadcasted live via WebSocket`,
      });

      setSuccessBanner(true);
      setTimeout(() => {
        setSuccessBanner(false);
        onClose();
      }, 900);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to send event.";
      setJsonError(errMsg);
      toast.error("Ingestion Failed", { description: errMsg });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* If user is not authenticated: Show Auth Guard */}
        {!user ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/60">
              <ShieldAlert className="h-7 w-7 text-amber-500" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-bold text-foreground">
                Authentication Required
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                Only authenticated operators can ingest new events into the
                system. Please sign in or register an account to continue.
              </DialogDescription>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenAuthModal("login");
                }}
                className="gap-1.5 text-xs font-medium"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In / Register
              </Button>
            </div>
          </div>
        ) : (
          /* If user is authenticated: Show Ingestion Form */
          <div className="space-y-4">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between pr-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted">
                    <Send className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold">
                      Ingest Event Simulator
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Post an activity event to broadcast live via WebSocket and
                      persist to PostgreSQL
                    </DialogDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="gap-1 text-[11px] font-mono"
                >
                  <Radio className="h-2.5 w-2.5 text-emerald-500 animate-pulse" />
                  Operator Live
                </Badge>
              </div>
            </DialogHeader>

            {/* Authenticated User Attribution Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-xs gap-2">
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  Authenticated Operator:
                </span>
                <span className="font-semibold text-foreground">
                  {user.name} ({user.email})
                </span>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground bg-background px-2.5 py-1 rounded-md border border-border">
                User ID: <span className="text-foreground">{user.id}</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-foreground" />
                Quick Preset Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TEMPLATES.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => handleApplyPreset(preset)}
                    className="rounded-lg border border-border bg-background hover:bg-muted/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors shadow-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Event Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Event Type <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="e.g. user_signup, page_view"
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>

                {/* User ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Target User / Actor ID
                    </label>
                    <button
                      type="button"
                      onClick={() => setUserId(user.id)}
                      className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Reset to my ID
                    </button>
                  </div>
                  <Input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="User ID"
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* JSON Payload Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Payload Content (JSON){" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Must be valid JSON
                  </span>
                </div>
                <textarea
                  value={payloadText}
                  onChange={(e) => {
                    setPayloadText(e.target.value);
                    setJsonError(null);
                  }}
                  rows={7}
                  className="w-full rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed"
                  required
                />
              </div>

              {/* Error Alert */}
              {jsonError && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              {/* Success Alert */}
              {successBanner && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Event ingested and broadcasted successfully!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createEventMutation.isPending}
                  className="h-9 text-xs gap-1.5 font-medium px-4"
                >
                  <Send className="h-3.5 w-3.5" />
                  {createEventMutation.isPending
                    ? "Ingesting..."
                    : "Ingest Event"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
