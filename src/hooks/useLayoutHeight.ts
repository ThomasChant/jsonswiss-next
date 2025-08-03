import { useRef, useLayoutEffect, useCallback, useMemo } from 'react';

export interface LayoutHeightOptions {
  cssVariable: string;
  minHeight?: number;
  maxHeight?: number;
  fallbackHeight?: number;
  debounceMs?: number;
  enableDebug?: boolean;
}

export interface LayoutHeightReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  currentHeight: number;
  isCalculating: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing dynamic layout height calculation
 * Provides robust height tracking with error handling and fallback mechanisms
 */
export function useLayoutHeight(options: LayoutHeightOptions): LayoutHeightReturn {
  const {
    cssVariable,
    minHeight = 100,
    maxHeight = Number.MAX_SAFE_INTEGER,
    fallbackHeight = 200,
    debounceMs = 16,
    enableDebug = false
  } = options;

  const elementRef = useRef<HTMLDivElement | null>(null);
  const currentHeightRef = useRef<number>(fallbackHeight);
  const isCalculatingRef = useRef<boolean>(false);
  const errorRef = useRef<Error | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const resizeObserverRef = useRef<ResizeObserver | undefined>(undefined);
  const retryCountRef = useRef<number>(0);

  const maxRetries = 3;

  // Debug logger
  const debug = useCallback((message: string, data?: any) => {
    if (enableDebug) {
      console.log(`[useLayoutHeight:${cssVariable}] ${message}`, data || '');
    }
  }, [enableDebug, cssVariable]);

  // Validate height value
  const validateHeight = useCallback((height: number): number => {
    if (typeof height !== 'number' || isNaN(height) || height < 0) {
      debug('Invalid height detected, using fallback', { height, fallback: fallbackHeight });
      return fallbackHeight;
    }
    
    const clampedHeight = Math.max(minHeight, Math.min(maxHeight, height));
    if (clampedHeight !== height) {
      debug('Height clamped', { original: height, clamped: clampedHeight });
    }
    
    return clampedHeight;
  }, [minHeight, maxHeight, fallbackHeight, debug]);

  // Update CSS variable with validation and error handling
  const updateCSSVariable = useCallback((height: number) => {
    try {
      const validatedHeight = validateHeight(height);
      const heightValue = `${validatedHeight}px`;
      
      // Use requestAnimationFrame to ensure proper timing
      requestAnimationFrame(() => {
        try {
          document.documentElement.style.setProperty(cssVariable, heightValue);
          currentHeightRef.current = validatedHeight;
          retryCountRef.current = 0; // Reset retry count on success
          
          debug('CSS variable updated successfully', { 
            variable: cssVariable, 
            height: validatedHeight 
          });
          
          // Verify the CSS variable was set correctly
          const computedValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariable);
          if (computedValue !== heightValue) {
            debug('CSS variable verification failed', { 
              expected: heightValue, 
              actual: computedValue 
            });
          }
        } catch (error) {
          debug('Failed to set CSS variable', error);
          errorRef.current = error as Error;
        }
      });
    } catch (error) {
      debug('Failed to validate height', error);
      errorRef.current = error as Error;
    }
  }, [cssVariable, validateHeight, debug]);

  // Calculate height with retry mechanism
  const calculateHeight = useCallback(() => {
    if (!elementRef.current) {
      debug('Element ref not available');
      return;
    }

    isCalculatingRef.current = true;
    errorRef.current = null;

    try {
      // Get element dimensions
      const rect = elementRef.current.getBoundingClientRect();
      const height = elementRef.current.offsetHeight || rect.height;
      
      debug('Height calculated', { 
        offsetHeight: elementRef.current.offsetHeight,
        rectHeight: rect.height,
        finalHeight: height
      });

      if (height > 0) {
        updateCSSVariable(height);
      } else if (retryCountRef.current < maxRetries) {
        // Retry after a short delay if height is 0
        retryCountRef.current++;
        debug(`Height is 0, retrying (${retryCountRef.current}/${maxRetries})`);
        
        setTimeout(() => {
          calculateHeight();
        }, 50 * retryCountRef.current); // Exponential backoff
      } else {
        debug('Max retries reached, using fallback height');
        updateCSSVariable(fallbackHeight);
      }
    } catch (error) {
      debug('Error calculating height', error);
      errorRef.current = error as Error;
      updateCSSVariable(fallbackHeight);
    } finally {
      isCalculatingRef.current = false;
    }
  }, [updateCSSVariable, fallbackHeight, debug, maxRetries]);

  // Debounced height calculation
  const debouncedCalculateHeight = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      calculateHeight();
    }, debounceMs);
  }, [calculateHeight, debounceMs]);

  // Setup ResizeObserver
  const setupResizeObserver = useCallback(() => {
    if (!elementRef.current) return;

    try {
      // Clean up existing observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      // Create new observer
      resizeObserverRef.current = new ResizeObserver((entries) => {
        debug('ResizeObserver triggered', { entriesCount: entries.length });
        debouncedCalculateHeight();
      });

      // Start observing
      resizeObserverRef.current.observe(elementRef.current);
      debug('ResizeObserver setup complete');
    } catch (error) {
      debug('Failed to setup ResizeObserver', error);
      errorRef.current = error as Error;
    }
  }, [debouncedCalculateHeight, debug]);

  // Initialize height calculation
  useLayoutEffect(() => {
    debug('Hook initialized');
    
    // Initial height calculation
    calculateHeight();
    
    // Setup observer
    setupResizeObserver();
    
    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      debug('Hook cleaned up');
    };
  }, [calculateHeight, setupResizeObserver, debug]);

  // Return values with memoization for performance
  return useMemo(() => ({
    ref: elementRef,
    currentHeight: currentHeightRef.current,
    isCalculating: isCalculatingRef.current,
    error: errorRef.current
  }), []);
}

