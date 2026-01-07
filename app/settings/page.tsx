"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Loader2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/db/users";
import { UserProfile } from "@/types/user";
import ProfileSection from "@/components/settings/ProfileSection";
import PasswordSection from "@/components/settings/PasswordSection";
import PreferencesSection from "@/components/settings/PreferencesSection";
import { pageVariants, fadeInUp } from "@/lib/motion";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { session } = await getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      setIsCheckingAuth(false);
      await loadProfile();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push("/auth/login");
    }
  };

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
          <div className="text-sage-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen blob-bg">
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-sage-900 mb-2">
            Settings
          </h1>
          <p className="text-sage-600">
            Manage your profile, account security, and preferences
          </p>
        </motion.div>

        {/* Account Information Card */}
        <motion.div className="card-soft p-6 mb-6" variants={fadeInUp}>
          <h2 className="text-xl font-display font-semibold text-sage-900 mb-4">
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-sage-500" />
              <div>
                <div className="text-sm text-sage-600">Email</div>
                <div className="text-sage-900 font-medium">{profile?.email || 'Not available'}</div>
              </div>
            </div>
            {profile?.created_at && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-sage-500" />
                <div>
                  <div className="text-sm text-sage-600">Account Created</div>
                  <div className="text-sage-900 font-medium">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Section */}
        <motion.div className="mb-6" variants={fadeInUp}>
          <ProfileSection profile={profile} onUpdate={handleProfileUpdate} />
        </motion.div>

        {/* Password Section */}
        <motion.div className="mb-6" variants={fadeInUp}>
          <PasswordSection />
        </motion.div>

        {/* Preferences Section */}
        <motion.div className="mb-6" variants={fadeInUp}>
          <PreferencesSection profile={profile} onUpdate={handleProfileUpdate} />
        </motion.div>
      </motion.div>
    </main>
  );
}



