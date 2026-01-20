"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock } from "lucide-react";
import { FocusAreaInsight } from "@/types/insights";
import ActionPlanSection from "./ActionPlanSection";

interface FocusAreaCardProps {
  focusArea: FocusAreaInsight;
  index: number;
}

export default function FocusAreaCard({ focusArea, index }: FocusAreaCardProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const getStatusColor = (metric: string) => {
    // Try to match metric name to determine status color
    // This is a simplified version - you might want to pass actual status
    return "sage";
  };

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-card-soft overflow-hidden border-2 border-sage-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-sage-50/50 transition-colors duration-300"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 text-sage-700 font-display font-bold text-sm">
              {index + 1}
            </span>
            <h2 className="text-2xl font-display font-bold text-sage-900">
              {focusArea.metric.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </h2>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-sage-600 ml-4"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-8 space-y-6">
              {/* Why This Matters */}
              <div>
                <h3 className="text-sm font-display font-semibold text-sage-600 uppercase tracking-wide mb-2">
                  Why This Matters
                </h3>
                <p className="text-sage-700 leading-relaxed">
                  {focusArea.why_it_matters}
                </p>
              </div>

              {/* Current Assessment */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                <h3 className="text-sm font-display font-semibold text-amber-700 uppercase tracking-wide mb-2">
                  Current Assessment
                </h3>
                <p className="text-amber-900 leading-relaxed">
                  {focusArea.current_assessment}
                </p>
              </div>

              {/* Action Plan */}
              <div>
                <h3 className="text-lg font-display font-semibold text-sage-900 mb-4">
                  Your Action Plan
                </h3>
                <ActionPlanSection actionPlan={focusArea.action_plan} />
              </div>

              {/* Expected Timeline */}
              <div className="flex items-start gap-3 bg-sage-50 border-2 border-sage-200 rounded-2xl p-4">
                <Clock className="w-5 h-5 text-sage-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-display font-semibold text-sage-700 uppercase tracking-wide mb-1">
                    Expected Timeline
                  </h3>
                  <p className="text-sage-700">
                    {focusArea.expected_timeline}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
