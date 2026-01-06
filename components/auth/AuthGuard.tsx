"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { session } = await getSession();
      setIsAuthenticated(!!session);
      
      if (requireAuth && !session) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      if (requireAuth) {
        router.push("/auth/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sage-600 mx-auto mb-4" />
          <div className="text-sage-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}


