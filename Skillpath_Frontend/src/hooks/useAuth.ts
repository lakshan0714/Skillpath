"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: "user" ;
  name?: string;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;
  const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT;

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://${BACKEND_HOST}:${BACKEND_PORT}/user/me`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        setUser(null);
        // Redirect to login if not authenticated and not on auth pages
        const isAuthPage =
          pathname === "/login" ||
          pathname === "/signup" ||
          pathname === "/forgot-password";

        if (!isAuthPage) {
          router.push("/login");
        }
      }
    } catch (err) {
      setError("Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`http://${BACKEND_HOST}:${BACKEND_PORT}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    logout,
    refetch: fetchUser,
  };
}