"use client";

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useJsonStore } from '@/store/jsonStore';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Plus, Trash2, Edit3 } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Import new table functionality
import { useTableSort } from '@/hooks/useTableSort';
import { useTableFilters } from '@/hooks/useTableFilters';
import { 
  TableToolbar, 
  FilterDialog, 
  FilterChips, 
  SortableHeader,
  ExpandableCell,
  SingleObjectTable 
} from '@/components/table';
import { 
  extractColumnKeys, 
  getColumnInfo, 
  FilterConfig,
  getTableType,
  shouldShowAsNestedTable,
  getValuePreview,
  TableType 
} from '@/lib/table-utils';

// Import CSS animations
import '@/components/table/table-animations.css';

interface TableEditorProps {
  className?: string;
  path?: string[];
  parentData?: any;
  hideToolbar?: boolean;
}

interface TableColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

interface TableRow {
  id: string;
  data: Record<string, any>;
  isNew?: boolean;
}

export function TableEditor({ className = '', path = [], parentData, hideToolbar = false }: TableEditorProps) {
  const { jsonData, setJsonData, addToHistory, getNodeAtPath } = useJsonStore();
  
  // Get the data to display - either from props (nested) or store (root)
  const displayData = useMemo(() => {
    if (parentData !== undefined) {
      return parentData;
    }
    if (path.length > 0) {
      return getNodeAtPath(path);
    }
    return jsonData;
  }, [parentData, path, jsonData, getNodeAtPath]);
  
  // New hooks for sorting and filtering
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
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddRowDialog, setShowAddRowDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [editingFilter, setEditingFilter] = useState<{ index: number; filter: FilterConfig } | null>(null);
  const [newlyAddedRows, setNewlyAddedRows] = useState<Set<string>>(new Set());

  // Helper function to infer type from value
  const inferType = (value: any): TableColumn['type'] => {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  // Determine the table type
  const tableType: TableType = useMemo(() => {
    return getTableType(displayData);
  }, [displayData]);

  // Convert JSON data to table format
  const { columns, rows } = useMemo(() => {
    if (!displayData || typeof displayData !== 'object') {
      return { columns: [], rows: [] };
    }

    // Handle different table types
    if (tableType === 'single-object') {
      // For single objects, we don't need to generate columns/rows here
      // as SingleObjectTable component will handle it
      return { columns: [], rows: [] };
    }

    // Handle array data (both object-array and primitive-array)
    if (Array.isArray(displayData)) {
      if (displayData.length === 0) {
        return { columns: [], rows: [] };
      }

      if (tableType === 'object-array') {
        // Extract all possible columns from all objects with priority sorting
        const columnKeys = extractColumnKeys(displayData);
        const cols: TableColumn[] = columnKeys.map(key => {
          const columnInfo = getColumnInfo(displayData, key);
          return {
            key,
            label: key,
            type: columnInfo.type as TableColumn['type']
          };
        });

        const tableRows: TableRow[] = displayData.map((item, index) => ({
          id: String(index),
          data: item || {},
          isNew: newlyAddedRows.has(String(index))
        }));

        return { columns: cols, rows: tableRows };
      } else {
        // Primitive array - show as single column table
        const cols: TableColumn[] = [{
          key: 'value',
          label: 'Value',
          type: 'string'
        }];

        const tableRows: TableRow[] = displayData.map((item, index) => ({
          id: String(index),
          data: { value: item },
          isNew: newlyAddedRows.has(String(index))
        }));

        return { columns: cols, rows: tableRows };
      }
    }

    return { columns: [], rows: [] };
  }, [displayData, tableType, newlyAddedRows]);

  // Apply filters and sorting
  const processedData = useMemo(() => {
    // First apply filters
    const filteredData = applyFilters(rows);
    // Then apply sorting
    return applySorting(filteredData);
  }, [rows, applyFilters, applySorting]);

  // Clear new row highlights after animation
  useEffect(() => {
    if (newlyAddedRows.size > 0) {
      const timer = setTimeout(() => {
        setNewlyAddedRows(new Set());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedRows]);

  const handleFilterToggle = () => {
    setShowFilterDialog(true);
    setEditingFilter(null);
  };

  const handleAddFilter = (filter: FilterConfig) => {
    if (editingFilter) {
      // Update existing filter
      removeFilter(editingFilter.index);
      addFilter(filter);
    } else {
      // Add new filter
      addFilter(filter);
    }
    setShowFilterDialog(false);
    setEditingFilter(null);
  };

  const handleEditFilter = (index: number) => {
    const filter = filters[index];
    setEditingFilter({ index, filter });
    setShowFilterDialog(true);
  };

  const handleAddRow = () => {
    if (!Array.isArray(displayData)) {
      toast.error('Can only add rows to array data');
      return;
    }

    const newRow: Record<string, any> = {};
    columns.forEach(col => {
      switch (col.type) {
        case 'number': newRow[col.key] = 0; break;
        case 'boolean': newRow[col.key] = false; break;
        case 'array': newRow[col.key] = []; break;
        case 'object': newRow[col.key] = {}; break;
        default: newRow[col.key] = ''; break;
      }
    });

    const newData = [...displayData, newRow];
    const newRowId = String(newData.length - 1);
    
    addToHistory();
    
    // Update data at the correct path
    if (path.length > 0 || parentData !== undefined) {
      // For nested tables, we need to update the specific path
      const { updateNodeAtPath } = useJsonStore.getState();
      updateNodeAtPath(path, newData);
    } else {
      // For root table
      setJsonData(newData, 'Add new row');
    }
    
    setNewlyAddedRows(new Set([newRowId]));
    setShowAddRowDialog(false);
    toast.success('Row added successfully');
  };

  const startEdit = (rowId: string, columnKey: string) => {
    const row = rows.find(r => r.id === rowId);
    if (row) {
      setEditingCell({ rowId, column: columnKey });
      setEditValue(formatValueForEdit(row.data[columnKey]));
    }
  };

  const formatValueForEdit = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const parseEditValue = (value: string, type: TableColumn['type']): any => {
    if (!value.trim()) return null;
    
    try {
      switch (type) {
        case 'number':
          const num = Number(value);
          return isNaN(num) ? value : num;
        case 'boolean':
          if (value.toLowerCase() === 'true') return true;
          if (value.toLowerCase() === 'false') return false;
          return value;
        case 'object':
        case 'array':
          return JSON.parse(value);
        default:
          return value;
      }
    } catch {
      return value;
    }
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const column = columns.find(col => col.key === editingCell.column);
    if (!column) return;

    const newValue = parseEditValue(editValue, column.type);
    
    try {
      // Update the data at the correct path
      const rowIndex = parseInt(editingCell.rowId);
      const cellPath = [...path, rowIndex.toString(), editingCell.column];
      
      addToHistory();
      
      if (path.length > 0 || parentData !== undefined) {
        // For nested tables
        const { updateNodeAtPath } = useJsonStore.getState();
        updateNodeAtPath(cellPath, newValue);
      } else {
        // For root table
        const newData = Array.isArray(displayData) ? [...displayData] : { ...displayData };
        
        if (Array.isArray(newData)) {
          if (newData[rowIndex]) {
            newData[rowIndex] = { ...newData[rowIndex], [editingCell.column]: newValue };
          }
        }
        
        setJsonData(newData, `Update ${editingCell.column} in row ${editingCell.rowId}`);
      }
      
      setEditingCell(null);
      toast.success('Cell updated successfully');
    } catch (error) {
      toast.error('Failed to update cell: ' + (error as Error).message);
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const deleteRow = (rowId: string) => {
    if (!Array.isArray(displayData)) {
      toast.error('Can only delete rows from array data');
      return;
    }

    const rowIndex = parseInt(rowId);
    const newData = displayData.filter((_, index) => index !== rowIndex);
    
    addToHistory();
    
    if (path.length > 0 || parentData !== undefined) {
      // For nested tables
      const { updateNodeAtPath } = useJsonStore.getState();
      updateNodeAtPath(path, newData);
    } else {
      // For root table
      setJsonData(newData, `Delete row ${rowId}`);
    }
    
    toast.success('Row deleted successfully');
  };

  const renderCellValue = (value: any, type: TableColumn['type'], rowId: string, columnKey: string) => {
    const cellPath = [...path, rowId, columnKey];
    
    // For complex values that can be expanded, use ExpandableCell
    if (shouldShowAsNestedTable(value) || type === 'object' || type === 'array') {
      return (
        <ExpandableCell
          value={value}
          path={cellPath}
          type={type}
          isEditing={editingCell?.rowId === rowId && editingCell?.column === columnKey}
          onStartEdit={() => startEdit(rowId, columnKey)}
          onStopEdit={() => setEditingCell(null)}
        />
      );
    }

    // For simple values, render directly
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

  // Handle single object tables with dedicated component
  if (tableType === 'single-object') {
    return (
      <SingleObjectTable
        data={displayData}
        path={path}
        className={className}
        hideToolbar={hideToolbar}
      />
    );
  }

  if (columns.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-slate-500 dark:text-slate-400", className)}>
        <div className="text-center">
          <p className="text-lg mb-2">No tabular data to display</p>
          <p className="text-sm">Import JSON array or object to view in table format</p>
        </div>
      </div>
    );
  }

  const isArrayData = Array.isArray(displayData);

  return (
    <div className={cn("space-y-0", className)}>
      {/* Enhanced Toolbar - conditionally rendered */}
      {!hideToolbar && (
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalRows={rows.length}
          filteredRows={processedData.length}
          hasActiveFilters={hasActiveFilters}
          onFilterToggle={handleFilterToggle}
          onAddRow={isArrayData ? () => setShowAddRowDialog(true) : undefined}
          onClearFilters={clearAllFilters}
          data={processedData.map(row => row.data)}
          isArrayData={isArrayData}
        />
      )}

      {/* Filter Chips - conditionally rendered */}
      {!hideToolbar && filters.length > 0 && (
        <FilterChips
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={clearAllFilters}
          onEditFilter={handleEditFilter}
        />
      )}

      {/* Table Container */}
      <div className={cn(
        "table-container border border-slate-200 dark:border-slate-700 overflow-auto max-h-[600px]",
        hideToolbar ? "rounded-lg" : "rounded-b-lg border-t-0"
      )}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="text-left">
                  <SortableHeader
                    column={column.key}
                    dataType={column.type}
                    sortDirection={sortState.column === column.key ? sortState.direction : null}
                    onSort={() => handleSort(column.key)}
                  >
                    {column.label}
                  </SortableHeader>
                </th>
              ))}
              <th className="w-16 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((row) => (
              <tr 
                key={row.id} 
                className={cn(
                  "table-row table-row-transition border-t border-slate-200 dark:border-slate-700",
                  "hover:bg-slate-50 dark:hover:bg-slate-800/30",
                  row.isNew && "table-row-new",
                  editingCell?.rowId === row.id && "table-row-editing"
                )}
              >
                {columns.map((column) => (
                  <td key={`${row.id}-${column.key}`} className="py-1 px-3">
                    {editingCell?.rowId === row.id && editingCell?.column === column.key ? (
                      <div className="flex flex-col gap-2 min-w-0">
                        {(() => {
                          const originalValue = row.data[column.key];
                          const isComplexValue = originalValue && typeof originalValue === 'object';
                          
                          return isComplexValue ? (
                            <Textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                  e.preventDefault();
                                  saveEdit();
                                }
                                if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelEdit();
                                }
                              }}
                              className="table-cell-editing text-xs font-mono min-h-[100px] max-h-[300px] w-full resize-y"
                              placeholder="Enter JSON..."
                              autoFocus
                            />
                          ) : (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="h-8 table-cell-editing"
                              autoFocus
                            />
                          );
                        })()}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={saveEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            Cancel
                          </Button>
                          {(() => {
                            const originalValue = row.data[column.key];
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
                      <div className="w-full">
                        {renderCellValue(row.data[column.key], column.type, row.id, column.key)}
                      </div>
                    )}
                  </td>
                ))}
                <td className="py-1 px-3">
                  <div className="table-row-actions">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(row.id, columns[0]?.key)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Row
                        </DropdownMenuItem>
                        {isArrayData && (
                          <DropdownMenuItem 
                            onClick={() => deleteRow(row.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Row
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {processedData.length === 0 && hasActiveFilters && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-b-lg">
          <p>No rows match the current filters</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Add Row Dialog */}
      <Dialog open={showAddRowDialog} onOpenChange={setShowAddRowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Add New Row
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                A new row will be added with default values for each column. You can edit the values after adding the row.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button 
              variant="outline" 
              onClick={() => setShowAddRowDialog(false)}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddRow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Row
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onApplyFilter={handleAddFilter}
        data={rows.map(row => row.data)}
        existingFilter={editingFilter?.filter}
      />
    </div>
  );
}