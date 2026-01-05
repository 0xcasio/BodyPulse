"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload, History, LogOut, LogIn, Settings } from "lucide-react";
import Link from "next/link";
import { getSession, signOut } from "@/lib/auth";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const { session } = await getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAuthenticated(false);
    router.push("/auth/login");
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Don't show navbar on login page
  if (pathname.startsWith('/auth/login')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sage-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-sage-900">
              Body Pulse
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {!isLoading && isAuthenticated && (
              <>
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive('/') && pathname !== '/history' && pathname !== '/compare'
                      ? 'bg-sage-100 text-sage-900'
                      : 'text-sage-600 hover:bg-sage-50'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </Link>
                <Link
                  href="/history"
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive('/history')
                      ? 'bg-sage-100 text-sage-900'
                      : 'text-sage-600 hover:bg-sage-50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </Link>
                <Link
                  href="/settings"
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive('/settings')
                      ? 'bg-sage-100 text-sage-900'
                      : 'text-sage-600 hover:bg-sage-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full font-medium transition-all duration-300 text-sage-600 hover:bg-sage-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
            {!isLoading && !isAuthenticated && (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-sage-100 text-sage-900 hover:bg-sage-200 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

