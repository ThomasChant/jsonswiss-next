// Animation utility functions for Framer Motion
import type { Variants, Transition } from 'framer-motion';
import { 
  fadeVariants, 
  slideVariants, 
  scaleVariants, 
  heightVariants,
  animationTimings,
  easings,
  type TimingType,
  type EasingType,
  type MotionPreferences
} from '@/types/animations';

/**
 * Checks if the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Gets motion preferences from localStorage or defaults
 */
export const getMotionPreferences = (): MotionPreferences => {
  if (typeof window === 'undefined') {
    return {
      reducedMotion: false,
      disableAnimations: false,
      preference: 'full'
    };
  }

  const stored = localStorage.getItem('motion-preferences');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to defaults
    }
  }

  const systemReducedMotion = prefersReducedMotion();
  return {
    reducedMotion: systemReducedMotion,
    disableAnimations: false,
    preference: systemReducedMotion ? 'reduced' : 'full'
  };
};

/**
 * Saves motion preferences to localStorage
 */
export const saveMotionPreferences = (preferences: MotionPreferences): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('motion-preferences', JSON.stringify(preferences));
};

/**
 * Creates a transition object based on preferences
 */
export const createTransition = (
  timing: TimingType = 'normal',
  easing: EasingType = 'easeOut',
  reducedMotion = false
): Transition => {
  if (reducedMotion) {
    return { duration: 0.01 };
  }

  return {
    ...animationTimings[timing],
    ease: easings[easing],
  };
};

/**
 * Gets the appropriate variants based on motion preferences
 */
export const getVariants = (
  type: 'fade' | 'slide' | 'scale' | 'height',
  reducedMotion = false
): Variants => {
  const baseVariants = {
    fade: fadeVariants,
    slide: slideVariants,
    scale: scaleVariants,
    height: heightVariants,
  }[type];

  if (reducedMotion) {
    // Return variants with instant transitions for reduced motion
    return {
      initial: baseVariants.initial,
      animate: baseVariants.animate,
      exit: baseVariants.exit,
    };
  }

  return baseVariants;
};

/**
 * Creates custom variants with motion preferences applied
 */
export const createCustomVariants = (
  variants: Variants,
  preferences: MotionPreferences
): Variants => {
  if (preferences.reducedMotion || preferences.disableAnimations) {
    // Strip out animation properties for reduced motion
    const processTarget = (target: any) => {
      if (typeof target === 'object' && target !== null) {
        const { opacity, ...rest } = target;
        // Keep opacity changes but remove motion
        return opacity !== undefined ? { opacity } : {};
      }
      return target;
    };

    return Object.entries(variants).reduce((acc, [key, value]) => {
      acc[key] = processTarget(value);
      return acc;
    }, {} as Variants);
  }

  return variants;
};

/**
 * Animation hook factory for consistent motion handling
 */
export const withMotionPreferences = <T extends object>(
  variants: Variants,
  transition?: Transition
) => {
  return (props: T & { reducedMotion?: boolean }) => {
    const preferences = getMotionPreferences();
    const shouldReduceMotion = props.reducedMotion ?? preferences.reducedMotion;
    
    return {
      variants: createCustomVariants(variants, {
        ...preferences,
        reducedMotion: shouldReduceMotion
      }),
      transition: shouldReduceMotion 
        ? { duration: 0.01 } 
        : transition || createTransition('normal'),
      initial: "initial",
      animate: "animate",
      exit: "exit",
    };
  };
};

/**
 * Debounced animation trigger to prevent excessive animations
 */
export const createAnimationDebouncer = (delay: number = 100) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (callback: () => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(callback, delay);
  };
};

/**
 * Animation performance monitor
 */
export class AnimationPerformanceMonitor {
  private static instance: AnimationPerformanceMonitor;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fps = 60;
  
  static getInstance(): AnimationPerformanceMonitor {
    if (!AnimationPerformanceMonitor.instance) {
      AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor();
    }
    return AnimationPerformanceMonitor.instance;
  }

  startMonitoring(): void {
    const updateFPS = () => {
      const now = performance.now();
      this.frameCount++;
      
      if (now - this.lastFrameTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        this.frameCount = 0;
        this.lastFrameTime = now;
        
        // Warn if FPS drops below 30
        if (this.fps < 30) {
          console.warn(`Animation performance degraded: ${this.fps} FPS`);
        }
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    requestAnimationFrame(updateFPS);
  }

  getCurrentFPS(): number {
    return this.fps;
  }
}

// Export commonly used preset configurations
export const presetAnimations = {
  fadeIn: withMotionPreferences(fadeVariants, createTransition('normal', 'easeOut')),
  slideIn: withMotionPreferences(slideVariants, createTransition('normal', 'easeOut')),
  scaleIn: withMotionPreferences(scaleVariants, createTransition('normal', 'bounce')),
  expandHeight: withMotionPreferences(heightVariants, createTransition('normal', 'easeOut')),
} as const;