/**
 * Specialized hook for title section height tracking
 */
export function useTitleHeight(enableDebug = false) {
  return useLayoutHeight({
    cssVariable: '--title-section-height',
    minHeight: 50,
    maxHeight: 300,
    fallbackHeight: 64, // 4rem default
    enableDebug
  });
}

/**
 * Specialized hook for FAQ section height tracking
 */
export function useFaqHeight(enableDebug = false) {
  return useLayoutHeight({
    cssVariable: '--faq-section-height',
    minHeight: 0,
    maxHeight: 800,
    fallbackHeight: 0,
    enableDebug
  });
}

/**
 * Specialized hook for core area height management
 * Monitors header and title section heights and updates core area heights accordingly
 */
export function useCoreAreaHeight(enableDebug = false) {
  const debug = useCallback((message: string, data?: any) => {
    if (enableDebug || process.env.NODE_ENV === 'development') {
      console.log(`[useCoreAreaHeight] ${message}`, data || '');
    }
  }, [enableDebug]);

  // Update core area heights when dependencies change
  const updateCoreAreaHeights = useCallback(() => {
    try {
      const style = getComputedStyle(document.documentElement);
      const headerHeight = style.getPropertyValue('--header-height');
      const titleHeight = style.getPropertyValue('--title-section-height');
      
      debug('Updating core area heights', { headerHeight, titleHeight });
      
      // Calculate the three core area heights
      const minHeight = `calc(100vh - ${headerHeight} - ${titleHeight})`;
      const maxHeight = `calc(100vh - ${headerHeight})`;
      const defaultHeight = `calc(100vh - ${headerHeight} - ${titleHeight})`;
      
      // Set the CSS variables
      document.documentElement.style.setProperty('--core-area-min-height', minHeight);
      document.documentElement.style.setProperty('--core-area-max-height', maxHeight);
      document.documentElement.style.setProperty('--core-area-default-height', defaultHeight);
      
      debug('Core area heights updated', { minHeight, maxHeight, defaultHeight });
    } catch (error) {
      debug('Failed to update core area heights', error);
    }
  }, [debug]);

  // Setup mutation observer to watch for CSS variable changes
  useLayoutEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          if (target === document.documentElement) {
            const style = target.style;
            if (style.getPropertyValue('--header-height') || style.getPropertyValue('--title-section-height')) {
              shouldUpdate = true;
            }
          }
        }
      });
      
      if (shouldUpdate) {
        // Use requestAnimationFrame to ensure DOM updates are complete
        requestAnimationFrame(() => {
          updateCoreAreaHeights();
        });
      }
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Initial update
    updateCoreAreaHeights();

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [updateCoreAreaHeights]);

  // Return utilities for getting current heights
  return useMemo(() => ({
    updateCoreAreaHeights,
    getCurrentHeights: () => {
      const style = getComputedStyle(document.documentElement);
      return {
        minHeight: style.getPropertyValue('--core-area-min-height'),
        maxHeight: style.getPropertyValue('--core-area-max-height'),
        defaultHeight: style.getPropertyValue('--core-area-default-height')
      };
    }
  }), [updateCoreAreaHeights]);
}

