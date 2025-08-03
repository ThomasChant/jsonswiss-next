import { AnimationConfig, MotionPreferences } from '@/types/animations';

interface AnimationInstance {
  id: string;
  element: HTMLElement;
  config: AnimationConfig;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime: number;
  controls?: any; // Framer Motion controls
}

export class AnimationController {
  private currentAnimations = new Map<string, AnimationInstance>();
  private motionPreferences: MotionPreferences;
  private performanceMonitor?: AnimationPerformanceMonitor;

  constructor() {
    this.motionPreferences = this.detectMotionPreferences();
    this.performanceMonitor = new AnimationPerformanceMonitor();
    
    // Listen for changes in motion preferences
    this.setupMotionPreferenceListeners();
  }

  // Transition animations
  async animateViewTransition(from: 'table', to: 'table'): Promise<void> {
    if (!this.shouldAnimate()) {
      return Promise.resolve();
    }

    const animationId = `view-transition-${Date.now()}`;
    const config: AnimationConfig = {
      duration: this.motionPreferences.reducedMotion ? 100 : 250,
      easing: 'easeInOut',
      type: 'fade'
    };

    try {
      this.startAnimation(animationId, config);
      
      // Perform the actual transition animation
      await this.performViewTransition(from, to, config);
      
      this.completeAnimation(animationId);
    } catch (error) {
      console.error('View transition animation failed:', error);
      this.cancelAnimation(animationId);
    }
  }

  async animateModalOpen(modalId: string, config?: AnimationConfig): Promise<void> {
    if (!this.shouldAnimate()) {
      return Promise.resolve();
    }

    const defaultConfig: AnimationConfig = {
      duration: this.motionPreferences.reducedMotion ? 150 : 300,
      easing: 'easeOut',
      type: 'fade'
    };

    const finalConfig = { ...defaultConfig, ...config };
    const animationId = `modal-open-${modalId}`;

    try {
      this.startAnimation(animationId, finalConfig);
      await this.performModalAnimation(modalId, 'open', finalConfig);
      this.completeAnimation(animationId);
    } catch (error) {
      console.error('Modal open animation failed:', error);
      this.cancelAnimation(animationId);
    }
  }

  async animateModalClose(modalId: string): Promise<void> {
    if (!this.shouldAnimate()) {
      return Promise.resolve();
    }

    const config: AnimationConfig = {
      duration: this.motionPreferences.reducedMotion ? 100 : 200,
      easing: 'easeIn',
      type: 'fade'
    };

    const animationId = `modal-close-${modalId}`;

    try {
      this.startAnimation(animationId, config);
      await this.performModalAnimation(modalId, 'close', config);
      this.completeAnimation(animationId);
    } catch (error) {
      console.error('Modal close animation failed:', error);
      this.cancelAnimation(animationId);
    }
  }

  // Micro-interactions
  animateButtonHover(element: HTMLElement, state: 'enter' | 'leave'): void {
    if (!this.shouldAnimate() || !element) return;

    const animationId = `button-hover-${element.id || Date.now()}`;
    const config: AnimationConfig = {
      duration: this.motionPreferences.reducedMotion ? 100 : 150,
      easing: 'easeOut',
      type: state === 'enter' ? 'scale' : 'scaleReverse'
    };

    this.performButtonHoverAnimation(element, state, config);
  }

  async animateTreeNodeExpansion(nodeId: string, expanded: boolean): Promise<void> {
    if (!this.shouldAnimate()) {
      return Promise.resolve();
    }

    const config: AnimationConfig = {
      duration: this.motionPreferences.reducedMotion ? 100 : 150,
      easing: 'easeOut',
      type: 'height'
    };

    const animationId = `tree-node-${nodeId}-${expanded ? 'expand' : 'collapse'}`;

    try {
      this.startAnimation(animationId, config);
      await this.performTreeNodeAnimation(nodeId, expanded, config);
      this.completeAnimation(animationId);
    } catch (error) {
      console.error('Tree node animation failed:', error);
      this.cancelAnimation(animationId);
    }
  }

