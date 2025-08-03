"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useJsonStore } from '@/store/jsonStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { AlertCircle } from 'lucide-react';

export interface KeyRenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string;
  path: string[];
  existingKeys: string[];
  onRename?: (oldKey: string, newKey: string) => void;
}

export function KeyRenameDialog({
  open,
  onOpenChange,
  currentKey,
  path,
  existingKeys,
  onRename
}: KeyRenameDialogProps) {
  const { renameKeyAtPath } = useJsonStore();
  const [newKey, setNewKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Reset form when dialog opens/closes or currentKey changes
  useEffect(() => {
    if (open) {
      setNewKey(currentKey);
      setValidationError('');
    } else {
      setNewKey('');
      setValidationError('');
    }
  }, [open, currentKey]);

  // Validate new key name
  const validateNewKey = useCallback((key: string): string => {
    if (!key || key.trim() === '') {
      return 'Key name cannot be empty';
    }

    const trimmedKey = key.trim();

    if (trimmedKey === currentKey) {
      return 'New key name must be different from current name';
    }

    if (existingKeys.includes(trimmedKey)) {
      return `Key '${trimmedKey}' already exists`;
    }

    // Check for invalid characters
    if (trimmedKey.includes('.')) {
      return 'Key name cannot contain dots (.)';
    }

    if (trimmedKey.includes('[') || trimmedKey.includes(']')) {
      return 'Key name cannot contain square brackets ([ ])';
    }

    if (trimmedKey.includes('"') || trimmedKey.includes("'")) {
      return 'Key name cannot contain quotes';
    }

    if (trimmedKey.includes('\\') || trimmedKey.includes('/')) {
      return 'Key name cannot contain backslashes or forward slashes';
    }

    // Check for control characters
    if (/[\x00-\x1F\x7F]/.test(trimmedKey)) {
      return 'Key name cannot contain control characters';
    }

    // Check if it starts/ends with whitespace
    if (trimmedKey !== key) {
      return 'Key name cannot start or end with whitespace';
    }

    return '';
  }, [currentKey, existingKeys]);

  // Update validation when newKey changes
  useEffect(() => {
    if (newKey) {
      const error = validateNewKey(newKey);
      setValidationError(error);
    } else {
      setValidationError('');
    }
  }, [newKey, validateNewKey]);

  const handleRename = useCallback(async () => {
    if (!newKey || newKey.trim() === '') {
      setValidationError('Key name cannot be empty');
      return;
    }

    const trimmedNewKey = newKey.trim();
    const error = validateNewKey(trimmedNewKey);
    
    if (error) {
      setValidationError(error);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the store's rename function
      renameKeyAtPath(path, currentKey, trimmedNewKey);
      
      // Call the optional callback
      onRename?.(currentKey, trimmedNewKey);
      
      // Close the dialog
      onOpenChange(false);
      
    } catch (error) {
      // Error handling is done in the store, but we can show additional feedback here
      console.error('Rename failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [newKey, validateNewKey, renameKeyAtPath, path, currentKey, onRename, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !validationError && !isLoading) {
      e.preventDefault();
      handleRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [validationError, isLoading, handleRename, handleCancel]);

  const isValid = !validationError && newKey.trim() !== '' && newKey.trim() !== currentKey;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Rename Property Key
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Current key display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Current Key
            </Label>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border font-mono text-sm text-slate-800 dark:text-slate-200">
              {currentKey}
            </div>
          </div>

          {/* New key input */}
          <div className="space-y-2">
            <Label htmlFor="new-key" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              New Key Name
            </Label>
            <Input
              id="new-key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new key name"
              className={`w-full ${validationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              autoFocus
              disabled={isLoading}
            />
            
            {/* Validation error */}
            {validationError && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">{validationError}</span>
              </div>
            )}
          </div>

          {/* Path display for context */}
          {path.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Location
              </Label>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-sm font-mono text-slate-700 dark:text-slate-300">
                {path.join(' → ')} → <span className="text-blue-600 dark:text-blue-400 font-semibold">{currentKey}</span>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p className="font-medium">Naming Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-blue-700 dark:text-blue-300">
                <li>Cannot contain dots, brackets, quotes, or slashes</li>
                <li>Cannot be empty or contain only whitespace</li>
                <li>Must be different from the current key name</li>
                <li>Cannot conflict with existing property names</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRename}
            disabled={!isValid || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Renaming...' : 'Rename Key'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default KeyRenameDialog;