/**
 * Utility function to reset all layout height variables to safe defaults
 */
export function resetLayoutHeights() {
  const defaults = {
    '--header-height': '4rem',
    '--title-section-height': '4rem',
    '--faq-section-height': '0px',
    '--core-area-min-height': 'calc(100vh - 4rem - 4rem)',
    '--core-area-max-height': 'calc(100vh - 4rem)',
    '--core-area-default-height': 'calc(100vh - 4rem - 4rem)'
  };

  Object.entries(defaults).forEach(([variable, value]) => {
    document.documentElement.style.setProperty(variable, value);
  });
}

/**
 * Utility function to manually set core area heights
 */
export function setCoreAreaHeights(headerHeight: string, titleHeight: string) {
  const minHeight = `calc(100vh - ${headerHeight} - ${titleHeight})`;
  const maxHeight = `calc(100vh - ${headerHeight})`;
  const defaultHeight = `calc(100vh - ${headerHeight} - ${titleHeight})`;
  
  document.documentElement.style.setProperty('--core-area-min-height', minHeight);
  document.documentElement.style.setProperty('--core-area-max-height', maxHeight);
  document.documentElement.style.setProperty('--core-area-default-height', defaultHeight);
}

/**
 * Specialized hook for JSON Table Editor height management
 * Sets all heights (default, min, max) to screen height minus header height
 */
export function useJsonTableEditorHeight(enableDebug = false) {
  const debug = useCallback((message: string, data?: any) => {
    if (enableDebug || process.env.NODE_ENV === 'development') {
      console.log(`[useJsonTableEditorHeight] ${message}`, data || '');
    }
  }, [enableDebug]);

  // Update JSON Table Editor heights when header height changes
  const updateJsonTableEditorHeights = useCallback(() => {
    try {
      const style = getComputedStyle(document.documentElement);
      const headerHeight = style.getPropertyValue('--header-height');
      
      debug('Updating JSON Table Editor heights', { headerHeight });
      
      // Calculate height as screen height minus header height
      const height = `calc(100vh - ${headerHeight})`;
      
      // Set all three height variables to the same value
      document.documentElement.style.setProperty('--json-table-editor-height', height);
      document.documentElement.style.setProperty('--json-table-editor-min-height', height);
      document.documentElement.style.setProperty('--json-table-editor-max-height', height);
      
      debug('JSON Table Editor heights updated', { height });
      
      // Verify the variables were set correctly
      const verifyHeight = getComputedStyle(document.documentElement).getPropertyValue('--json-table-editor-height');
      debug('Verification - CSS variables set:', { 
        expected: height, 
        actual: verifyHeight,
        headerHeight: headerHeight 
      });
    } catch (error) {
      debug('Failed to update JSON Table Editor heights', error);
    }
  }, [debug]);

  // Setup mutation observer to watch for header height changes
  useLayoutEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          if (target === document.documentElement) {
            const style = target.style;
            if (style.getPropertyValue('--header-height')) {
              shouldUpdate = true;
            }
          }
        }
      });
      
      if (shouldUpdate) {
        requestAnimationFrame(() => {
          updateJsonTableEditorHeights();
        });
      }
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Initial update
    updateJsonTableEditorHeights();

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [updateJsonTableEditorHeights]);

  return useMemo(() => ({
    updateJsonTableEditorHeights,
    getCurrentHeights: () => {
      const style = getComputedStyle(document.documentElement);
      return {
        height: style.getPropertyValue('--json-table-editor-height'),
        minHeight: style.getPropertyValue('--json-table-editor-min-height'),
        maxHeight: style.getPropertyValue('--json-table-editor-max-height')
      };
    }
  }), [updateJsonTableEditorHeights]);
}

/**
 * Utility function to get current layout height values
 */
export function getLayoutHeights() {
  const style = getComputedStyle(document.documentElement);
  return {
    header: style.getPropertyValue('--header-height'),
    title: style.getPropertyValue('--title-section-height'),
    faq: style.getPropertyValue('--faq-section-height'),
    core: style.getPropertyValue('--core-area-height'),
    coreMin: style.getPropertyValue('--core-area-min-height'),
    coreMax: style.getPropertyValue('--core-area-max-height'),
    coreDefault: style.getPropertyValue('--core-area-default-height'),
    jsonTableEditor: style.getPropertyValue('--json-table-editor-height'),
    jsonTableEditorMin: style.getPropertyValue('--json-table-editor-min-height'),
    jsonTableEditorMax: style.getPropertyValue('--json-table-editor-max-height')
  };
}