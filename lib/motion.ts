/**
 * Motion configuration utilities for consistent iOS-like animations
 * Uses Framer Motion for smooth, delightful interactions
 */

import { Variants } from "framer-motion";

// Easing curves that match iOS animations
export const EASE_IOS = [0.25, 0.1, 0.25, 1] as const; // iOS default ease
export const EASE_IOS_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};
export const EASE_SMOOTH = [0.4, 0.0, 0.2, 1] as const; // Material smooth
export const EASE_BOUNCE = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

// Duration presets
export const DURATION = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
};

/**
 * Page transition variants
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: DURATION.normal,
      ease: EASE_IOS,
    },
  },
};

/**
 * Fade in variants
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASE_IOS,
    },
  },
};

/**
 * Fade in from bottom (iOS style)
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};

/**
 * Scale in variants (great for modals, cards)
 */
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASE_IOS,
    },
  },
};

/**
 * Staggered children container
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Staggered children container (faster)
 */
export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

/**
 * Item for staggered animations
 */
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};

/**
 * Card hover effect
 */
export const cardHover = {
  rest: {
    scale: 1,
    transition: {
      duration: DURATION.fast,
      ease: EASE_IOS,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: DURATION.fast,
      ease: EASE_IOS,
    },
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * Expand/collapse variants (for accordions)
 */
export const expandCollapse: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: DURATION.normal,
      ease: EASE_IOS,
    },
  },
  expanded: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};

/**
 * Chart drawing animation
 */
export const chartDraw: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: DURATION.slower,
        ease: EASE_IOS,
      },
      opacity: {
        duration: DURATION.fast,
      },
    },
  },
};

/**
 * Number counter animation
 */
export const numberCounter = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.normal,
      ease: EASE_IOS,
    },
  },
};

/**
 * Gentle bounce on mount
 */
export const bounceIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: EASE_BOUNCE,
  },
};

/**
 * Rotate in (for icons, loaders)
 */
export const rotateIn: Variants = {
  initial: {
    opacity: 0,
    rotate: -180,
  },
  animate: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};

/**
 * Header navigation variants
 */
export const headerVariants: Variants = {
  initial: {
    y: -100,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};

/**
 * Helper function to create custom stagger delays
 */
export function createStaggerDelay(index: number, baseDelay = 0.05): number {
  return index * baseDelay;
}

/**
 * Helper to create scroll-triggered animation config
 */
export const scrollTrigger = {
  viewport: { once: true, margin: "-100px" },
};

/**
 * Preset for scroll-triggered fade in
 */
export const scrollFadeIn: Variants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};

/**
 * Preset for scroll-triggered scale in
 */
export const scrollScaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  whileInView: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.slow,
      ease: EASE_IOS,
    },
  },
};
