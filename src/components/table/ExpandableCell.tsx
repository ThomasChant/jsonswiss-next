"use client";

import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, MoreHorizontal, Edit3, Copy, Plus, Filter, Download } from 'lucide-react';
import { useJsonStore } from '@/store/jsonStore';
import { 
  shouldShowAsNestedTable, 
  getValuePreview
} from '@/lib/table-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

// Forward declaration to avoid circular dependency
const TableEditor = React.lazy(() => import('@/components/editor/TableEditor').then(m => ({ default: m.TableEditor })));

export interface ExpandableCellProps {
  value: any;
  path: string[];
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  onUpdate?: (path: string[], newValue: any) => void;
  className?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onStopEdit?: () => void;
  // New props for nested table operations
  onAddItem?: () => void;
  onFilterToggle?: () => void;
  onExport?: () => void;
  hasActiveFilters?: boolean;
  density?: 'comfortable' | 'regular' | 'compact';
  // 新增：强制展开模式支持
  forcedExpandAll?: boolean;
}

export function ExpandableCell({
  value,
  path,
  type,
  onUpdate,
  className = '',
  isEditing = false,
  onStartEdit,
  onStopEdit,
  // New props for nested table operations
  onAddItem,
  onFilterToggle,
  onExport,
  hasActiveFilters = false,
  density = 'regular',
  // 新增：强制展开模式支持
  forcedExpandAll = false
}: ExpandableCellProps) {
  const { tableExpandedNodes, toggleTableNodeExpansion, updateNodeAtPath } = useJsonStore();
  const [editValue, setEditValue] = useState('');
  const { copy } = useClipboard({ successMessage: 'Value copied to clipboard' });
  
  // Calculate nesting level for z-index (dropdown should be above table content but below parent dropdowns)
  const pathNestingLevel = path.length;
  const dropdownZIndex = Math.max(20, 50 - pathNestingLevel); // Start at z-50, decrease with nesting
  
  const pathKey = path.join('.');
  // 修改：支持强制展开模式
  const isExpanded = forcedExpandAll || tableExpandedNodes.has(pathKey);
  const canExpand = shouldShowAsNestedTable(value);
  
  const handleToggleExpansion = useCallback(() => {
    if (canExpand) {
      toggleTableNodeExpansion(pathKey);
    }
  }, [canExpand, pathKey, toggleTableNodeExpansion]);
  
  const handleEdit = useCallback(() => {
    setEditValue(formatValueForEdit(value));
    onStartEdit?.();
  }, [value, onStartEdit]);
  
  const parseEditValue = useCallback((val: string, cellType: typeof type): any => {
    if (!val.trim()) return null;
    
    try {
      switch (cellType) {
        case 'number':
          const num = Number(val);
          return isNaN(num) ? val : num;
        case 'boolean':
          if (val.toLowerCase() === 'true') return true;
          if (val.toLowerCase() === 'false') return false;
          return val;
        case 'object':
        case 'array':
          return JSON.parse(val);
        default:
          return val;
      }
    } catch {
      return val;
    }
  }, []);

  const handleSaveEdit = useCallback(() => {
    try {
      const newValue = parseEditValue(editValue, type);
      if (onUpdate) {
        onUpdate(path, newValue);
      } else {
        updateNodeAtPath(path, newValue);
      }
      onStopEdit?.();
      toast.success('Value updated successfully');
    } catch (error) {
      toast.error('Failed to update value: ' + (error as Error).message);
    }
  }, [editValue, type, path, onUpdate, updateNodeAtPath, onStopEdit, parseEditValue]);
  
  const handleCancelEdit = useCallback(() => {
    setEditValue('');
    onStopEdit?.();
  }, [onStopEdit]);
  
  const handleCopyValue = useCallback(async () => {
    try {
      const textValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      await copy(textValue);
    } catch (error) {
      toast.error('Failed to copy value');
    }
  }, [value, copy]);

  // Helper functions for nested table operations
  const getAddButtonText = useCallback(() => {
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        return 'Add Row';
      }
      return 'Add Item';
    }
    if (typeof value === 'object' && value !== null) {
      return 'Add Property';
    }
    return 'Add Item';
  }, [value]);

  const canAddItems = canExpand && (Array.isArray(value) || (typeof value === 'object' && value !== null));
  const canFilter = canExpand;
  const canExport = canExpand;

  // Handlers for nested table operations
  const handleAddItem = useCallback(() => {
    if (onAddItem) {
      onAddItem();
    }
  }, [onAddItem]);

  const handleFilterToggle = useCallback(() => {
    if (onFilterToggle) {
      onFilterToggle();
    }
  }, [onFilterToggle]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    } else {
      // Default export functionality
      try {
        const jsonData = JSON.stringify(value, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-${path.join('-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
      } catch (error) {
        toast.error('Failed to export data');
      }
    }
  }, [onExport, value, path]);
  
  const formatValueForEdit = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };
  
  
  const renderValue = () => {
    if (value === null || value === undefined) {
      return <span className="text-slate-400 dark:text-slate-500 italic">null</span>;
    }
    
    switch (type) {
      case 'boolean':
        return (
          <span className={`font-medium ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {value ? 'true' : 'false'}
          </span>
        );
      case 'number':
        return <span className="text-blue-600 dark:text-blue-400 font-mono">{value}</span>;
      case 'object':
      case 'array':
        if (canExpand) {
          return (
            <span className="text-purple-600 dark:text-purple-400 font-mono text-sm">
              {getValuePreview(value)}
            </span>
          );
        }
        return (
          <span className="text-purple-600 dark:text-purple-400 font-mono text-sm">
            {JSON.stringify(value).slice(0, 50)}
            {JSON.stringify(value).length > 50 ? '...' : ''}
          </span>
        );
      default:
        const stringValue = String(value);
        if (stringValue.length > 50) {
          return (
            <span 
              className="text-slate-900 dark:text-slate-100 truncated-text" 
              title={stringValue}
            >
              {stringValue.slice(0, 50)}...
            </span>
          );
        }
        return <span className="text-slate-900 dark:text-slate-100">{stringValue}</span>;
    }
  };
  
  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit();
            if (e.key === 'Escape') handleCancelEdit();
          }}
          inputSize="sm"
          className="table-cell-editing flex-1"
          autoFocus
        />
        <Button size="xs" variant="outline" onClick={handleSaveEdit}>
          Save
        </Button>
        <Button size="xs" variant="ghost" onClick={handleCancelEdit}>
          Cancel
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "expandable-cell w-full",
      density === 'compact' && "expandable-cell--compact",
      className
    )}>
      {/* Main cell content */}
      <div className={cn(
        "flex items-center gap-1",
        density === 'compact' ? "min-h-[1.5rem]" : "min-h-[1.75rem]"
      )}>
        {/* Expand button for complex values */}
        {canExpand && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleToggleExpansion}
            className={cn(
              "table-expand-btn p-0 hover:bg-slate-100 dark:hover:bg-slate-800",
              density === 'compact' ? "h-4 w-4" : "h-5 w-5"
            )}
          >
            {isExpanded ? (
              <ChevronDown className={density === 'compact' ? "h-2.5 w-2.5" : "h-3 w-3"} />
            ) : (
              <ChevronRight className={density === 'compact' ? "h-2.5 w-2.5" : "h-3 w-3"} />
            )}
          </Button>
        )}
        
        {/* Value content */}
        <div
          className={cn(
            "flex-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded transition-colors table-cell",
            density === 'compact' ? "p-0.5 text-sm" : "p-1"
          )}
          onClick={handleEdit}
          title="Click to edit"
        >
          {renderValue()}
        </div>
        
        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="xs" className={cn(
              "p-0 opacity-0 group-hover:opacity-100 transition-opacity",
              density === 'compact' ? "h-4 w-4" : "h-5 w-5"
            )}>
              <MoreHorizontal className={density === 'compact' ? "h-2.5 w-2.5" : "h-3 w-3"} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={cn(
            "w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg",
            density === 'compact' && "dropdown-menu--compact"
          )} style={{ zIndex: dropdownZIndex }}>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Value
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyValue}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Value
            </DropdownMenuItem>
            
            {canExpand && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleExpansion}>
                  {isExpanded ? (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Expand
                    </>
                  )}
                </DropdownMenuItem>
                
                {/* Nested table operations - only show when expanded */}
                {isExpanded && (
                  <>
                    <DropdownMenuSeparator />
                    {canAddItems && (
                      <DropdownMenuItem onClick={handleAddItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        {getAddButtonText()}
                      </DropdownMenuItem>
                    )}
                    {canFilter && (
                      <DropdownMenuItem onClick={handleFilterToggle}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filter Table
                        {hasActiveFilters && (
                          <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                            ON
                          </span>
                        )}
                      </DropdownMenuItem>
                    )}
                    {canExport && (
                      <DropdownMenuItem onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Nested table for expanded complex values */}
      {isExpanded && canExpand && (
        <div 
          className={cn(
            "nested-table relative",
            density === 'compact' ? "nested-table--compact mt-1.5 ml-1 pl-2" : "mt-2 ml-1 pl-2"
          )}
          style={{ zIndex: Math.max(9 - path.length, 0) }}
        >
          <React.Suspense fallback={<div className="text-sm text-slate-500">Loading nested table...</div>}>
            <TableEditor
              className="h-full"
              // Pass the expanded value as the data source
              path={path}
              parentData={value}
              // Hide toolbar since operations are now in dropdown
              hideToolbar={true}
            />
          </React.Suspense>
        </div>
      )}
    </div>
  );
}

export default ExpandableCell;