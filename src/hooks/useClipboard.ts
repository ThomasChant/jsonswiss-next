import { useState, useCallback } from 'react';
import { toast } from '@/lib/toast';

interface UseClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  isLoading: boolean;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const {
    successMessage = 'Copied to clipboard',
    errorMessage = 'Failed to copy to clipboard',
    timeout = 2000,
  } = options;

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!text) {
      toast.error('Nothing to copy');
      return false;
    }

    setIsLoading(true);
    
    try {
      // Check if clipboard API is available
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!success) {
          throw new Error('Fallback copy method failed');
        }
      }

      setCopied(true);
      toast.success(successMessage);
      
      // Reset copied state after timeout
      setTimeout(() => setCopied(false), timeout);
      
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [successMessage, errorMessage, timeout]);

  return { copy, copied, isLoading };
}