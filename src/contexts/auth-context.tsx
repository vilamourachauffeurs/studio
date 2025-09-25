"use client";

import { createContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const MOCK_USERS: Record<UserRole, User> = {
  admin: {
    id: "admin-1",
    name: "Admin User",
    email: "admin@chauffeur.pro",
    role: "admin",
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "admin-avatar")?.imageUrl || "",
  },
  partner: {
    id: "partner-1",
    name: "Partner User",
    email: "partner@hyatt.com",
    role: "partner",
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "partner-avatar")?.imageUrl ||
      "",
  },
  driver: {
    id: "driver-1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "driver",
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "driver-avatar")?.imageUrl ||
      "",
  },
};

export interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = useCallback((role: UserRole) => {
    setUser(MOCK_USERS[role]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
