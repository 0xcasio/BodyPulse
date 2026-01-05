"use client";

import { motion } from "framer-motion";

interface DataCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  status?: 'excellent' | 'good' | 'moderate' | 'attention' | 'neutral';
}

export default function DataCard({
  label,
  value,
  unit,
  subtitle,
  status = 'neutral',
}: DataCardProps) {
  const statusStyles = {
    excellent: 'border-sage-300 bg-sage-50/50',
    good: 'border-sage-200 bg-sage-50/30',
    moderate: 'border-amber-200 bg-amber-50/30',
    attention: 'border-terracotta-200 bg-terracotta-50/30',
    neutral: 'border-sage-100 bg-white',
  };

  const valueColor = {
    excellent: 'text-sage-700',
    good: 'text-sage-600',
    moderate: 'text-amber-700',
    attention: 'text-terracotta-700',
    neutral: 'text-sage-900',
  };

  return (
    <motion.div
      className={`p-4 rounded-xl border transition-colors duration-300 ${statusStyles[status]}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 4px 12px rgba(95, 122, 95, 0.1)",
        transition: {
          duration: 0.2,
          ease: [0.4, 0.0, 0.2, 1],
        },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-xs font-medium text-sage-600 mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <motion.span
          className={`text-2xl font-display font-bold ${valueColor[status]}`}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.4, 0.0, 0.2, 1],
          }}
        >
          {value}
        </motion.span>
        {unit && (
          <span className="text-sm text-sage-500">{unit}</span>
        )}
      </div>
      {subtitle && (
        <div className="text-xs text-sage-500 mt-1">{subtitle}</div>
      )}
    </motion.div>
  );
}
