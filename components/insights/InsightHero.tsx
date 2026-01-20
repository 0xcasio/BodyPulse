"use client";

import { motion } from "framer-motion";
import ScoreGauge from "@/components/dashboard/ScoreGauge";

interface InsightHeroProps {
  overallSummary: string;
  inbodyScore?: number;
  scanDate: string;
}

export default function InsightHero({
  overallSummary,
  inbodyScore,
  scanDate,
}: InsightHeroProps) {
  return (
    <motion.div
      className="bg-white rounded-3xl shadow-card-soft p-8 md:p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
    >
      <div className="flex flex-col items-center text-center">
        <motion.h1
          className="text-3xl md:text-4xl font-display font-bold text-sage-900 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Your Personal Insights
        </motion.h1>

        <motion.p
          className="text-sage-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Based on scan from {new Date(scanDate).toLocaleDateString()}
        </motion.p>

        {inbodyScore !== undefined && inbodyScore !== null && (
          <div className="mb-8">
            <ScoreGauge score={inbodyScore} />
          </div>
        )}

        <motion.div
          className="max-w-3xl text-lg text-sage-700 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {overallSummary}
        </motion.div>
      </div>
    </motion.div>
  );
}
