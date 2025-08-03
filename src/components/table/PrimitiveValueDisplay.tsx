"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Edit3, Type, Hash, ToggleLeft, FileX, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { getValueType, formatValue } from '@/lib/table-utils';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

interface PrimitiveValueDisplayProps {
  value: any;
  path?: string[];
  onUpdate?: (newValue: any) => void;
  className?: string;
  allowEditing?: boolean;
  showMeta?: boolean;
  showTypeIndicator?: boolean;
  maxLength?: number;
}

export function PrimitiveValueDisplay({
  value,
  path = [],
  onUpdate,
  className,
  allowEditing = true,
  showMeta = true,
  showTypeIndicator = true,
  maxLength = 200
}: PrimitiveValueDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { copy } = useClipboard({ successMessage: 'Value copied to clipboard' });

  const valueType = getValueType(value);
  const displayValue = formatValue(value);
  const isLongValue = typeof displayValue === 'string' && displayValue.length > maxLength;
  const truncatedValue = isLongValue && !isExpanded 
    ? displayValue.substring(0, maxLength) + '...' 
    : displayValue;

  // Handle edit start
  const startEditing = useCallback(() => {
    if (!allowEditing) return;
    
    setIsEditing(true);
    if (valueType === 'string') {
      setEditValue(value);
    } else {
      setEditValue(JSON.stringify(value));
    }
  }, [allowEditing, value, valueType]);

  // Handle edit save
  const saveEdit = useCallback(() => {
    if (!onUpdate) return;

    try {
      let parsedValue: any;
      
      if (valueType === 'string') {
        parsedValue = editValue;
      } else {
        // Try to parse as the original type
        switch (valueType) {
          case 'number':
            parsedValue = parseFloat(editValue);
            if (isNaN(parsedValue)) throw new Error('Invalid number');
            break;
          case 'boolean':
            const lowerValue = editValue.toLowerCase().trim();
            if (lowerValue === 'true') parsedValue = true;
            else if (lowerValue === 'false') parsedValue = false;
            else throw new Error('Invalid boolean');
            break;
          case 'null':
            if (editValue.toLowerCase().trim() === 'null') parsedValue = null;
            else throw new Error('Invalid null value');
            break;
          default:
            parsedValue = JSON.parse(editValue);
        }
      }

      onUpdate(parsedValue);
      setIsEditing(false);
      setEditValue('');
    } catch (error) {
      console.error('Failed to parse value:', error);
      // Show error feedback but don't exit edit mode
    }
  }, [editValue, valueType, onUpdate]);

  // Handle edit cancel
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  // Handle copy to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      const textToCopy = showRaw ? JSON.stringify(value) : displayValue;
      await copy(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [value, displayValue, showRaw, copy]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Get type-specific styling
  const getTypeStyles = useCallback(() => {
    switch (valueType) {
      case 'string':
        return 'text-green-600 dark:text-green-400';
      case 'number':
        return 'text-blue-600 dark:text-blue-400';
      case 'boolean':
        return 'text-purple-600 dark:text-purple-400';
      case 'null':
        return 'text-gray-500 dark:text-gray-400 italic';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  }, [valueType]);

  // Get type icon
  const getTypeIcon = useCallback(() => {
    switch (valueType) {
      case 'string':
        return <Type size={14} />;
      case 'number':
        return <Hash size={14} />;
      case 'boolean':
        return <ToggleLeft size={14} />;
      case 'null':
        return <FileX size={14} />;
      default:
        return null;
    }
  }, [valueType]);

  // Get value length/info
  const getValueInfo = useCallback(() => {
    switch (valueType) {
      case 'string':
        return `${value.length} characters`;
      case 'number':
        return typeof value === 'number' && !Number.isInteger(value) ? 'decimal' : 'integer';
      case 'boolean':
      case 'null':
        return valueType;
      default:
        return 'unknown';
    }
  }, [value, valueType]);

  if (isEditing) {
    return (
      <div className={cn("space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showTypeIndicator && getTypeIcon()}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Editing {valueType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveEdit}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
        
        {valueType === 'string' && value.length > 100 ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                saveEdit();
              } else if (e.key === 'Escape') {
                cancelEdit();
              }
            }}
            className="w-full p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={Math.min(10, Math.max(3, editValue.split('\n').length))}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-full p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to save, 
          <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">Esc</kbd> to cancel
          {valueType === 'string' && (
            <>
              , <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+Enter</kbd> for multiline
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("group space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showTypeIndicator && (
            <div className={cn("flex items-center gap-1", getTypeStyles())}>
              {getTypeIcon()}
              <span className="text-sm font-medium capitalize">{valueType}</span>
            </div>
          )}
          {path.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {path.join('.')}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isLongValue && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            title={showRaw ? "Show formatted" : "Show raw JSON"}
          >
            <RotateCcw size={14} />
          </button>
          
          <button
            onClick={copyToClipboard}
            className={cn(
              "p-1 rounded transition-colors",
              copySuccess 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
            title="Copy to clipboard"
          >
            <Copy size={14} />
          </button>
          
          {allowEditing && onUpdate && (
            <button
              onClick={startEditing}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
              title="Edit value"
            >
              <Edit3 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Value Display */}
      <div className="space-y-2">
        <div 
          className={cn(
            "font-mono text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded border cursor-pointer select-all",
            getTypeStyles(),
            allowEditing && "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          onClick={allowEditing ? startEditing : undefined}
        >
          {showRaw ? (
            <span>{JSON.stringify(value)}</span>
          ) : (
            <span>
              {truncatedValue}
              {isLongValue && !isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Show more
                </button>
              )}
            </span>
          )}
        </div>

        {/* Metadata */}
        {showMeta && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{getValueInfo()}</span>
            {copySuccess && (
              <span className="text-green-600 dark:text-green-400">Copied!</span>
            )}
          </div>
        )}
      </div>

      {/* Long value controls */}
      {isLongValue && isExpanded && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}