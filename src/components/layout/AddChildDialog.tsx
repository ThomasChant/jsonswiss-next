"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

export interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentPath: string[];
  parentData: any;
  onAddChild: (key: string | null, value: any) => void;
}

export function AddChildDialog({
  open,
  onOpenChange,
  parentPath,
  parentData,
  onAddChild
}: AddChildDialogProps) {
  const [keyName, setKeyName] = useState('');
  const [nodeValue, setNodeValue] = useState('');
  const [validationError, setValidationError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Determine if parent is an array (key input should be hidden)
  const isParentArray = Array.isArray(parentData);

  // Get existing keys for validation
  const existingKeys = React.useMemo(() => {
    if (isParentArray || !parentData || typeof parentData !== 'object') {
      return [];
    }
    return Object.keys(parentData);
  }, [parentData, isParentArray]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setKeyName('');
      setNodeValue('');
      setValidationError('');
    }
  }, [open]);

  // Validate form inputs
  const validateForm = useCallback((): string => {
    // Validate key name for objects
    if (!isParentArray) {
      if (!keyName || keyName.trim() === '') {
        return 'Property name cannot be empty';
      }

      const trimmedKey = keyName.trim();
      if (existingKeys.includes(trimmedKey)) {
        return 'Property name already exists';
      }
    }

    // Validate JSON value
    if (!nodeValue || nodeValue.trim() === '') {
      return 'Node value cannot be empty';
    }

    try {
      JSON.parse(nodeValue);
    } catch {
      return 'Please enter valid JSON format';
    }

    return '';
  }, [keyName, nodeValue, isParentArray, existingKeys]);

  // Update validation when inputs change
  useEffect(() => {
    if (keyName || nodeValue) {
      const error = validateForm();
      setValidationError(error);
    } else {
      setValidationError('');
    }
  }, [keyName, nodeValue, validateForm]);

  const handleSubmit = useCallback(async () => {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    setIsLoading(true);
    
    try {
      const parsedValue = JSON.parse(nodeValue);
      const finalKey = isParentArray ? null : keyName.trim();
      
      onAddChild(finalKey, parsedValue);
      onOpenChange(false);
    } catch (error) {
      setValidationError('Please enter valid JSON format');
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, nodeValue, isParentArray, keyName, onAddChild, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !validationError && !isLoading) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [validationError, isLoading, handleSubmit, handleCancel]);

  const isValid = !validationError && nodeValue.trim() !== '' && (isParentArray || keyName.trim() !== '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Add Child Node
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Parent path display for context */}
          {parentPath.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Parent Path
              </Label>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-sm font-mono text-slate-700 dark:text-slate-300">
                {parentPath.join(' → ')} → <span className="text-blue-600 dark:text-blue-400 font-semibold">[new child]</span>
              </div>
            </div>
          )}

          {/* Property name input (only for objects) */}
          {!isParentArray && (
            <div className="space-y-2">
              <Label htmlFor="property-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Property Name
              </Label>
              <Input
                id="property-name"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter property name"
                className="w-full"
                autoFocus
                disabled={isLoading}
              />
            </div>
          )}

          {/* Node value input */}
          <div className="space-y-2">
            <Label htmlFor="node-value" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Node Value (JSON format)
            </Label>
            <Input
              id="node-value"
              value={nodeValue}
              onChange={(e) => setNodeValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Enter JSON value, e.g: "text" or {"key": "value"}'
              className="w-full"
              autoFocus={isParentArray}
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter valid JSON format. Strings must be quoted.
            </p>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">{validationError}</span>
            </div>
          )}

          {/* Node type info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">
                Adding to: {isParentArray ? 'Array' : 'Object'}
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                {isParentArray 
                  ? 'New item will be added to the end of the array'
                  : 'New property will be added to the object'
                }
              </p>
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
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Adding...' : 'Add Node'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddChildDialog;