import { useState } from "react";
import { LogIn, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export const AuthModal = ({
  isOpen,
  onClose,
  defaultMode = "login",
}: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setError(null);
    setSuccess(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim()) {
          setError("Name is required");
          setIsLoading(false);
          return;
        }

        const res = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        if (res.error) {
          const errMsg = res.error.message || "Failed to create account.";
          setError(errMsg);
          toast.error("Registration Failed", { description: errMsg });
        } else {
          setSuccess("Account created successfully!");
          toast.success("Account Created!", {
            description: `Welcome to EventStream, ${name.trim()}!`,
          });
          setTimeout(() => {
            handleClose();
          }, 800);
        }
      } else {
        const res = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (res.error) {
          const errMsg = res.error.message || "Invalid email or password.";
          setError(errMsg);
          toast.error("Sign In Failed", { description: errMsg });
        } else {
          setSuccess("Signed in successfully!");
          toast.success("Welcome Back!", {
            description: `Signed in as ${email.trim()}`,
          });
          setTimeout(() => {
            handleClose();
          }, 800);
        }
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
      toast.error("Authentication Error", { description: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted">
              {mode === "login" ? (
                <LogIn className="h-4 w-4 text-foreground" />
              ) : (
                <UserPlus className="h-4 w-4 text-foreground" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {mode === "login" ? "Sign In to EventStream" : "Create an Account"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {mode === "login"
                  ? "Enter your credentials to manage and ingest events"
                  : "Register to authenticate and track events under your profile"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`rounded-md py-1 text-xs font-medium transition-colors ${
              mode === "login"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`rounded-md py-1 text-xs font-medium transition-colors ${
              mode === "register"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="h-8 text-xs"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-8 text-xs"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-md">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 text-xs font-medium"
            >
              {isLoading
                ? "Processing..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
