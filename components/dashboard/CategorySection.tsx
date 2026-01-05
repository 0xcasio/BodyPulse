"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { scrollFadeIn } from "@/lib/motion";

interface CategorySectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  delay?: string;
}

export default function CategorySection({
  title,
  description,
  icon,
  defaultExpanded = true,
  children,
  delay = "0s",
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      className="mb-6"
      variants={scrollFadeIn}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full card-soft p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-300"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-100 to-terracotta-50 flex items-center justify-center text-sage-600"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          )}
          <div className="text-left">
            <h2 className="text-xl font-display font-bold text-sage-900">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-sage-600 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${isExpanded ? 'bg-sage-100 text-sage-700' : 'bg-sage-50 text-sage-600'}
            `}
            layout
          >
            {isExpanded ? 'Expanded' : 'Collapsed'}
          </motion.div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <ChevronDown className="w-5 h-5 text-sage-500" />
          </motion.div>
        </div>
      </motion.button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease-out'
        }}
      >
        <div style={{ overflow: isExpanded ? 'visible' : 'hidden' }}>
          <div className="mt-4 px-1 pb-1" style={{
            opacity: isExpanded ? 1 : 0,
            transition: 'opacity 0.2s ease-out'
          }}>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