  // Theme transitions
  async animateThemeTransition(newTheme: 'light' | 'dark'): Promise<void> {
    if (!this.shouldAnimate()) {
      return Promise.resolve();
    }

    const config: AnimationConfig = {
      duration: this.motionPreferences.reducedMotion ? 200 : 400,
      easing: 'easeInOut',
      type: 'fade'
    };

    const animationId = `theme-transition-${newTheme}`;

    try {
      this.startAnimation(animationId, config);
      await this.performThemeTransition(newTheme, config);
      this.completeAnimation(animationId);
    } catch (error) {
      console.error('Theme transition animation failed:', error);
      this.cancelAnimation(animationId);
    }
  }

  // Performance and accessibility
  respectsReducedMotion(): boolean {
    return this.motionPreferences.reducedMotion;
  }

  setGlobalAnimationPreference(preference: 'full' | 'reduced' | 'none'): void {
    this.motionPreferences.preference = preference;
    this.motionPreferences.reducedMotion = preference === 'reduced' || preference === 'none';
    this.motionPreferences.disableAnimations = preference === 'none';

    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('animation-preference', preference);
    }
  }

  // Private helper methods
  private detectMotionPreferences(): MotionPreferences {
    if (typeof window === 'undefined') {
      return { reducedMotion: false, disableAnimations: false, preference: 'full' };
    }

    // Check for stored preference first
    const storedPreference = localStorage.getItem('animation-preference') as 'full' | 'reduced' | 'none' | null;
    if (storedPreference) {
      return {
        reducedMotion: storedPreference === 'reduced' || storedPreference === 'none',
        disableAnimations: storedPreference === 'none',
        preference: storedPreference
      };
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = mediaQuery.matches;

    return {
      reducedMotion,
      disableAnimations: false,
      preference: reducedMotion ? 'reduced' : 'full'
    };
  }

  private setupMotionPreferenceListeners(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('animation-preference')) {
        this.motionPreferences.reducedMotion = e.matches;
        this.motionPreferences.preference = e.matches ? 'reduced' : 'full';
      }
    });
  }

  private shouldAnimate(): boolean {
    return !this.motionPreferences.disableAnimations;
  }

  private startAnimation(id: string, config: AnimationConfig): void {
    const animation: AnimationInstance = {
      id,
      element: document.body, // Default element
      config,
      status: 'active',
      startTime: performance.now()
    };

    this.currentAnimations.set(id, animation);
    this.performanceMonitor?.startAnimation(id);
  }

  private completeAnimation(id: string): void {
    const animation = this.currentAnimations.get(id);
    if (animation) {
      animation.status = 'completed';
      this.performanceMonitor?.endAnimation(id);
      this.currentAnimations.delete(id);
    }
  }

  private cancelAnimation(id: string): void {
    const animation = this.currentAnimations.get(id);
    if (animation) {
      animation.status = 'cancelled';
      this.performanceMonitor?.cancelAnimation(id);
      this.currentAnimations.delete(id);
    }
  }

  private async performViewTransition(from: 'table', to: 'table', config: AnimationConfig): Promise<void> {
    // Find the view container elements
    const currentViewElement = document.querySelector(`[data-view="${from}"]`) as HTMLElement;
    const newViewElement = document.querySelector(`[data-view="${to}"]`) as HTMLElement;
    
    if (!currentViewElement && !newViewElement) {
      // If no specific view elements found, just wait for the configured duration
      return new Promise(resolve => {
        setTimeout(resolve, config.duration || 250);
      });
    }

    return new Promise((resolve) => {
      let animationsCompleted = 0;
      const totalAnimations = (currentViewElement ? 1 : 0) + (newViewElement ? 1 : 0);
      
      const checkComplete = () => {
        animationsCompleted++;
        if (animationsCompleted >= totalAnimations) {
          resolve();
        }
      };

      // Animate out the current view
      if (currentViewElement) {
        currentViewElement.style.transition = `opacity ${config.duration}ms ${config.easing}, transform ${config.duration}ms ${config.easing}`;
        currentViewElement.style.opacity = '0';
        currentViewElement.style.transform = 'translateY(-10px) scale(0.98)';
        
        setTimeout(() => {
          currentViewElement.style.display = 'none';
          checkComplete();
        }, config.duration || 250);
      }

      // Animate in the new view
      if (newViewElement) {
        newViewElement.style.display = 'block';
        newViewElement.style.opacity = '0';
        newViewElement.style.transform = 'translateY(10px) scale(0.98)';
        newViewElement.style.transition = `opacity ${config.duration}ms ${config.easing}, transform ${config.duration}ms ${config.easing}`;
        
        // Trigger reflow to ensure initial styles are applied
        newViewElement.offsetHeight;
        
        setTimeout(() => {
          newViewElement.style.opacity = '1';
          newViewElement.style.transform = 'translateY(0) scale(1)';
          
          setTimeout(() => {
            // Clean up transition styles
            newViewElement.style.transition = '';
            checkComplete();
          }, config.duration || 250);
        }, 50); // Small delay to ensure proper sequencing
      }

      // Fallback timeout
      setTimeout(resolve, (config.duration || 250) + 100);
    });
  }

  private async performModalAnimation(modalId: string, action: 'open' | 'close', config: AnimationConfig): Promise<void> {
    // This will be implemented with actual DOM manipulation and Framer Motion
    return new Promise(resolve => {
      setTimeout(resolve, config.duration || 250);
    });
  }

  private performButtonHoverAnimation(element: HTMLElement, state: 'enter' | 'leave', config: AnimationConfig): void {
    if (state === 'enter') {
      element.style.transform = 'scale(1.02)';
      element.style.transition = `transform ${config.duration}ms ${config.easing}`;
    } else {
      element.style.transform = 'scale(1)';
    }
  }

  private async performTreeNodeAnimation(nodeId: string, expanded: boolean, config: AnimationConfig): Promise<void> {
    // This will be implemented with actual DOM manipulation
    return new Promise(resolve => {
      setTimeout(resolve, config.duration || 150);
    });
  }

  private async performThemeTransition(newTheme: 'light' | 'dark', config: AnimationConfig): Promise<void> {
    // This will be implemented with actual theme switching animation
    return new Promise(resolve => {
      setTimeout(resolve, config.duration || 400);
    });
  }

  // Public methods for debugging and monitoring
  getActiveAnimations(): AnimationInstance[] {
    return Array.from(this.currentAnimations.values());
  }

  getPerformanceStats() {
    return this.performanceMonitor?.getStats();
  }
}

class AnimationPerformanceMonitor {
  private animationStats = new Map<string, { start: number; end?: number; cancelled?: boolean }>();
  private frameDrops = 0;

  startAnimation(id: string): void {
    this.animationStats.set(id, { start: performance.now() });
  }

  endAnimation(id: string): void {
    const stats = this.animationStats.get(id);
    if (stats) {
      stats.end = performance.now();
    }
  }

  cancelAnimation(id: string): void {
    const stats = this.animationStats.get(id);
    if (stats) {
      stats.cancelled = true;
      stats.end = performance.now();
    }
  }

  getStats() {
    const completed = Array.from(this.animationStats.values()).filter(s => s.end && !s.cancelled);
    const cancelled = Array.from(this.animationStats.values()).filter(s => s.cancelled);
    
    const avgDuration = completed.length > 0 
      ? completed.reduce((sum, s) => sum + (s.end! - s.start), 0) / completed.length 
      : 0;

    return {
      totalAnimations: this.animationStats.size,
      completedAnimations: completed.length,
      cancelledAnimations: cancelled.length,
      averageDuration: avgDuration,
      frameDrops: this.frameDrops
    };
  }
}

// Singleton instance
export const animationController = new AnimationController();