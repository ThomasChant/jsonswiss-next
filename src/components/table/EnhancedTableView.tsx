"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Filter, 
  ArrowUpDown,
  X,
  MoreHorizontal,
  Download,
  Expand,
  Minimize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getValueType, formatValue, isComplexValue } from '@/lib/table-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { exportData, getExportOptions, ExportFormat } from '@/lib/export-utils';
import { TableSearch } from './TableSearch';
import { highlightText } from './utils/searchUtils';

interface TableFilter {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string;
}

interface SortState {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

interface EnhancedTableViewProps {
  data: any;
  path?: string[];
  onUpdate?: (newData: any) => void;
  className?: string;
  maxHeight?: string;
  density?: 'comfortable' | 'regular' | 'compact';
  showSearch?: boolean;
  searchTerm?: string;
  isMainView?: boolean; // 区分主视图和嵌套视图
  // 新增：级联展开/折叠的信号 tick（父级触发，子级监听）
  expandTick?: number;
  collapseTick?: number;
  // 新增：强制展开模式（由父组件覆盖本地状态）
  forcedExpandAll?: boolean;
}

export function EnhancedTableView({
  data,
  path = [],
  onUpdate,
  className,
  maxHeight,
  density = 'compact',
  showSearch = true,
  searchTerm: parentSearchTerm,
  isMainView = false,
  // 新增：接收父级传入的 tick 信号
  expandTick,
  collapseTick,
  // 新增：接收父级传入的强制展开状态
  forcedExpandAll: forcedExpandAllProp,
}: EnhancedTableViewProps) {
  // State management
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [filters, setFilters] = useState<TableFilter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use parent search term for nested tables, own search term for root tables
  const effectiveSearchTerm = parentSearchTerm || searchTerm;
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{row: number, column: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAddRowDialog, setShowAddRowDialog] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  
  // JSON编辑对话框状态
  const [showJsonEditDialog, setShowJsonEditDialog] = useState(false);
  const [jsonEditValue, setJsonEditValue] = useState('');
  
  // Filter dialog state
  const [filterColumn, setFilterColumn] = useState('');
  const [filterOperator, setFilterOperator] = useState<TableFilter['operator']>('contains');
  const [filterValue, setFilterValue] = useState('');
  
  // Search state - for highlighting
  const [searchResults, setSearchResults] = useState<Array<{rowIndex: number, columnKey: string, text: string, path?: string[]}>>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  
  // Refs
  const tableRef = useRef<HTMLTableElement>(null);

  // 新增：本地 tick 计数与强制展开状态
  const [localExpandTick, setLocalExpandTick] = useState(0);
  const [localCollapseTick, setLocalCollapseTick] = useState(0);
  // 当启用强制展开时，所有可展开节点都会视为展开
  const [forcedExpandAll, setForcedExpandAll] = useState(false);
  // 如果父级传入，则使用父级强制展开状态覆盖本地
  const effectiveForcedExpandAll = forcedExpandAllProp ?? forcedExpandAll;
  const effectiveExpandTick = expandTick ?? localExpandTick;
  const effectiveCollapseTick = collapseTick ?? localCollapseTick;
  const prevExpandTickRef = useRef<number | undefined>(undefined);
  const prevCollapseTickRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // 父级触发的展开广播
    if (expandTick !== undefined && expandTick !== prevExpandTickRef.current) {
      prevExpandTickRef.current = expandTick;
      setForcedExpandAll(true);
    }
  }, [expandTick]);

  useEffect(() => {
    // 父级触发的折叠广播
    if (collapseTick !== undefined && collapseTick !== prevCollapseTickRef.current) {
      prevCollapseTickRef.current = collapseTick;
      setForcedExpandAll(false);
      setExpandedRows(new Set());
    }
  }, [collapseTick]);
  
  // Determine table type and structure
  const tableInfo = useMemo(() => {
    if (!data) return { type: 'empty', columns: [], rows: [] };
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return { type: 'empty-array', columns: [], rows: [] };
      }
      
      // Check if array contains objects
      const hasObjects = data.some(item => item && typeof item === 'object' && !Array.isArray(item));
      
      if (hasObjects) {
        // Extract all unique keys from objects
        const allKeys = new Set<string>();
        data.forEach(item => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            Object.keys(item).forEach(key => allKeys.add(key));
          }
        });
        
        const columns = Array.from(allKeys).map(key => ({
          key,
          label: key,
          type: 'mixed',
          sortable: true
        }));
        
        return {
          type: 'object-array',
          columns,
          rows: data.map((item, index) => ({ index, data: item }))
        };
      } else {
        // Primitive array
        return {
          type: 'primitive-array',
          columns: [{ key: 'value', label: 'Value', type: 'mixed', sortable: true }],
          rows: data.map((item, index) => ({ index, data: item }))
        };
      }
    } else if (typeof data === 'object' && data !== null) {
      // Single object
      const rows = Object.entries(data).map(([key, value], index) => ({
        index,
        data: { key, value, type: getValueType(value) }
      }));
      
      return {
        type: 'single-object',
        columns: [
          { key: 'key', label: 'Key', type: 'string', sortable: true },
          { key: 'value', label: 'Value', type: 'mixed', sortable: true }
          // 移除Type列
        ],
        rows
      };
    }
    
    // Handle primitive values (string, number, boolean, null)
    return {
      type: 'primitive',
      columns: [
        { key: 'value', label: 'Value', type: 'mixed', sortable: false }
        // 移除Type列
      ],
      rows: [{
        index: 0,
        data: { 
          value: data, 
          type: getValueType(data) 
        }
      }]
    };
  }, [data]);
  
  // Apply filters and sorting
  const processedData = useMemo(() => {
    let result = [...tableInfo.rows];
    
    // Note: Search filtering is now handled by the TableSearch component
    // We don't need to apply search filtering here since the search component
    // handles its own result highlighting and navigation
    
    // Apply column filters
    filters.forEach(filter => {
      result = result.filter(row => {
        const value = tableInfo.type === 'single-object' 
          ? row.data[filter.column]
          : row.data[filter.column] || row.data;
        
        const stringValue = String(value).toLowerCase();
        const filterValue = filter.value.toLowerCase();
        
        switch (filter.operator) {
          case 'equals':
            return stringValue === filterValue;
          case 'contains':
            return stringValue.includes(filterValue);
          case 'startsWith':
            return stringValue.startsWith(filterValue);
          case 'endsWith':
            return stringValue.endsWith(filterValue);
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          case 'gte':
            return Number(value) >= Number(filter.value);
          case 'lte':
            return Number(value) <= Number(filter.value);
          default:
            return true;
        }
      });
    });
    
    // Apply sorting
    if (sortState.column && sortState.direction) {
      result.sort((a, b) => {
        let aVal, bVal;
        
        if (tableInfo.type === 'single-object') {
          aVal = a.data[sortState.column!];
          bVal = b.data[sortState.column!];
        } else {
          aVal = a.data[sortState.column!] || a.data;
          bVal = b.data[sortState.column!] || b.data;
        }
        
        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortState.direction === 'asc' ? 1 : -1;
        if (bVal == null) return sortState.direction === 'asc' ? -1 : 1;
        
        // Compare values
        let result = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          result = aVal - bVal;
        } else {
          result = String(aVal).localeCompare(String(bVal));
        }
        
        return sortState.direction === 'desc' ? -result : result;
      });
    }
    
    return result;
  }, [tableInfo, filters, sortState]);
  
  
  
  
  
  // Event handlers
  const handleSort = useCallback((column: string) => {
    setSortState(prev => {
      if (prev.column === column) {
        if (prev.direction === 'asc') {
          return { column, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { column: null, direction: null };
        }
      }
      return { column, direction: 'asc' };
    });
  }, []);
  
  const handleAddFilter = useCallback(() => {
    if (!filterColumn || !filterValue.trim()) {
      toast.error('Please select a column and enter a filter value');
      return;
    }
    
    const newFilter: TableFilter = {
      id: Date.now().toString(),
      column: filterColumn,
      operator: filterOperator,
      value: filterValue
    };
    setFilters(prev => [...prev, newFilter]);
    setShowFilterDialog(false);
    
    // Reset form
    setFilterColumn('');
    setFilterOperator('contains');
    setFilterValue('');
    
    toast.success('Filter added successfully');
  }, [filterColumn, filterOperator, filterValue]);
  
  const handleRemoveFilter = useCallback((filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);
  
  const handleClearAllFilters = useCallback(() => {
    setFilters([]);
    // Note: Search term is now managed by TableSearch component
  }, []);
  
  const handleOpenFilterDialog = useCallback(() => {
    // Initialize with first column if not set
    if (!filterColumn && tableInfo.columns.length > 0) {
      setFilterColumn(tableInfo.columns[0].key);
    }
    setShowFilterDialog(true);
  }, [filterColumn, tableInfo.columns]);
  
  const handleToggleExpand = useCallback((rowKey: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowKey)) {
        newSet.delete(rowKey);
      } else {
        newSet.add(rowKey);
      }
      return newSet;
    });
  }, []);


  // 展开全部 - 递进式展开策略
  const handleExpandAll = useCallback(() => {
    // 先展开第一层，然后递进展开更深层
    const expandRecursively = (currentExpanded: Set<string>, maxDepth = 10) => {
      if (maxDepth <= 0) return currentExpanded;
      
      const newExpanded = new Set(currentExpanded);
      let foundNewKeys = false;
      
      // 基于当前展开状态，查找新的可展开节点
      processedData.forEach((row, displayIndex) => {
        if (tableInfo.type === 'single-object') {
          // 对于单个对象类型，检查每个值
          if (row.data.value != null && (typeof row.data.value === 'object' || Array.isArray(row.data.value))) {
            const mainRowKey = `${displayIndex}-value`;
            if (!newExpanded.has(mainRowKey)) {
              newExpanded.add(mainRowKey);
              foundNewKeys = true;
            }
            
            // 如果这个节点已经展开，检查其内部的嵌套节点
            if (currentExpanded.has(mainRowKey) && Array.isArray(row.data.value)) {
              row.data.value.forEach((item: any, itemIndex: number) => {
                if (item && typeof item === 'object') {
                  Object.entries(item).forEach(([key, value]) => {
                    if (value != null && (typeof value === 'object' || Array.isArray(value))) {
                      const nestedRowKey = `${itemIndex}-${key}`;
                      if (!newExpanded.has(nestedRowKey)) {
                        newExpanded.add(nestedRowKey);
                        foundNewKeys = true;
                      }
                    }
                  });
                }
              });
            }
          }
        }
        // 可以在这里添加对其他表格类型的处理
      });
      
      // 如果找到了新的键，继续递归；否则停止
      if (foundNewKeys) {
        return expandRecursively(newExpanded, maxDepth - 1);
      } else {
        return newExpanded;
      }
    };
    
    // 从当前展开状态开始递进展开
    const finalExpanded = expandRecursively(expandedRows);
    
    
    setExpandedRows(finalExpanded);
  }, [processedData, tableInfo.type, expandedRows]);

  // 折叠全部
  const handleCollapseAll = useCallback(() => {
    setExpandedRows(new Set());
  }, []);
  
  const handleStartEdit = useCallback((rowIndex: number, column: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, column });
    // Format JSON values with proper indentation for better editing experience
    if (typeof currentValue === 'string') {
      setEditValue(currentValue);
    } else if (currentValue === null || currentValue === undefined) {
      setEditValue(String(currentValue));
    } else {
      setEditValue(JSON.stringify(currentValue, null, 2));
    }
  }, []);
  
  const handleSaveEdit = useCallback(() => {
    if (!editingCell || !onUpdate) return;
    
    try {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        parsedValue = editValue;
      }
      
      const newData = JSON.parse(JSON.stringify(data));
      
      if (tableInfo.type === 'object-array') {
        newData[editingCell.row][editingCell.column] = parsedValue;
      } else if (tableInfo.type === 'primitive-array') {
        newData[editingCell.row] = parsedValue;
      } else if (tableInfo.type === 'single-object') {
        const entries = Object.entries(newData);
        if (editingCell.column === 'value') {
          const [key] = entries[editingCell.row];
          newData[key] = parsedValue;
        }
      } else if (tableInfo.type === 'primitive') {
        // For primitive values, replace the entire data
        onUpdate(parsedValue);
        setEditingCell(null);
        setEditValue('');
        toast.success('Value updated successfully');
        return;
      }
      
      onUpdate(newData);
      setEditingCell(null);
      setEditValue('');
      toast.success('Value updated successfully');
    } catch (error) {
      toast.error('Failed to update value');
    }
  }, [editingCell, editValue, data, tableInfo.type, onUpdate]);
  
  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);
  
  const handleAddRow = useCallback(() => {
    if (!onUpdate) return;
    
    if (tableInfo.type === 'object-array') {
      const newRow = Object.fromEntries(
        tableInfo.columns.map(col => [col.key, null])
      );
      onUpdate([...data, newRow]);
    } else if (tableInfo.type === 'primitive-array') {
      onUpdate([...data, '']);
    }
    
    setShowAddRowDialog(false);
    setNewRowData({});
  }, [data, tableInfo, onUpdate]);
  
  const handleDeleteRow = useCallback((rowIndex: number) => {
    if (!onUpdate) return;
    
    if (tableInfo.type === 'object-array' || tableInfo.type === 'primitive-array') {
      const newData = data.filter((_: any, index: number) => index !== rowIndex);
      onUpdate(newData);
    } else if (tableInfo.type === 'single-object') {
      // 对于对象类型，删除当前行（键值对）
      const entries = Object.entries(data);
      const [keyToDelete] = entries[rowIndex];
      const newData = { ...data };
      delete newData[keyToDelete];
      onUpdate(newData);
      toast.success(`Deleted property "${keyToDelete}"`);
    }
  }, [data, tableInfo.type, onUpdate]);
  
  const handleDuplicateRow = useCallback((rowIndex: number) => {
    if (!onUpdate) return;
    
    if (tableInfo.type === 'object-array' || tableInfo.type === 'primitive-array') {
      const rowToDuplicate = JSON.parse(JSON.stringify(data[rowIndex]));
      const newData = [...data];
      newData.splice(rowIndex + 1, 0, rowToDuplicate);
      onUpdate(newData);
    } else if (tableInfo.type === 'single-object') {
      // 对于对象类型，克隆当前行（键值对）
      const entries = Object.entries(data);
      const [key, value] = entries[rowIndex];
      const newKey = `${key}_copy`;
      const newValue = JSON.parse(JSON.stringify(value));
      const newData = { ...data, [newKey]: newValue };
      onUpdate(newData);
      toast.success(`Cloned property "${key}" as "${newKey}"`);
    }
  }, [data, tableInfo.type, onUpdate]);
  
  const handleExportData = useCallback((format: ExportFormat) => {
    let dataToExport: any[];
    
    if (tableInfo.type === 'single-object') {
      // 对于单个对象类型，重构为键值对对象
      const exportObject: Record<string, any> = {};
      processedData.forEach(row => {
        const { key, value } = row.data;
        exportObject[key] = value;
      });
      dataToExport = [exportObject];
    } else if (tableInfo.type === 'object-array') {
      // 对于对象数组，直接使用原始数据
      dataToExport = data;
    } else if (tableInfo.type === 'primitive-array') {
      // 对于原始值数组，直接使用原始数据
      dataToExport = data;
    } else {
      // 对于原始值，包装为对象
      dataToExport = [{ value: data }];
    }
    
    exportData(dataToExport, format);
  }, [processedData, tableInfo.type, data]);

  // 获取可用的导出选项
  const exportOptions = useMemo(() => {
    let dataToExport: any[];
    
    if (tableInfo.type === 'single-object') {
      // 对于单个对象类型，重构为键值对对象
      const exportObject: Record<string, any> = {};
      processedData.forEach(row => {
        const { key, value } = row.data;
        exportObject[key] = value;
      });
      dataToExport = [exportObject];
    } else if (tableInfo.type === 'object-array') {
      // 对于对象数组，直接使用原始数据
      dataToExport = data;
    } else if (tableInfo.type === 'primitive-array') {
      // 对于原始值数组，直接使用原始数据
      dataToExport = data;
    } else {
      // 对于原始值，包装为对象
      dataToExport = [{ value: data }];
    }
    
    return getExportOptions(dataToExport);
  }, [processedData, tableInfo.type, data]);
  

  // Callback to handle search options updates from the search component
  const handleSearchOptionsUpdate = useCallback((state: {
    searchResults: Array<{rowIndex: number, columnKey: string, text: string, path?: string[]}>;
    currentSearchIndex: number;
    caseSensitive: boolean;
    useRegex: boolean;
    wholeWord: boolean;
  }) => {
    setSearchResults(state.searchResults);
    setCurrentSearchIndex(state.currentSearchIndex);
    setCaseSensitive(state.caseSensitive);
    setUseRegex(state.useRegex);
    setWholeWord(state.wholeWord);
  }, []);
  
  // Render cell content
  const renderCellContent = useCallback((value: any, rowIndex: number, column: string) => {
    const isEditing = editingCell?.row === rowIndex && editingCell?.column === column;
    const rowKey = `${rowIndex}-${column}`;
    
    if (isEditing) {
      const isComplexValue = value && (typeof value === 'object');
      
      return (
        <div className="flex flex-col gap-2 min-w-0">
          {isComplexValue ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancelEdit();
                }
              }}
              className="text-xs font-mono min-h-[100px] max-h-[300px] w-full resize-y"
              placeholder="Enter JSON..."
              autoFocus
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="h-8 text-xs"
              autoFocus
            />
          )}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveEdit}
              size="sm"
              className="h-6 px-2 text-xs"
            >
              Save
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              Cancel
            </Button>
            {isComplexValue && (
              <span className="text-xs text-muted-foreground">
                Press Ctrl+Enter to save
              </span>
            )}
          </div>
        </div>
      );
    }
    
    // Check if value is complex (object or array) and handle it appropriately
    if (value != null && (typeof value === 'object' || Array.isArray(value))) {
      const isExpanded = effectiveForcedExpandAll || expandedRows.has(rowKey);
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleExpand(rowKey)}
              className="h-6 px-2 text-xs"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span className="font-mono ml-1">
                {Array.isArray(value) ? `Array (${value.length})` : `Object (${Object.keys(value).length})`}
              </span>
            </Button>
          </div>
          {isExpanded && (
            <div className="ml-2 border-gray-200 dark:border-gray-700">
              <EnhancedTableView
                data={value}
                path={[...path, rowIndex.toString(), column]}
                onUpdate={(newValue) => {
                  if (!onUpdate) return;
                  const newData = JSON.parse(JSON.stringify(data));
                  if (tableInfo.type === 'object-array') {
                    newData[rowIndex][column] = newValue;
                  } else {
                    newData[rowIndex] = newValue;
                  }
                  onUpdate(newData);
                }}
                className="text-xs"
                maxHeight="300px"
                density={density}
                showSearch={false}
                searchTerm={effectiveSearchTerm}
                isMainView={false}
                // 透传级联信号
                expandTick={effectiveExpandTick}
                collapseTick={effectiveCollapseTick}
                // 透传：强制展开状态
                forcedExpandAll={effectiveForcedExpandAll}
              />
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-between group">
        <span 
          className={cn(
            "font-mono text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded",
            getValueType(value) === 'string' && "text-green-600 dark:text-green-400",
            getValueType(value) === 'number' && "text-blue-600 dark:text-blue-400",
            getValueType(value) === 'boolean' && "text-purple-600 dark:text-purple-400",
            getValueType(value) === 'null' && "text-gray-500 dark:text-gray-400"
          )}
          onClick={() => handleStartEdit(rowIndex, column, value)}
        >
          {(() => {
            // Ensure we always get a proper string representation
            const formattedValue = formatValue(value);
            
            if (effectiveSearchTerm) {
              return highlightText(String(formattedValue), effectiveSearchTerm, rowIndex, column, {
                caseSensitive,
                useRegex,
                wholeWord,
                currentSearchIndex,
                searchResults
              });
            }
            
            return formattedValue;
          })()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStartEdit(rowIndex, column, value)}
          className="opacity-0 group-hover:opacity-100 h-6 px-2"
        >
          <Edit3 size={12} />
        </Button>
      </div>
    );
  }, [editingCell, editValue, expandedRows, path, data, tableInfo.type, density, onUpdate, handleStartEdit, handleSaveEdit, handleCancelEdit, handleToggleExpand, effectiveSearchTerm, caseSensitive, useRegex, wholeWord, currentSearchIndex, searchResults, effectiveForcedExpandAll]);
  
  if (!data) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No data to display</p>
      </div>
    );
  }
  
  if (tableInfo.type === 'empty' || (tableInfo.type !== 'primitive' && tableInfo.rows.length === 0)) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-sm">No data to display</p>
          {onUpdate && (
            <Button
              onClick={() => setShowAddRowDialog(true)}
              className="mt-2"
              size="sm"
            >
              <Plus size={14} className="mr-1" />
              Add first item
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Enhanced Toolbar - Show for main view only */}
      {isMainView && (
        <div className={cn(
          "flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg shrink-0",
          density === 'compact' ? "p-2 gap-2" : "p-3 gap-4"
        )}>
          <div className="flex items-center gap-3">
            {/* Search Component */}
            <TableSearch
              showSearch={showSearch}
              searchTerm={parentSearchTerm}
              data={data}
              tableInfo={tableInfo}
              path={path}
              onUpdate={onUpdate}
              onSearchChange={setSearchTerm}
              onSearchStateChange={handleSearchOptionsUpdate}
              density={density}
            />
            
            {/* Expand/Collapse All Buttons */}
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // 本地广播 + 强制展开
                  setLocalExpandTick((t) => t + 1);
                  setForcedExpandAll(true);
                  handleExpandAll();
                }}
                className="h-8 px-2 text-xs border-0 rounded-l rounded-r-none"
                title="展开全部嵌套节点"
              >
                <Expand size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalCollapseTick((t) => t + 1);
                  setForcedExpandAll(false);
                  handleCollapseAll();
                }}
                className="h-8 px-2 text-xs border-0 rounded-r rounded-l-none border-l border-gray-300 dark:border-gray-600"
                title="折叠全部嵌套节点"
              >
                <Minimize size={14} />
              </Button>
            </div>
            
            {/* Filter status indicator */}
            {filters.length > 0 && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {filters.length} filter{filters.length > 1 ? 's' : ''} active
              </span>
            )}
          </div>
          
          {/* Show item count for main view */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {processedData.length} {processedData.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      )}
      
      {/* Filter Chips */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 shrink-0">
          {filters.map(filter => (
            <div
              key={filter.id}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md text-xs"
            >
              <span>{filter.column} {filter.operator} &quot;{filter.value}&quot;</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFilter(filter.id)}
                className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <X size={10} />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Table */}
      <div className={cn(
        "flex-1 overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 min-h-0",
        "scrollbar-table"
      )} style={maxHeight ? { maxHeight } : {}}>
        <table ref={tableRef} className="w-full bg-white dark:bg-gray-900" style={{ minWidth: 'max-content' }}>
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {/* Row number column - 数组表格显示行号列，但不包含操作菜单 */}
              {tableInfo.type !== 'single-object' && (
                <th className={cn(
                  "text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider w-12 whitespace-nowrap border-l border-r border-gray-200 dark:border-gray-700",
                  density === 'compact' ? "px-2 py-1" : "px-1 py-2"
                )}>
                  #
                </th>
              )}
              
              {/* Data columns */}
              {tableInfo.columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap border-r border-gray-200 dark:border-gray-700",
                    density === 'compact' ? "px-2 py-1" : "px-3 py-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.key)}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUpDown size={12} />
                      </Button>
                    )}
                    {sortState.column === column.key && sortState.direction && (
                      <span className="text-blue-600 dark:text-blue-400 text-xs">
                        {sortState.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions column - 为所有可编辑类型显示Actions列 */}
              {onUpdate && (
                <th className={cn(
                  "text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider w-20 whitespace-nowrap border-r border-gray-200 dark:border-gray-700",
                  density === 'compact' ? "px-3 py-1" : "px-3 py-2"
                )}>
                  <div className="flex items-center gap-2">
                    <span>Actions</span>
                    {/* 对象节点表格和数组表格显示表级操作菜单 */}
                    {(tableInfo.type === 'single-object' || tableInfo.type === 'object-array' || tableInfo.type === 'primitive-array') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="h-6 w-6 p-0" title="Table Actions">
                            <MoreHorizontal size={12} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
                          <DropdownMenuItem onClick={handleOpenFilterDialog} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Filter size={14} className="mr-2" />
                            Add Filter
                          </DropdownMenuItem>
                          
                          {/* Export submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <Download size={14} className="mr-2" />
                              Export Data
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
                              {exportOptions.map((option) => (
                                <DropdownMenuItem 
                                  key={option.format}
                                  onClick={() => handleExportData(option.format)}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{option.label}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          
                          {/* Edit Table Data */}
                          <DropdownMenuItem 
                            onClick={() => {
                              // 打开JSON编辑对话框
                              setJsonEditValue(JSON.stringify(data, null, 2));
                              setShowJsonEditDialog(true);
                            }}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Edit3 size={14} className="mr-2" />
                            Edit Table Data
                          </DropdownMenuItem>
                          
                          {filters.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={handleClearAllFilters} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <X size={14} className="mr-2" />
                                Clear All Filters
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
            {processedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {/* Row number column - 对象类型表格节点不显示此列 */}
                {tableInfo.type !== 'single-object' && (
                  <td className={cn(
                    "text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap border-l border-r border-gray-200 dark:border-gray-700",
                    density === 'compact' ? "px-2 py-1" : "px-3 py-2"
                  )}>
                    {(tableInfo.type === 'object-array' || tableInfo.type === 'primitive-array') 
                      ? row.index + 1 
                      : ''
                    }
                  </td>
                )}
                
                {/* Data cells */}
                {tableInfo.columns.map((column) => (
                  <td key={column.key} className={cn(
                    "whitespace-nowrap border-r border-gray-200 dark:border-gray-700",
                    density === 'compact' ? "px-2 py-1" : "px-3 py-2"
                  )}>
                    {tableInfo.type === 'single-object'
                      ? renderCellContent(row.data[column.key], index, column.key)
                      : tableInfo.type === 'primitive'
                        ? renderCellContent(row.data[column.key], index, column.key)
                        : tableInfo.type === 'object-array'
                          ? renderCellContent(row.data[column.key], row.index, column.key)
                          : column.key === 'value'
                            ? renderCellContent(row.data, row.index, 'value')
                            : null
                    }
                  </td>
                ))}
                
                {/* Actions - 为所有可编辑类型显示Actions列 */}
                {onUpdate && (
                  <td className={cn(
                    "whitespace-nowrap border-r border-gray-200 dark:border-gray-700",
                    density === 'compact' ? "px-2 py-1" : "px-3 py-2"
                  )}>
                    <div className="flex items-center gap-1">
                      {(tableInfo.type === 'object-array' || tableInfo.type === 'primitive-array') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateRow(row.index)}
                            className="h-6 w-6 p-0"
                            title="Duplicate row"
                          >
                            <Copy size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRow(row.index)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            title="Delete row"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </>
                      )}
                      {tableInfo.type === 'single-object' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateRow(index)}
                            className="h-6 w-6 p-0"
                            title="Clone property"
                          >
                            <Copy size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRow(index)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            title="Delete property"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </>
                      )}
                      {tableInfo.type === 'primitive' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(index, 'value', row.data.value)}
                          className="h-6 w-6 p-0"
                          title="Edit value"
                        >
                          <Edit3 size={12} />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Column
              </label>
              <Select value={filterColumn} onValueChange={setFilterColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column to filter" />
                </SelectTrigger>
                <SelectContent>
                  {tableInfo.columns.map(col => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Operator
              </label>
              <Select value={filterOperator} onValueChange={(value) => setFilterOperator(value as TableFilter['operator'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="startsWith">Starts with</SelectItem>
                  <SelectItem value="endsWith">Ends with</SelectItem>
                  <SelectItem value="gt">Greater than</SelectItem>
                  <SelectItem value="gte">Greater than or equal</SelectItem>
                  <SelectItem value="lt">Less than</SelectItem>
                  <SelectItem value="lte">Less than or equal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Value
              </label>
              <Input 
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Enter filter value..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFilter();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowFilterDialog(false);
                // Reset form when canceling
                setFilterColumn('');
                setFilterOperator('contains');
                setFilterValue('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddFilter}
              disabled={!filterColumn || !filterValue.trim()}
            >
              Add Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* JSON编辑对话框 */}
      <Dialog open={showJsonEditDialog} onOpenChange={setShowJsonEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Table Data as JSON</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <Textarea
              value={jsonEditValue}
              onChange={(e) => setJsonEditValue(e.target.value)}
              className="w-full h-96 font-mono text-sm resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              placeholder="Enter JSON data..."
            />
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setShowJsonEditDialog(false);
                setJsonEditValue('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                try {
                  const parsedData = JSON.parse(jsonEditValue);
                  if (onUpdate) {
                    onUpdate(parsedData);
                    toast.success('Table data updated successfully');
                  }
                  setShowJsonEditDialog(false);
                  setJsonEditValue('');
                } catch (error) {
                  toast.error('Invalid JSON format. Please check your syntax.');
                }
              }}
              disabled={!jsonEditValue.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}