"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
}

export default function ScoreGauge({ score, maxScore = 100 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to actual value
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const percentage = (score / maxScore) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  const getScoreColor = () => {
    if (score >= 90) return '#5f7a5f'; // sage-600
    if (score >= 80) return '#7d957d'; // sage-400
    if (score >= 70) return '#f0a02d'; // amber-500
    return '#d0704e'; // terracotta-500
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Gauge SVG */}
      <motion.div
        className="relative w-64 h-36 pt-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
      >
        <svg viewBox="0 -15 200 115" className="w-full h-full overflow-visible">
          {/* Background Arc */}
          <motion.path
            d="M 10 90 A 80 80 0 0 1 190 90"
            fill="none"
            stroke="#e3e9e3"
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0.0, 0.2, 1],
            }}
          />

          {/* Progress Arc */}
          <motion.path
            d="M 10 90 A 80 80 0 0 1 190 90"
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.83}, 1000`}
            className="transition-all duration-1000 ease-out"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: {
                duration: 1.2,
                delay: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              },
              opacity: {
                duration: 0.3,
                delay: 0.3,
              },
            }}
          />

          {/* Center Indicator */}
          <motion.circle
            cx="100"
            cy="90"
            r="4"
            fill={getScoreColor()}
            className="transition-all duration-300"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 1.0,
              ease: [0.4, 0.0, 0.2, 1],
            }}
          />
        </svg>

        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <motion.div
            className="text-5xl font-display font-bold gradient-text mb-1"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            }}
          >
            {animatedScore}
          </motion.div>
          <motion.div
            className="text-sm text-sage-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.8,
            }}
          >
            out of {maxScore}
          </motion.div>
        </div>
      </motion.div>

      {/* Label */}
      <motion.div
        className="mt-4 px-4 py-2 rounded-full"
        style={{
          backgroundColor: `${getScoreColor()}15`,
          color: getScoreColor(),
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 1.2,
          ease: [0.4, 0.0, 0.2, 1],
        }}
      >
        <span className="text-sm font-medium">{getScoreLabel()}</span>
      </motion.div>
    </div>
  );
}
