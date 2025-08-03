"use client";

import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    resetError: () => void;
    retry: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show error toast
    toast.error('An unexpected error occurred');
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  retry = () => {
    this.resetError();
    // Force re-render by updating key or refreshing page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const CustomFallback = this.props.fallback;
      
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error}
            resetError={this.resetError}
            retry={this.retry}
          />
        );
      }

      return <DefaultErrorFallback 
        error={this.state.error} 
        resetError={this.resetError}
        retry={this.retry}
      />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  retry: () => void;
}

function DefaultErrorFallback({ error, resetError, retry }: DefaultErrorFallbackProps) {
  const handleReportError = () => {
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        toast.success('Error report copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy error report');
      });
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        
        <p className="text-muted-foreground mb-4">
          An unexpected error occurred. We apologize for the inconvenience.
        </p>
        
        {error && (
          <div className="bg-muted p-3 rounded text-sm text-left mb-4 max-h-32 overflow-y-auto">
            <code className="text-destructive font-mono">
              {error.message}
            </code>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex gap-2 justify-center">
            <Button onClick={resetError} variant="outline" size="sm">
              Try Again
            </Button>
            <Button onClick={retry} size="sm">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={goHome} variant="ghost" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button onClick={handleReportError} variant="ghost" size="sm">
              Report Issue
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          If this problem persists, please try refreshing the page or clearing your browser cache.
        </p>
      </div>
    </div>
  );
}

export { ErrorBoundary };