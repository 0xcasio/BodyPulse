"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lightbulb, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getUserScans } from "@/lib/db/queries";
import { Scan } from "@/types/scan";
import { identifyFocusAreas } from "@/lib/insights/prioritization";
import { detectImprovements } from "@/lib/insights/improvement-detector";
import { InsightsResponse, FocusAreaInsight, MetricImprovement } from "@/types/insights";
import InsightHero from "@/components/insights/InsightHero";
import ImprovementCard from "@/components/insights/ImprovementCard";
import FocusAreaCard from "@/components/insights/FocusAreaCard";

export default function InsightsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestScan, setLatestScan] = useState<Scan | null>(null);
  const [previousScan, setPreviousScan] = useState<Scan | null>(null);
  const [insights, setInsights] = useState<{
    overall_summary: string;
    celebration?: string;
    focus_areas: FocusAreaInsight[];
  } | null>(null);
  const [improvements, setImprovements] = useState<MetricImprovement[]>([]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const { session } = await getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Load scans
      const scans = await getUserScans(session.user.id);
      if (!scans || scans.length === 0) {
        setError("No scans found. Please upload a scan first.");
        setIsLoading(false);
        return;
      }

      // Sort scans by date (most recent first)
      scans.sort((a, b) => new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime());

      const latest = scans[0];
      const previous = scans.length > 1 ? scans[1] : null;

      setLatestScan(latest);
      setPreviousScan(previous);

      // Detect improvements
      if (previous) {
        const detectedImprovements = detectImprovements(latest, previous);
        setImprovements(detectedImprovements);
      }

      // Check cache first
      const cacheKey = `insights_${latest.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          const cacheTime = cachedData.timestamp;
          const now = Date.now();
          const ttl = 24 * 60 * 60 * 1000; // 24 hours
          const ageMinutes = Math.floor((now - cacheTime) / 1000 / 60);

          if (now - cacheTime < ttl) {
            if (ageMinutes < 1) {
              console.log('🎉 Insights were pre-generated in the background! Loading instantly...');
            } else {
              console.log(`✅ Loading insights from cache (${ageMinutes} minutes old)`);
              console.log(`🚀 Cache will remain valid for ${Math.floor((ttl - (now - cacheTime)) / 1000 / 60)} more minutes`);
            }
            setInsights(cachedData.data);
            setIsLoading(false);
            return;
          } else {
            console.log('⏰ Cache expired, regenerating insights...');
          }
        } catch (e) {
          console.warn('❌ Failed to parse cached insights, will regenerate');
        }
      } else {
        console.log('🆕 No cache found for this scan, generating fresh insights...');
      }

      // Generate insights
      await generateInsights(latest, previous, session.user.id);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
      setIsLoading(false);
    }
  };

  const generateInsights = async (latest: Scan, previous: Scan | null, userId: string) => {
    try {
      // Get user gender from latest scan
      const gender = latest.user_gender as 'male' | 'female' | undefined;

      // Identify focus areas using prioritization algorithm
      const focusAreas = identifyFocusAreas(latest, gender);

      if (focusAreas.length === 0) {
        setError("Could not identify focus areas. Please ensure your scan has sufficient data.");
        setIsLoading(false);
        return;
      }

      // Call API to generate AI insights
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latestScan: latest,
          previousScan: previous,
          focusAreas,
          userProfile: {
            age: latest.user_age,
            gender: gender,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const result: InsightsResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate insights');
      }

      setInsights(result.data);

      // Cache the result
      const cacheKey = `insights_${latest.id}`;
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: result.data,
          timestamp: Date.now(),
        })
      );
      console.log('💾 Insights cached successfully! Next visit will load instantly.');

      setIsLoading(false);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      setIsLoading(false);
    }
  };

  const retryGeneration = () => {
    if (latestScan) {
      setError(null);
      setIsLoading(true);
      // Clear cache
      const cacheKey = `insights_${latestScan.id}`;
      sessionStorage.removeItem(cacheKey);
      // Regenerate
      generateInsights(latestScan, previousScan, '');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-6 flex justify-center">
            <Loader2 className="w-16 h-16 text-sage-600 animate-spin" />
          </div>
          <h2 className="text-3xl font-display font-bold text-sage-900 mb-3">
            Analyzing Your Scan
          </h2>
          <p className="text-sage-600 mb-6 text-lg">
            Our AI is creating personalized recommendations based on your body composition data...
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-card-soft">
            <p className="text-sm text-sage-500 mb-4">This usually takes 5-10 seconds</p>
            <div className="space-y-2 text-left">
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-2 h-2 bg-sage-600 rounded-full"></div>
                <span className="text-sage-700 text-sm">Identifying focus areas...</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="w-2 h-2 bg-sage-600 rounded-full"></div>
                <span className="text-sage-700 text-sm">Generating action plans...</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
              >
                <div className="w-2 h-2 bg-sage-600 rounded-full"></div>
                <span className="text-sage-700 text-sm">Personalizing recommendations...</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md bg-white rounded-3xl shadow-card-soft p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-12 h-12 text-terracotta-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-sage-900 mb-2">
            Unable to Generate Insights
          </h2>
          <p className="text-sage-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-full font-medium text-sage-600 hover:bg-sage-50 transition-colors"
            >
              Upload New Scan
            </button>
            <button
              onClick={retryGeneration}
              className="px-6 py-3 rounded-full font-medium bg-sage-600 text-white hover:bg-sage-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main insights view
  return (
    <div className="min-h-screen bg-cream pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        {insights && latestScan && (
          <InsightHero
            overallSummary={insights.overall_summary}
            inbodyScore={latestScan.inbody_score ?? undefined}
            scanDate={latestScan.scan_date}
          />
        )}

        {/* Celebration Section */}
        {insights?.celebration && (
          <motion.div
            className="mt-8 bg-gradient-to-br from-sage-50 to-sage-100 rounded-3xl shadow-card-soft p-8 border-2 border-sage-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Sparkles className="w-8 h-8 text-sage-600" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-sage-900 mb-2">
                  Celebrate Your Progress
                </h2>
                <p className="text-sage-700 text-lg leading-relaxed">
                  {insights.celebration}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Improvements Grid */}
        {improvements.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-display font-bold text-sage-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sage-600" />
              Your Improvements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {improvements.map((improvement, index) => (
                <motion.div
                  key={improvement.metricKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <ImprovementCard improvement={improvement} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Focus Areas */}
        {insights?.focus_areas && insights.focus_areas.length > 0 && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-3xl font-display font-bold text-sage-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-8 h-8 text-sage-600" />
              Your Focus Areas
            </h2>
            <p className="text-sage-600 mb-8 text-lg">
              Based on your scan, here are the top areas to focus on for improvement:
            </p>
            <div className="space-y-6">
              {insights.focus_areas.map((focusArea, index) => (
                <FocusAreaCard
                  key={focusArea.metric}
                  focusArea={focusArea}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
