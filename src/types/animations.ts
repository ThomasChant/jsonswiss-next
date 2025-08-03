// Animation types and interfaces for Framer Motion integration
import type { Variants, Target, Transition, MotionProps } from 'framer-motion';

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  type?: 'fade' | 'slide' | 'scale' | 'height' | 'scaleReverse';
  onComplete?: () => void;
}

export interface AnimationVariants {
  initial: Target;
  animate: Target;
  exit?: Target;
  transition?: Transition;
}

export interface MotionPreferences {
  reducedMotion: boolean;
  disableAnimations: boolean;
  preference: 'full' | 'reduced' | 'none';
}

export interface AnimationInstance {
  id: string;
  element?: HTMLElement;
  config: AnimationConfig;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime: number;
  controls?: any; // Framer Motion controls
}

// Common animation variants
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideVariants: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

export const scaleVariants: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

export const heightVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

// Animation timing presets
export const animationTimings = {
  fast: { duration: 0.15 },
  normal: { duration: 0.25 },
  slow: { duration: 0.4 },
} as const;

// Easing presets
export const easings = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

export type EasingType = keyof typeof easings;
export type TimingType = keyof typeof animationTimings;

// Enhanced motion props interface
export interface EnhancedMotionProps extends MotionProps {
  reducedMotion?: boolean;
  animationSpeed?: TimingType;
  customVariants?: Variants;
}