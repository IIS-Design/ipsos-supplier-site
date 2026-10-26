"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types/user";
import { withBasePath } from "@/lib/app-path";

type SignInResult = { success: true } | { success: false; message: string };

type MockAuthContextValue = {
  user: User | null;
  updateUser: (user: User) => void;
  signIn: (
    email: string,
    password: string,
    keepMeSignedIn: boolean,
  ) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

export function MockAuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
      keepMeSignedIn: boolean,
    ): Promise<SignInResult> => {
      try {
        const response = await fetch(withBasePath("/api/auth/mock-session/"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, keepMeSignedIn }),
        });
        if (!response.ok) {
          const body = (await response.json()) as { message?: string };
          return {
            success: false,
            message:
              body.message ??
              "The email or password you entered is incorrect. Please try again.",
          };
        }
        const body = (await response.json()) as { user: User };
        setUser(body.user);
        return { success: true };
      } catch {
        return {
          success: false,
          message: "Unable to connect to the service. Please try again.",
        };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await fetch(withBasePath("/api/auth/mock-session/"), { method: "DELETE" });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signOut, updateUser: setUser }),
    [user, signIn, signOut],
  );
  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth(): MockAuthContextValue {
  const context = useContext(MockAuthContext);
  if (!context)
    throw new Error("useMockAuth must be used inside MockAuthProvider.");
  return context;
}
