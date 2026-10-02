import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WebSocketStatus } from "@/hooks/use-websocket";
import { authClient, useAuth } from "@/lib/auth-client";
import { Activity, ChevronDown, LogIn, LogOut, Plus, Radio, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface NavbarProps {
  wsStatus: WebSocketStatus;
  onOpenIngestModal: () => void;
  onOpenAuthModal: (mode: "login" | "register") => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Navbar = ({
  wsStatus,
  onOpenIngestModal,
  onOpenAuthModal,
  onRefresh,
  isRefreshing = false,
}: NavbarProps) => {
  const { user, isPending } = useAuth();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({});
      toast.success("Signed out successfully", {
        description: "You have been logged out of your session.",
      });
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // Generate 2-letter initials for Avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted font-bold text-foreground shadow-xs">
            <Activity className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                EventStream
              </span>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-semibold tracking-wider"
              >
                Live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Real-Time Event Ingestion & Analytics Pipeline
            </p>
          </div>
        </div>

        {/* Actions & Connection Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* WebSocket Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs">
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
                  <Radio className="h-3 w-3 text-emerald-500" /> Live Stream Active
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
            title="Refresh feed and metrics"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Auth State & User Menu */}
          {!isPending && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex items-center gap-2 rounded-full border border-border bg-background p-1 pr-2 hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <Avatar size="sm" className="h-7 w-7 border border-border">
                      {user.image && <AvatarImage src={user.image} alt={user.name} />}
                      <AvatarFallback className="text-[11px] font-bold bg-foreground text-background">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-medium text-foreground truncate max-w-[120px] leading-tight">
                        {user.name}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 p-1">
                    {/* User Profile Header wrapped in DropdownMenuGroup */}
                    <DropdownMenuGroup>
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-xs font-semibold leading-none text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <div className="pt-1">
                          <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            ID: {user.id.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Menu Items Group */}
                    <DropdownMenuGroup>
                      {/* Ingest Event Item */}
                      <DropdownMenuItem
                        onClick={onOpenIngestModal}
                        className="cursor-pointer gap-2 py-2 text-xs font-medium"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                        <span>Ingest Event</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      {/* Sign Out Item */}
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        variant="destructive"
                        className="cursor-pointer gap-2 py-2 text-xs font-medium text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1.5 pl-1 border-l border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenAuthModal("login")}
                    className="h-8 text-xs gap-1.5 font-medium"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
