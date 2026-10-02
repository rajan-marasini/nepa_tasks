import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface SessionData {
  user: User;
  session: Session;
}

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
});

export const { signIn, signUp } = authClient;
export const signOut = (options?: Parameters<typeof authClient.signOut>[0]) =>
  authClient.signOut(options ?? {});

// Strongly-typed wrapper around useSession to avoid 'never' inference
export const useAuth = () => {
  const sessionResult = authClient.useSession();
  const session = sessionResult.data as SessionData | null;

  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
    isPending: sessionResult.isPending,
    error: sessionResult.error,
  };
};
