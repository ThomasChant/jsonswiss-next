"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { AlertTriangle, RefreshCcw, Home, Bug } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error('Application error:', error);
    
    // Show error toast
    toast.error('An application error occurred');
  }, [error]);

  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // Copy error report to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          toast.success('Error report copied to clipboard');
        })
        .catch(() => {
          toast.error('Failed to copy error report');
        });
    }
  };

  const goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const reloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="max-w-lg w-full bg-card border rounded-lg p-8 text-center">
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold mb-3">Application Error</h1>
        
        <p className="text-muted-foreground mb-6">
          Something went wrong with the JSON Swiss application. We apologize for the inconvenience.
        </p>
        
        {error.message && (
          <div className="bg-muted p-4 rounded-lg text-left mb-6 max-h-40 overflow-y-auto">
            <h3 className="font-semibold text-sm mb-2">Error Details:</h3>
            <code className="text-destructive font-mono text-sm break-all">
              {error.message}
            </code>
            {error.digest && (
              <div className="mt-2">
                <span className="text-muted-foreground text-xs">Error ID: </span>
                <code className="text-xs">{error.digest}</code>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="default">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={reloadPage} variant="outline">
              Reload Page
            </Button>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button onClick={goHome} variant="ghost">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            <Button onClick={handleReportError} variant="ghost">
              <Bug className="w-4 h-4 mr-2" />
              Copy Error Report
            </Button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">What you can try:</h3>
          <ul className="text-xs text-muted-foreground text-left space-y-1">
            <li>• Refresh the page to reload the application</li>
            <li>• Clear your browser cache and cookies</li>
            <li>• Try using a different browser or incognito mode</li>
            <li>• Check your internet connection</li>
            <li>• Report the issue if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}