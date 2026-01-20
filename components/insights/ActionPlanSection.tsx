"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Apple, Heart, TrendingUp, ChevronDown } from "lucide-react";
import { ActionPlan } from "@/types/insights";

interface ActionPlanSectionProps {
  actionPlan: ActionPlan;
}

interface SectionConfig {
  key: keyof ActionPlan;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export default function ActionPlanSection({ actionPlan }: ActionPlanSectionProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("exercise");

  const sections: SectionConfig[] = [
    {
      key: "exercise",
      label: "Exercise",
      icon: <Dumbbell className="w-5 h-5" />,
      color: "sage",
    },
    {
      key: "nutrition",
      label: "Nutrition",
      icon: <Apple className="w-5 h-5" />,
      color: "terracotta",
    },
    {
      key: "lifestyle",
      label: "Lifestyle",
      icon: <Heart className="w-5 h-5" />,
      color: "amber",
    },
    {
      key: "tracking",
      label: "How to Track",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "sage",
    },
  ];

  const toggleSection = (key: string) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  const getColorClasses = (color: string, isExpanded: boolean) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
      sage: {
        bg: isExpanded ? "bg-sage-100" : "bg-sage-50",
        text: "text-sage-700",
        hover: "hover:bg-sage-100",
      },
      terracotta: {
        bg: isExpanded ? "bg-terracotta-100" : "bg-terracotta-50",
        text: "text-terracotta-700",
        hover: "hover:bg-terracotta-100",
      },
      amber: {
        bg: isExpanded ? "bg-amber-100" : "bg-amber-50",
        text: "text-amber-700",
        hover: "hover:bg-amber-100",
      },
    };
    return colorMap[color] || colorMap.sage;
  };

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const items = actionPlan[section.key];
        if (!items || items.length === 0) return null;

        const isExpanded = expandedSection === section.key;
        const colors = getColorClasses(section.color, isExpanded);

        return (
          <motion.div
            key={section.key}
            className={`rounded-2xl border-2 transition-all duration-300 ${
              isExpanded ? "border-" + section.color + "-200" : "border-gray-200"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => toggleSection(section.key)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${colors.bg} ${colors.hover}`}
            >
              <div className="flex items-center gap-3">
                <div className={colors.text}>{section.icon}</div>
                <span className={`font-display font-semibold ${colors.text}`}>
                  {section.label}
                </span>
                <span className="text-sm text-gray-500">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className={colors.text}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-2">
                    <ul className="space-y-2">
                      {items.map((item, index) => (
                        <motion.li
                          key={index}
                          className="flex gap-3 text-sage-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <span className="text-sage-400 mt-1">•</span>
                          <span className="flex-1 leading-relaxed">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
