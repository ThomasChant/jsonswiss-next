"use client";

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string[];
  nodeData: any;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  path,
  nodeData,
  onConfirm
}: ConfirmDeleteDialogProps) {

  // Format node content for preview
  const formatNodePreview = (data: any): string => {
    if (data === null || data === undefined) {
      return 'null';
    }
    
    if (typeof data === 'string') {
      return `"${data}"`;
    }
    
    if (typeof data === 'object') {
      try {
        const preview = JSON.stringify(data, null, 2);
        // Truncate if too long
        if (preview.length > 200) {
          return preview.substring(0, 200) + '...';
        }
        return preview;
      } catch {
        return '[Object]';
      }
    }
    
    return String(data);
  };

  const handleConfirm = useCallback(() => {
    onConfirm();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [handleConfirm, handleCancel]);

  const nodePath = path.length > 0 ? path.join(' → ') : 'Root';
  const nodePreview = formatNodePreview(nodeData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" onKeyDown={handleKeyDown}>
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Confirm Delete Node
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Warning message */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              Are you sure you want to delete the following node? This action cannot be undone.
            </p>
          </div>

          {/* Node path display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Node Path
            </Label>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-sm font-mono text-slate-700 dark:text-slate-300">
              {nodePath}
            </div>
          </div>

          {/* Node content preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Node Content Preview
            </Label>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border font-mono text-sm text-slate-800 dark:text-slate-200 max-h-40 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words">{nodePreview}</pre>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Node
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;