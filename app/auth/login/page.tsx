"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError((error as Error).message || "Failed to sign up");
          return;
        }
        // After signup, user needs to verify email (if email confirmation is enabled)
        // For now, we'll just sign them in
        router.push("/");
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError((error as Error).message || "Failed to sign in");
          return;
        }
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen blob-bg flex items-center justify-center p-4">
      <div className="card-soft p-8 md:p-12 max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sage-600">
            {isSignUp
              ? "Sign up to start tracking your body composition"
              : "Sign in to access your scan history"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-terracotta-50 border border-terracotta-200 rounded-xl text-terracotta-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sage-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 focus:border-sage-400 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-sage-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 focus:border-sage-400 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            {isSignUp && (
              <p className="mt-2 text-xs text-sage-500">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-organic w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Sign Up</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-sage-600 hover:text-sage-700 text-sm font-medium"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </main>
  );
}

