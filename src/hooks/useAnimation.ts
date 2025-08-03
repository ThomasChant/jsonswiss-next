"use client";

import { useCallback, useEffect, useRef } from 'react';
import { animationController } from '@/services/AnimationController';
import { AnimationConfig } from '@/types/animations';

export interface UseAnimationReturn {
  animateViewTransition: (from: 'table', to: 'table') => Promise<void>;
  animateModalOpen: (modalId: string, config?: AnimationConfig) => Promise<void>;
  animateModalClose: (modalId: string) => Promise<void>;
  animateButtonHover: (state: 'enter' | 'leave') => void;
  animateTreeNodeExpansion: (nodeId: string, expanded: boolean) => Promise<void>;
  animateThemeTransition: (newTheme: 'light' | 'dark') => Promise<void>;
  respectsReducedMotion: () => boolean;
  setAnimationPreference: (preference: 'full' | 'reduced' | 'none') => void;
}

export function useAnimation(elementRef?: React.RefObject<HTMLElement | null>): UseAnimationReturn {
  const animateViewTransition = useCallback(async (from: 'table', to: 'table') => {
    return animationController.animateViewTransition(from, to);
  }, []);

  const animateModalOpen = useCallback(async (modalId: string, config?: AnimationConfig) => {
    return animationController.animateModalOpen(modalId, config);
  }, []);

  const animateModalClose = useCallback(async (modalId: string) => {
    return animationController.animateModalClose(modalId);
  }, []);

  const animateButtonHover = useCallback((state: 'enter' | 'leave') => {
    if (elementRef?.current) {
      animationController.animateButtonHover(elementRef.current, state);
    }
  }, [elementRef]);

  const animateTreeNodeExpansion = useCallback(async (nodeId: string, expanded: boolean) => {
    return animationController.animateTreeNodeExpansion(nodeId, expanded);
  }, []);

  const animateThemeTransition = useCallback(async (newTheme: 'light' | 'dark') => {
    return animationController.animateThemeTransition(newTheme);
  }, []);

  const respectsReducedMotion = useCallback(() => {
    return animationController.respectsReducedMotion();
  }, []);

  const setAnimationPreference = useCallback((preference: 'full' | 'reduced' | 'none') => {
    animationController.setGlobalAnimationPreference(preference);
  }, []);

  return {
    animateViewTransition,
    animateModalOpen,
    animateModalClose,
    animateButtonHover,
    animateTreeNodeExpansion,
    animateThemeTransition,
    respectsReducedMotion,
    setAnimationPreference
  };
}

export function useButtonAnimation(buttonRef: React.RefObject<HTMLElement | null>) {
  const { animateButtonHover } = useAnimation(buttonRef);

  const handleMouseEnter = useCallback(() => {
    animateButtonHover('enter');
  }, [animateButtonHover]);

  const handleMouseLeave = useCallback(() => {
    animateButtonHover('leave');
  }, [animateButtonHover]);

  return {
    handleMouseEnter,
    handleMouseLeave,
    animateButtonHover
  };
}

export function useViewTransition() {
  const { animateViewTransition } = useAnimation();
  const transitioningRef = useRef(false);

  const transitionTo = useCallback(async (from: 'table', to: 'table') => {
    if (transitioningRef.current || from === to) return false;
    
    try {
      transitioningRef.current = true;
      await animateViewTransition(from, to);
      return true;
    } catch (error) {
      console.error('View transition failed:', error);
      return false;
    } finally {
      transitioningRef.current = false;
    }
  }, [animateViewTransition]);

  return {
    transitionTo,
    isTransitioning: transitioningRef.current
  };
}

export function useModalAnimation(modalId: string) {
  const { animateModalOpen, animateModalClose } = useAnimation();

  const openModal = useCallback(async (config?: AnimationConfig) => {
    return animateModalOpen(modalId, config);
  }, [modalId, animateModalOpen]);

  const closeModal = useCallback(async () => {
    return animateModalClose(modalId);
  }, [modalId, animateModalClose]);

  return {
    openModal,
    closeModal
  };
}

export function useTreeNodeAnimation() {
  const { animateTreeNodeExpansion } = useAnimation();
  const expandingNodes = useRef(new Set<string>());

  const toggleNode = useCallback(async (nodeId: string, expanded: boolean) => {
    if (expandingNodes.current.has(nodeId)) return false;
    
    try {
      expandingNodes.current.add(nodeId);
      await animateTreeNodeExpansion(nodeId, expanded);
      return true;
    } catch (error) {
      console.error('Tree node animation failed:', error);
      return false;
    } finally {
      expandingNodes.current.delete(nodeId);
    }
  }, [animateTreeNodeExpansion]);

  return {
    toggleNode,
    isExpanding: (nodeId: string) => expandingNodes.current.has(nodeId)
  };
}

export function useThemeTransition() {
  const { animateThemeTransition } = useAnimation();
  const transitioningRef = useRef(false);

  const transitionTheme = useCallback(async (newTheme: 'light' | 'dark') => {
    if (transitioningRef.current) return false;
    
    try {
      transitioningRef.current = true;
      await animateThemeTransition(newTheme);
      return true;
    } catch (error) {
      console.error('Theme transition failed:', error);
      return false;
    } finally {
      transitioningRef.current = false;
    }
  }, [animateThemeTransition]);

  return {
    transitionTheme,
    isTransitioning: transitioningRef.current
  };
}

export function useAnimationPreference() {
  const { respectsReducedMotion, setAnimationPreference } = useAnimation();

  return {
    respectsReducedMotion,
    setAnimationPreference
  };
}