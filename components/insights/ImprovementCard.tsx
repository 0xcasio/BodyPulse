"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { MetricImprovement } from "@/types/insights";

interface ImprovementCardProps {
  improvement: MetricImprovement;
}

export default function ImprovementCard({ improvement }: ImprovementCardProps) {
  const isPositive = improvement.isImprovement;

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-card-soft p-6 border-2 ${
        isPositive ? "border-sage-200" : "border-amber-200"
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-semibold text-sage-900">
          {improvement.metricLabel}
        </h3>
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            isPositive
              ? "bg-sage-100 text-sage-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPositive ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">
            {Math.abs(improvement.percentChange).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-display font-bold text-sage-900">
          {improvement.currentValue.toFixed(1)}
        </span>
        <span className="text-sm text-sage-600">{improvement.unit}</span>
      </div>

      <div className="mt-2 text-sm text-sage-600">
        <span className="opacity-60">Previous:</span>{" "}
        <span className="font-medium">
          {improvement.previousValue.toFixed(1)} {improvement.unit}
        </span>
        <span className="mx-2">→</span>
        <span
          className={`font-semibold ${
            isPositive ? "text-sage-700" : "text-amber-700"
          }`}
        >
          {improvement.change > 0 ? "+" : ""}
          {improvement.change.toFixed(1)} {improvement.unit}
        </span>
      </div>
    </motion.div>
  );
}
