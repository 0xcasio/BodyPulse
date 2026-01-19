"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload, History, LogOut, LogIn, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { getSession, signOut } from "@/lib/auth";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sage-200 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <span className="text-xl md:text-2xl font-display font-bold text-sage-900 truncate">
              Body Pulse
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {!isLoading && isAuthenticated && (
              <>
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    isActive('/') && pathname !== '/history' && pathname !== '/compare'
                      ? 'bg-sage-100 text-sage-900'
                      : 'text-sage-600 hover:bg-sage-50'
                  }`}
                >
                  <Upload className="w-4 h-4 flex-shrink-0" />
                  <span>Upload</span>
                </Link>
                <Link
                  href="/history"
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    isActive('/history')
                      ? 'bg-sage-100 text-sage-900'
                      : 'text-sage-600 hover:bg-sage-50'
                  }`}
                >
                  <History className="w-4 h-4 flex-shrink-0" />
                  <span>History</span>
                </Link>
                <Link
                  href="/settings"
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    isActive('/settings')
                      ? 'bg-sage-100 text-sage-900'
                      : 'text-sage-600 hover:bg-sage-50'
                  }`}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full font-medium transition-all duration-300 text-sage-600 hover:bg-sage-50 flex items-center gap-2 whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
            {!isLoading && !isAuthenticated && (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-sage-100 text-sage-900 hover:bg-sage-200 flex items-center gap-2 whitespace-nowrap"
              >
                <LogIn className="w-4 h-4 flex-shrink-0" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2 flex-shrink-0">
            {!isLoading && isAuthenticated && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full text-sage-600 hover:bg-sage-50 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            )}
            {!isLoading && !isAuthenticated && (
              <Link
                href="/auth/login"
                className="px-3 py-2 rounded-full font-medium transition-all duration-300 bg-sage-100 text-sage-900 hover:bg-sage-200 flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <LogIn className="w-4 h-4 flex-shrink-0" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && !isLoading && isAuthenticated && (
          <div className="md:hidden mt-4 pb-2 border-t border-sage-200 pt-4">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-3 ${
                  isActive('/') && pathname !== '/history' && pathname !== '/compare'
                    ? 'bg-sage-100 text-sage-900'
                    : 'text-sage-600 hover:bg-sage-50'
                }`}
              >
                <Upload className="w-5 h-5 flex-shrink-0" />
                <span>Upload</span>
              </Link>
              <Link
                href="/history"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-3 ${
                  isActive('/history')
                    ? 'bg-sage-100 text-sage-900'
                    : 'text-sage-600 hover:bg-sage-50'
                }`}
              >
                <History className="w-5 h-5 flex-shrink-0" />
                <span>History</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-3 ${
                  isActive('/settings')
                    ? 'bg-sage-100 text-sage-900'
                    : 'text-sage-600 hover:bg-sage-50'
                }`}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-3 rounded-full font-medium transition-all duration-300 text-sage-600 hover:bg-sage-50 flex items-center gap-3 text-left w-full"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

