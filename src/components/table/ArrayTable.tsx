"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit3, Copy, Filter, ArrowUpDown } from 'lucide-react';
import { useTableSort } from '@/hooks/useTableSort';
import { useTableFilters } from '@/hooks/useTableFilters';
import { getValueType, formatValue, isComplexValue } from '@/lib/table-utils';
import { SingleObjectTable } from './SingleObjectTable';
import { cn } from '@/lib/utils';

interface ArrayTableProps {
  data: any[];
  path?: string[];
  onUpdate?: (newData: any[]) => void;
  className?: string;
  maxHeight?: string;
  showRowNumbers?: boolean;
  allowEditing?: boolean;
  allowFiltering?: boolean;
  allowSorting?: boolean;
  density?: 'comfortable' | 'regular' | 'compact';
  showToolBar?: boolean;
}

interface ArrayTableColumn {
  key: string;
  label: string;
  type: string;
  sortable: boolean;
}

export function ArrayTable({
  data,
  path = [],
  onUpdate,
  className,
  maxHeight,
  showRowNumbers = true,
  allowEditing = true,
  allowFiltering = true,
  allowSorting = true,
  density = 'compact',
  showToolBar=true
}: ArrayTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<{row: number, column: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Calculate nesting level based on path length to adjust z-index
  const nestingLevel = path.length;
  const headerZIndex = Math.max(1, 10 - nestingLevel); // Start at z-10, decrease with nesting

  // Determine if array contains objects or primitives
  const isObjectArray = useMemo(() => {
    return data.length > 0 && data.some(item => item && typeof item === 'object' && !Array.isArray(item));
  }, [data]);

  // Generate columns for object arrays
  const columns = useMemo<ArrayTableColumn[]>(() => {
    if (!isObjectArray || data.length === 0) {
      return [
        { key: 'value', label: 'Value', type: 'mixed', sortable: true }
      ];
    }

    // Collect all unique keys from objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    // Convert to column definitions
    return Array.from(allKeys).map(key => {
      // Determine column type based on values
      const values = data.map(item => item?.[key]).filter(v => v !== undefined);
      const types = values.map(v => getValueType(v));
      const dominantType = types.length > 0 ? types[0] : 'mixed';

      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type: dominantType,
        sortable: true
      };
    });
  }, [data, isObjectArray]);

  // Table sorting
  const { sortState, handleSort, applySorting } = useTableSort();

  // Table filtering
  const { 
    filters,
    searchTerm, 
    setSearchTerm, 
    applyFilters,
    addFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters
  } = useTableFilters();

  // Apply sorting and filtering
  const displayData = useMemo(() => {
    let processedData = data;
    
    // Apply filtering first
    if (allowFiltering) {
      processedData = applyFilters(processedData);
    }
    
    // Then apply sorting
    if (allowSorting) {
      processedData = applySorting(processedData);
    }
    
    return processedData;
  }, [data, applyFilters, applySorting, allowFiltering, allowSorting]);

  // Handle row expansion
  const toggleRowExpansion = useCallback((index: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Handle cell editing
  const startEditing = useCallback((rowIndex: number, columnKey: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, column: columnKey });
    setEditValue(typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue));
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingCell || !onUpdate) return;

    try {
      const newData = [...displayData];
      let parsedValue: any;
      
      // Try to parse as JSON first, then fall back to string
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        parsedValue = editValue;
      }

      if (isObjectArray) {
        newData[editingCell.row] = {
          ...newData[editingCell.row],
          [editingCell.column]: parsedValue
        };
      } else {
        newData[editingCell.row] = parsedValue;
      }

      onUpdate(newData);
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to save edit:', error);
    }
  }, [editingCell, editValue, displayData, isObjectArray, onUpdate]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Handle row operations
  const addRow = useCallback(() => {
    if (!onUpdate) return;
    
    const newRow = isObjectArray 
      ? Object.fromEntries(columns.map(col => [col.key, null]))
      : '';
    
    onUpdate([...data, newRow]);
  }, [data, isObjectArray, columns, onUpdate]);

  const deleteRow = useCallback((index: number) => {
    if (!onUpdate) return;
    
    const newData = data.filter((_, i) => i !== index);
    onUpdate(newData);
  }, [data, onUpdate]);

  const duplicateRow = useCallback((index: number) => {
    if (!onUpdate) return;
    
    const rowToDuplicate = data[index];
    const duplicatedRow = JSON.parse(JSON.stringify(rowToDuplicate));
    const newData = [...data];
    newData.splice(index + 1, 0, duplicatedRow);
    onUpdate(newData);
  }, [data, onUpdate]);

  // Render cell content
  const renderCellContent = useCallback((value: any, rowIndex: number, columnKey: string) => {
    const isEditing = editingCell?.row === rowIndex && editingCell?.column === columnKey;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
      );
    }

    if (isComplexValue(value)) {
      const isExpanded = expandedRows.has(rowIndex);
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleRowExpansion(rowIndex)}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span className="font-mono">
                {Array.isArray(value) ? `Array (${value.length})` : `Object (${Object.keys(value).length})`}
              </span>
            </button>
            {allowEditing && (
              <button
                onClick={() => startEditing(rowIndex, columnKey, value)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Edit3 size={12} />
              </button>
            )}
          </div>
          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {Array.isArray(value) ? (
                <ArrayTable
                  data={value}
                  path={[...path, rowIndex.toString(), columnKey]}
                  onUpdate={(newValue) => {
                    if (!onUpdate) return;
                    const newData = [...data];
                    if (isObjectArray) {
                      newData[rowIndex] = { ...newData[rowIndex], [columnKey]: newValue };
                    } else {
                      newData[rowIndex] = newValue;
                    }
                    onUpdate(newData);
                  }}
                  className="text-xs"
                  maxHeight="300px"
                  showRowNumbers={false}
                  density={density}
                  allowFiltering={false}
                  allowEditing={true}
                  showToolBar={false}
                />
              ) : (
                <SingleObjectTable
                  data={value}
                  path={[...path, rowIndex.toString(), columnKey]}
                  onUpdate={(newValue) => {
                    if (!onUpdate) return;
                    const newData = [...data];
                    if (isObjectArray) {
                      newData[rowIndex] = { ...newData[rowIndex], [columnKey]: newValue };
                    } else {
                      newData[rowIndex] = newValue;
                    }
                    onUpdate(newData);
                  }}
                  className="text-xs"
                  density={density}
                />
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between group">
        <span 
          className={cn(
            "font-mono text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded",
            getValueType(value) === 'string' && "text-green-600 dark:text-green-400",
            getValueType(value) === 'number' && "text-blue-600 dark:text-blue-400",
            getValueType(value) === 'boolean' && "text-purple-600 dark:text-purple-400",
            getValueType(value) === 'null' && "text-gray-500 dark:text-gray-400"
          )}
          onClick={() => allowEditing && startEditing(rowIndex, columnKey, value)}
        >
          {formatValue(value)}
        </span>
        {allowEditing && (
          <button
            onClick={() => startEditing(rowIndex, columnKey, value)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
          >
            <Edit3 size={12} />
          </button>
        )}
      </div>
    );
  }, [editingCell, editValue, expandedRows, path, data, allowEditing, onUpdate, isObjectArray, saveEdit, cancelEdit, startEditing, toggleRowExpansion, density]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-sm">No data to display</p>
          {allowEditing && onUpdate && (
            <button
              onClick={addRow}
              className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Plus size={14} />
              <span className="text-xs">Add first item</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Toolbar */}
      {(allowFiltering || allowEditing) && showToolBar && (
        <div className={cn(
          "flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg",
          "table-toolbar",
          density === 'compact' && "table-toolbar--compact",
          density === 'compact' ? "p-2 gap-2" : "p-3 gap-4"
        )}>
          <div className="flex items-center gap-3">
            {allowFiltering && (
              <>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search all columns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Filter size={14} className="absolute left-2.5 top-2 text-gray-400" />
                </div>
                {(searchTerm || hasActiveFilters) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Clear filters
                  </button>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {displayData.length} {displayData.length === 1 ? 'item' : 'items'}
            </span>
            {allowEditing && onUpdate && (
              <button
                onClick={addRow}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Plus size={12} />
                Add Row
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className={cn(
        "overflow-x-auto overflow-y-auto scrollbar-table rounded-lg border border-gray-200 dark:border-gray-700 min-w-0",
        "table-container",
        density === 'compact' && "table-container--compact"
      )} style={maxHeight ? { maxHeight } : {}}>
        <table className="w-full table-auto bg-white dark:bg-gray-900" style={{ minWidth: '100%' }}>
          <thead className="bg-gray-50 dark:bg-gray-800" style={{ zIndex: headerZIndex }}>
            <tr>
              {showRowNumbers && (
                <th className={cn(
                "text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider w-12 whitespace-nowrap",
                "table-header",
                density === 'compact' ? "table-header--compact px-2 py-0.5" : "px-3 py-1"
              )}>
                  #
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap",
                    "table-header",
                    density === 'compact' ? "table-header--compact px-2 py-0.5" : "px-3 py-1"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {allowSorting && column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <ArrowUpDown size={12} />
                      </button>
                    )}
                    {sortState?.column === column.key && sortState.direction && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {sortState.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {allowEditing && (
                <th className={cn(
                  "text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider w-20 whitespace-nowrap",
                  "table-header",
                  density === 'compact' ? "table-header--compact px-2 py-0.5" : "px-3 py-1"
                )}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {displayData.map((item, index) => (
              <tr key={index} className={cn(
                "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                "table-row",
                density === 'compact' && "table-row--compact"
              )}>
                {showRowNumbers && (
                  <td className={cn(
                    "whitespace-nowrap text-xs text-gray-500 dark:text-gray-400",
                    "table-cell",
                    density === 'compact' ? "table-cell--compact px-2 py-0.5" : "px-3 py-1"
                  )}>
                    {index + 1}
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className={cn(
                    "whitespace-nowrap",
                    "table-cell",
                    density === 'compact' ? "table-cell--compact px-2 py-0.5" : "px-3 py-1"
                  )}>
                    {isObjectArray 
                      ? renderCellContent(item?.[column.key], index, column.key)
                      : column.key === 'value' 
                        ? renderCellContent(item, index, 'value')
                        : null
                    }
                  </td>
                ))}
                {allowEditing && (
                  <td className={cn(
                    "whitespace-nowrap",
                    "table-cell",
                    density === 'compact' ? "table-cell--compact px-2 py-0.5" : "px-3 py-1"
                  )}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateRow(index)}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Duplicate row"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => deleteRow(index)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete row"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}