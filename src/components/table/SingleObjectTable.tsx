"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { useJsonStore } from '@/store/jsonStore';
import { useTableSort } from '@/hooks/useTableSort';
import { useTableFilters } from '@/hooks/useTableFilters';
import { 
  getTypeLabel, 
  shouldShowAsNestedTable, 
  getValuePreview 
} from '@/lib/table-utils';
import { 
  TableToolbar, 
  FilterDialog, 
  FilterChips, 
  SortableHeader 
} from '@/components/table';
import { ExpandableCell } from './ExpandableCell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Edit3, Trash2, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

// Import KeyRenameDialog when it's created
const KeyRenameDialog = React.lazy(() => 
  import('./KeyRenameDialog').then(m => ({ default: m.KeyRenameDialog }))
    .catch(() => ({ default: () => <div>Key rename dialog not available</div> }))
);

export interface SingleObjectTableProps {
  data: Record<string, any>;
  path?: string[];
  onUpdate?: (path: string[], newValue: any) => void;
  className?: string;
  hideToolbar?: boolean;
  density?: 'comfortable' | 'regular' | 'compact';
  // 新增：强制展开模式支持
  forcedExpandAll?: boolean;
}

interface ObjectRow {
  key: string;
  value: any;
  type: string;
}

export function SingleObjectTable({
  data,
  path = [],
  onUpdate,
  className = '',
  hideToolbar = false,
  density = 'regular',
  // 新增：强制展开模式支持
  forcedExpandAll = false
}: SingleObjectTableProps) {
  const { updateNodeAtPath, deleteNodeAtPath, addToHistory } = useJsonStore();
  
  // Calculate nesting level based on path length to adjust z-index
  const nestingLevel = path.length;
  const headerZIndex = Math.max(1, 10 - nestingLevel); // Start at z-10, decrease with nesting
  const dropdownZIndex = Math.max(20, 50 - nestingLevel); // Dropdown should be above table content
  
  // Table functionality hooks
  const { sortState, handleSort, applySorting } = useTableSort();
  const { 
    filters, 
    searchTerm, 
    addFilter, 
    removeFilter, 
    clearAllFilters, 
    setSearchTerm, 
    applyFilters, 
    hasActiveFilters 
  } = useTableFilters();

  // Local state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<{ key: string; value: string } | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showKeyRenameDialog, setShowKeyRenameDialog] = useState(false);
  const [keyToRename, setKeyToRename] = useState<string>('');
  const [showAddPropertyDialog, setShowAddPropertyDialog] = useState(false);
  const [newPropertyKey, setNewPropertyKey] = useState('');
  const [newPropertyValue, setNewPropertyValue] = useState('');

  // Convert object to table rows
  const rows = useMemo((): ObjectRow[] => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return [];
    }

    return Object.entries(data)
      .map(([key, value]) => ({
        key,
        value,
        type: getTypeLabel(value)
      }))
      .sort((a, b) => a.key.localeCompare(b.key)); // Sort keys alphabetically
  }, [data]);

  // Apply filters and sorting
  const processedRows = useMemo(() => {
    // Transform rows to match filter expectations
    const filterableRows = rows.map(row => ({
      key: row.key,
      value: row.value,
      type: row.type
    }));

    // Apply filters
    const filteredRows = applyFilters(filterableRows);
    
    // Apply sorting with special handling for single object table
    const sortedRows = applySorting(filteredRows, (items, column, direction) => {
      return items.sort((a, b) => {
        let aVal, bVal;
        
        switch (column) {
          case 'key':
            aVal = a.key;
            bVal = b.key;
            break;
          case 'value':
            aVal = a.value;
            bVal = b.value;
            break;
          default:
            return 0;
        }
        
        // Basic comparison
        if (aVal === bVal) return 0;
        if (aVal == null) return direction === 'asc' ? 1 : -1;
        if (bVal == null) return direction === 'asc' ? -1 : 1;
        
        const result = String(aVal).localeCompare(String(bVal));
        return direction === 'desc' ? -result : result;
      });
    });

    return sortedRows;
  }, [rows, applyFilters, applySorting]);

  const handleStartKeyEdit = useCallback((key: string) => {
    setKeyToRename(key);
    setShowKeyRenameDialog(true);
  }, []);

  const handleStartValueEdit = useCallback((key: string, value: any) => {
    setEditingValue({
      key,
      value: typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value)
    });
  }, []);

  const handleSaveValueEdit = useCallback(() => {
    if (!editingValue) return;

    try {
      let newValue: any;
      const { key, value: valueStr } = editingValue;
      const originalValue = data[key];
      
      // Try to parse based on original type
      if (typeof originalValue === 'number') {
        newValue = Number(valueStr);
        if (isNaN(newValue)) newValue = valueStr;
      } else if (typeof originalValue === 'boolean') {
        if (valueStr.toLowerCase() === 'true') newValue = true;
        else if (valueStr.toLowerCase() === 'false') newValue = false;
        else newValue = valueStr;
      } else if (typeof originalValue === 'object') {
        newValue = JSON.parse(valueStr);
      } else {
        newValue = valueStr;
      }

      const valuePath = [...path, key];
      if (onUpdate) {
        onUpdate(valuePath, newValue);
      } else {
        updateNodeAtPath(valuePath, newValue);
      }

      setEditingValue(null);
      toast.success('Value updated successfully');
    } catch (error) {
      toast.error('Failed to update value: ' + (error as Error).message);
    }
  }, [editingValue, data, path, onUpdate, updateNodeAtPath]);

  const handleCancelValueEdit = useCallback(() => {
    setEditingValue(null);
  }, []);

  const handleDeleteProperty = useCallback((key: string) => {
    const propertyPath = [...path, key];
    deleteNodeAtPath(propertyPath);
    toast.success(`Property '${key}' deleted`);
  }, [path, deleteNodeAtPath]);

  const handleAddProperty = useCallback(() => {
    if (!newPropertyKey.trim()) {
      toast.error('Property key cannot be empty');
      return;
    }

    if (newPropertyKey in data) {
      toast.error('Property already exists');
      return;
    }

    try {
      let parsedValue: any;
      if (!newPropertyValue.trim()) {
        parsedValue = '';
      } else {
        // Try to parse as JSON first, fallback to string
        try {
          parsedValue = JSON.parse(newPropertyValue);
        } catch {
          parsedValue = newPropertyValue;
        }
      }

      const newData = { ...data, [newPropertyKey]: parsedValue };
      if (onUpdate) {
        onUpdate(path, newData);
      } else {
        updateNodeAtPath(path, newData);
      }

      setNewPropertyKey('');
      setNewPropertyValue('');
      setShowAddPropertyDialog(false);
      toast.success(`Property '${newPropertyKey}' added`);
    } catch (error) {
      toast.error('Failed to add property: ' + (error as Error).message);
    }
  }, [newPropertyKey, newPropertyValue, data, path, onUpdate, updateNodeAtPath]);

  const columns = [
    { key: 'key', label: 'Key', type: 'string' as const },
    { key: 'value', label: 'Value', type: 'string' as const }
  ];

  if (rows.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-32 text-slate-500 dark:text-slate-400", className)}>
        <div className="text-center">
          <p className="text-lg mb-2">Empty object</p>
          <Button onClick={() => setShowAddPropertyDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {/* Enhanced Toolbar - conditionally rendered */}
      {!hideToolbar && (
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalRows={rows.length}
          filteredRows={processedRows.length}
          hasActiveFilters={hasActiveFilters}
          onFilterToggle={() => setShowFilterDialog(true)}
          onAddRow={() => setShowAddPropertyDialog(true)}
          onClearFilters={clearAllFilters}
          data={processedRows}
          isArrayData={false}
          tableType="single-object"
          nestingLevel={nestingLevel}
          parentPath={path}
          density={density}
        />
      )}

      {/* Filter Chips - conditionally rendered */}
      {!hideToolbar && filters.length > 0 && (
        <FilterChips
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={clearAllFilters}
          onEditFilter={(index) => {
            // Handle edit filter if needed
          }}
          density={density}
        />
      )}

      {/* Table Container - improved styling */}
      <div className={cn(
        "table-container border border-slate-200 dark:border-slate-700 overflow-x-auto overflow-y-auto scrollbar-table bg-white dark:bg-slate-900 min-w-0",
        hideToolbar ? "rounded-lg" : "rounded-b-lg rounded-t-0",
        density === 'compact' && "table-container--compact"
      )}>
        <table className="w-full table-auto text-sm" style={{ minWidth: '100%' }}>
          <thead className={`bg-slate-50 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700`} style={{ zIndex: headerZIndex }}>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn(
                  "text-left font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap",
                  "table-header",
                  density === 'compact' ? "table-header--compact px-2 py-0.5" : "px-3 py-1"
                )}>
                  <SortableHeader
                    column={column.key}
                    dataType={column.type}
                    sortDirection={sortState.column === column.key ? sortState.direction : null}
                    onSort={() => handleSort(column.key)}
                    density={density}
                  >
                    {column.label}
                  </SortableHeader>
                </th>
              ))}
              <th className={cn(
                "w-20 text-slate-500 dark:text-slate-400 text-center whitespace-nowrap",
                "table-header",
                density === 'compact' ? "table-header--compact px-2 py-0.5" : "px-3 py-1"
              )}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedRows.map((row) => (
              <tr 
                key={row.key}
                className={cn(
                  "table-row table-row-transition border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 group",
                  density === 'compact' && "table-row--compact"
                )}
              >
                {/* Key Column */}
                <td className={cn(
                  "whitespace-nowrap",
                  "table-cell",
                  density === 'compact' ? "table-cell--compact px-2 py-0.5" : "px-3 py-1"
                )}>
                  <div
                    className={cn(
                      "key-column-cell font-semibold text-blue-600 dark:text-blue-400",
                      density === 'compact' && "key-column-cell--compact"
                    )}
                    onClick={() => handleStartKeyEdit(row.key)}
                    title="Click to rename key"
                  >
                    {row.key}
                  </div>
                </td>

                {/* Value Column */}
                <td className={cn(
                  "whitespace-nowrap",
                  "table-cell",
                  density === 'compact' ? "table-cell--compact px-2 py-0.5" : "px-3 py-1"
                )}>
                  {editingValue?.key === row.key ? (
                    <div className="flex flex-col gap-2 min-w-0">
                      {(() => {
                        const originalValue = data[row.key];
                        const isComplexValue = originalValue && typeof originalValue === 'object';
                        
                        return isComplexValue ? (
                          <Textarea
                            value={editingValue?.value || ''}
                            onChange={(e) => setEditingValue(editingValue ? { ...editingValue, value: e.target.value } : { key: '', value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleSaveValueEdit();
                              }
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancelValueEdit();
                              }
                            }}
                            className="table-cell-editing text-xs font-mono min-h-[100px] max-h-[300px] w-full resize-y"
                            placeholder="Enter JSON..."
                            autoFocus
                          />
                        ) : (
                          <Input
                            value={editingValue?.value || ''}
                            onChange={(e) => setEditingValue(editingValue ? { ...editingValue, value: e.target.value } : { key: '', value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveValueEdit();
                              if (e.key === 'Escape') handleCancelValueEdit();
                            }}
                            className="table-cell-editing h-8 text-xs"
                            autoFocus
                          />
                        );
                      })()}
                      <div className="flex items-center gap-2">
                        <Button className="h-6 px-2 text-xs" variant="outline" onClick={handleSaveValueEdit}>
                          Save
                        </Button>
                        <Button className="h-6 px-2 text-xs" variant="ghost" onClick={handleCancelValueEdit}>
                          Cancel
                        </Button>
                        {(() => {
                          const originalValue = data[row.key];
                          const isComplexValue = originalValue && typeof originalValue === 'object';
                          return isComplexValue && (
                            <span className="text-xs text-muted-foreground">
                              Press Ctrl+Enter to save
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <ExpandableCell
                      value={row.value}
                      path={[...path, row.key]}
                      type={row.type as any}
                      onUpdate={onUpdate}
                      onStartEdit={() => handleStartValueEdit(row.key, row.value)}
                      density={density}
                      // 透传强制展开
                      forcedExpandAll={forcedExpandAll}
                    />
                  )}
                </td>

                {/* Actions Column */}
                <td className={cn(
                  "text-center whitespace-nowrap",
                  "table-cell",
                  density === 'compact' ? "table-cell--compact px-2 py-0.5" : "px-3 py-1"
                )}>
                  <div className="table-row-actions">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg" style={{ zIndex: dropdownZIndex }}>
                      <DropdownMenuItem onClick={() => handleStartKeyEdit(row.key)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Rename Key
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStartValueEdit(row.key, row.value)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Value
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProperty(row.key)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Property
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State - improved styling */}
      {processedRows.length === 0 && hasActiveFilters && (
        <div className="text-center py-12 px-6 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-lg mb-3">No properties match the current filters</p>
          <Button 
            variant="outline" 
            className="mt-2 h-8 px-3 text-sm"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Add Property Dialog - improved styling */}
      <Dialog open={showAddPropertyDialog} onOpenChange={setShowAddPropertyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Add New Property
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="property-key" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Property Key
              </label>
              <Input
                id="property-key"
                value={newPropertyKey}
                onChange={(e) => setNewPropertyKey(e.target.value)}
                placeholder="Enter property key"
                className="w-full"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="property-value" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Property Value
              </label>
              <Input
                id="property-value"
                value={newPropertyValue}
                onChange={(e) => setNewPropertyValue(e.target.value)}
                placeholder="Enter value (JSON or string)"
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Values will be parsed as JSON if possible, otherwise treated as strings
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button 
              variant="outline" 
              onClick={() => setShowAddPropertyDialog(false)}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProperty}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Property
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onApplyFilter={addFilter}
        data={rows}
      />

      {/* Key Rename Dialog */}
      {showKeyRenameDialog && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <KeyRenameDialog
            open={showKeyRenameDialog}
            onOpenChange={setShowKeyRenameDialog}
            currentKey={keyToRename}
            path={path}
            existingKeys={Object.keys(data)}
            onRename={() => {
              setShowKeyRenameDialog(false);
              setKeyToRename('');
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
}

export default SingleObjectTable;