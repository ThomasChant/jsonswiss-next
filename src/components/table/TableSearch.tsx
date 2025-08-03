"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search,
  ChevronUp,
  ChevronDown,
  Replace
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { formatValue } from '@/lib/table-utils';

// Helper functions for replace operations
function isReplaceableValue(value: any): boolean {
  // 允许替换字符串、数字、布尔值、null和undefined
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  );
}

function convertToOriginalType(newValue: string, originalValue: any): any {
  // 如果原值是null，尝试解析新值
  if (originalValue === null) {
    if (newValue === 'null') return null;
    if (newValue === 'undefined') return undefined;
    if (newValue === 'true') return true;
    if (newValue === 'false') return false;
    // 尝试转换为数字
    const num = Number(newValue);
    if (!isNaN(num)) return num;
    return newValue; // 保持为字符串
  }
  
  // 如果原值是undefined，尝试解析新值
  if (originalValue === undefined) {
    if (newValue === 'null') return null;
    if (newValue === 'undefined') return undefined;
    if (newValue === 'true') return true;
    if (newValue === 'false') return false;
    // 尝试转换为数字
    const num = Number(newValue);
    if (!isNaN(num)) return num;
    return newValue; // 保持为字符串
  }
  
  // 如果原值是布尔值，尝试转换回布尔值
  if (typeof originalValue === 'boolean') {
    if (newValue === 'true') return true;
    if (newValue === 'false') return false;
    // 如果不是标准布尔字符串，保持为字符串
    return newValue;
  }
  
  // 如果原值是数字，尝试转换回数字
  if (typeof originalValue === 'number') {
    const num = Number(newValue);
    if (!isNaN(num)) return num;
    return newValue; // 如果转换失败，返回字符串
  }
  
  // 默认返回字符串
  return newValue;
}

interface SearchResult {
  rowIndex: number;
  columnKey: string;
  text: string;
  path?: string[];
}

interface TableSearchProps {
  /** Show search functionality */
  showSearch?: boolean;
  /** External search term (for nested tables) */
  searchTerm?: string;
  /** Table data for searching */
  data: any;
  /** Table information (type, columns, rows) */
  tableInfo: {
    type: string;
    columns: Array<{ key: string; label: string; type: string; sortable: boolean }>;
    rows: Array<{ index: number; data: any }>;
  };
  /** Current path for nested searching */
  path?: string[];
  /** Callback for data updates */
  onUpdate?: (newData: any) => void;
  /** Callback when search term changes */
  onSearchChange?: (searchTerm: string) => void;
  /** Callback when search state changes */
  onSearchStateChange?: (state: {
    searchResults: SearchResult[];
    currentSearchIndex: number;
    caseSensitive: boolean;
    useRegex: boolean;
    wholeWord: boolean;
  }) => void;
  /** Density setting */
  density?: 'comfortable' | 'regular' | 'compact';
}

export function TableSearch({
  showSearch = true,
  searchTerm: parentSearchTerm,
  data,
  tableInfo,
  path = [],
  onUpdate,
  onSearchChange,
  onSearchStateChange,
  density = 'compact'
}: TableSearchProps) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showReplace, setShowReplace] = useState(false);
  const [replaceValue, setReplaceValue] = useState('');
  
  // Search options state
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  
  
  
  // Use parent search term for nested tables, own search term for root tables
  const effectiveSearchTerm = parentSearchTerm || searchTerm;
  
  // Recursive function to search nested data structures
  const searchNestedData = useCallback((data: any, searchTerm: string, path: string[] = []): SearchResult[] => {
    const results: SearchResult[] = [];
    
    if (!data || !searchTerm) return results;
    
    // Helper function to check if a value matches search term
    const matchesSearch = (value: any): boolean => {
      if (value == null) return false;
      const valueStr = String(value);
      
      try {
        if (useRegex) {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(searchTerm, flags);
          return regex.test(valueStr);
        } else {
          const searchStr = caseSensitive ? searchTerm : searchTerm.toLowerCase();
          const targetStr = caseSensitive ? valueStr : valueStr.toLowerCase();
          
          if (wholeWord) {
            const wordRegex = new RegExp(`\\b${searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
            return wordRegex.test(valueStr);
          } else {
            return targetStr.includes(searchStr);
          }
        }
      } catch (error) {
        // If regex is invalid, fall back to simple string matching
        const searchStr = caseSensitive ? searchTerm : searchTerm.toLowerCase();
        const targetStr = caseSensitive ? valueStr : valueStr.toLowerCase();
        return targetStr.includes(searchStr);
      }
    };
    
    // Helper function to recursively search in nested structures
    const searchInValue = (value: any, currentPath: string[]): void => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          const itemPath = [...currentPath, index.toString()];
          if (matchesSearch(item)) {
            results.push({
              rowIndex: index,
              columnKey: 'value',
              text: String(item),
              path: itemPath
            });
          }
          // Recursively search nested structures
          if (item && typeof item === 'object') {
            searchInValue(item, itemPath);
          }
        });
      } else if (value && typeof value === 'object') {
        Object.entries(value).forEach(([key, val]) => {
          const keyPath = [...currentPath, key];
          // Search in key names
          if (matchesSearch(key)) {
            results.push({
              rowIndex: 0,
              columnKey: 'key',
              text: key,
              path: keyPath
            });
          }
          // Search in values
          if (matchesSearch(val)) {
            results.push({
              rowIndex: 0,
              columnKey: 'value',
              text: String(val),
              path: keyPath
            });
          }
          // Recursively search nested structures
          if (val && typeof val === 'object') {
            searchInValue(val, keyPath);
          }
        });
      }
    };
    
    // Start the recursive search
    searchInValue(data, path);
    
    return results;
  }, [caseSensitive, useRegex, wholeWord]);
  
  // Calculate search results with nested search support
  const searchResultsData = useMemo(() => {
    if (!showSearch || !effectiveSearchTerm || effectiveSearchTerm.trim().length === 0) {
      setCurrentSearchIndex(-1);
      return [];
    }
    
    
    const results: SearchResult[] = [];
    
    // Search in current level data
    tableInfo.rows.forEach((row, index) => {
      tableInfo.columns.forEach((column) => {
        // Skip computed type column in search
        if (column.key === 'type') {
          return;
        }
        
        let cellValue: any;
        
        // Get the appropriate cell value based on table type and column
        if (tableInfo.type === 'single-object' || tableInfo.type === 'primitive') {
          // For single-object and primitive types, the data contains computed fields like 'type'
          cellValue = row.data[column.key];
        } else if (tableInfo.type === 'object-array') {
          cellValue = row.data[column.key];
        } else if (column.key === 'value') {
          cellValue = row.data;
        } else {
          cellValue = row.data[column.key];
        }
        
        const cellText = formatValue(cellValue);
        if (cellText) {
          const valueStr = String(cellText);
          let matchCount = 0;
          
          
          try {
            if (useRegex) {
              const flags = caseSensitive ? 'g' : 'gi';
              const regex = new RegExp(effectiveSearchTerm, flags);
              const matches = valueStr.match(regex);
              matchCount = matches ? matches.length : 0;
            } else {
              const searchStr = caseSensitive ? effectiveSearchTerm : effectiveSearchTerm.toLowerCase();
              const targetStr = caseSensitive ? valueStr : valueStr.toLowerCase();
              
              if (wholeWord) {
                const wordRegex = new RegExp(`\\b${searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
                const matches = valueStr.match(wordRegex);
                matchCount = matches ? matches.length : 0;
              } else {
                // Count occurrences of the search term
                let startIndex = 0;
                while (true) {
                  const foundIndex = targetStr.indexOf(searchStr, startIndex);
                  if (foundIndex === -1) break;
                  matchCount++;
                  startIndex = foundIndex + 1;
                }
              }
            }
          } catch (error) {
            // If regex is invalid, fall back to simple string matching
            const searchStr = caseSensitive ? effectiveSearchTerm : effectiveSearchTerm.toLowerCase();
            const targetStr = caseSensitive ? valueStr : valueStr.toLowerCase();
            let startIndex = 0;
            while (true) {
              const foundIndex = targetStr.indexOf(searchStr, startIndex);
              if (foundIndex === -1) break;
              matchCount++;
              startIndex = foundIndex + 1;
            }
          }
          
          // Add a search result for each match found in this cell
          for (let i = 0; i < matchCount; i++) {
            results.push({
              rowIndex: index,
              columnKey: column.key,
              text: valueStr
            });
          }
        }
        
        // Search nested structures within this cell
        if (cellValue && typeof cellValue === 'object') {
          const nestedResults = searchNestedData(cellValue, effectiveSearchTerm, [...path, index.toString(), column.key]);
          results.push(...nestedResults.map(result => ({
            ...result,
            rowIndex: index, // Keep the parent row index for highlighting
            columnKey: column.key // Keep the parent column for highlighting
          })));
        }
      });
    });
    
    return results;
  }, [tableInfo, effectiveSearchTerm, showSearch, searchNestedData, path, caseSensitive, useRegex, wholeWord]);
  
  // Update search results when they change
  useEffect(() => {
    setSearchResults(searchResultsData);
    if (searchResultsData.length > 0 && currentSearchIndex === -1) {
      setCurrentSearchIndex(0);
    } else if (searchResultsData.length === 0) {
      setCurrentSearchIndex(-1);
    }
  }, [searchResultsData, currentSearchIndex]);
  
  // Notify parent component when search state changes
  useEffect(() => {
    onSearchStateChange?.({
      searchResults,
      currentSearchIndex,
      caseSensitive,
      useRegex,
      wholeWord
    });
  }, [searchResults, currentSearchIndex, caseSensitive, useRegex, wholeWord, onSearchStateChange]);
  
  // Helper function to create regex for replacement
  const createReplaceRegex = useCallback((searchTerm: string) => {
    if (useRegex) {
      try {
        const flags = caseSensitive ? 'g' : 'gi';
        return new RegExp(searchTerm, flags);
      } catch (error) {
        // If regex is invalid, fall back to escaped string
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        return new RegExp(escapedTerm, flags);
      }
    } else {
      let pattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      const flags = caseSensitive ? 'g' : 'gi';
      return new RegExp(pattern, flags);
    }
  }, [caseSensitive, useRegex, wholeWord]);
  
  // Search navigation handlers
  const handleSearchNext = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex(prev => (prev + 1) % searchResults.length);
  }, [searchResults.length]);
  
  const handleSearchPrevious = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex(prev => prev === 0 ? searchResults.length - 1 : prev - 1);
  }, [searchResults.length]);
  
  // Replace handlers
  const handleToggleReplace = useCallback(() => {
    setShowReplace(!showReplace);
    if (!showReplace) {
      setReplaceValue('');
    }
  }, [showReplace]);
  
  const handleReplaceOne = useCallback(() => {
    if (currentSearchIndex === -1 || !searchResults[currentSearchIndex] || !onUpdate) return;
    
    const currentResult = searchResults[currentSearchIndex];
    const rowIndex = currentResult.rowIndex;
    const columnKey = currentResult.columnKey;
    
    try {
      const newData = JSON.parse(JSON.stringify(data));
      
      const regex = createReplaceRegex(effectiveSearchTerm);
      
      if (tableInfo.type === 'object-array') {
        const currentValue = newData[rowIndex][columnKey];
        // 获取格式化后的显示文本，这与搜索逻辑保持一致
        const formattedValue = formatValue(currentValue);
        // 对可替换的数据类型进行替换，且搜索结果中的文本要与格式化值匹配
        if (isReplaceableValue(currentValue) && currentResult.text === formattedValue) {
          const newValue = formattedValue.replace(regex, replaceValue);
          // 尝试将新值转换回原始数据类型
          const convertedValue = convertToOriginalType(newValue, currentValue);
          newData[rowIndex][columnKey] = convertedValue;
        }
      } else if (tableInfo.type === 'primitive-array') {
        const currentValue = newData[rowIndex];
        const formattedValue = formatValue(currentValue);
        // 对可替换的数据类型进行替换，且搜索结果中的文本要与格式化值匹配
        if (isReplaceableValue(currentValue) && currentResult.text === formattedValue) {
          const newValue = formattedValue.replace(regex, replaceValue);
          // 尝试将新值转换回原始数据类型
          const convertedValue = convertToOriginalType(newValue, currentValue);
          newData[rowIndex] = convertedValue;
        }
      } else if (tableInfo.type === 'single-object') {
        // For single-object type, we need to handle different columns differently
        if (columnKey === 'type') {
          // Type column is computed and cannot be replaced
          toast.error('Cannot replace computed type values');
          return;
        } else if (columnKey === 'key') {
          // Replace key name - this would change the object structure
          const entries = Object.entries(newData);
          const [oldKey, value] = entries[rowIndex];
          if (typeof oldKey === 'string' && currentResult.text === oldKey) {
            const newKey = oldKey.replace(regex, replaceValue);
            if (newKey !== oldKey && !newData.hasOwnProperty(newKey)) {
              // 保持键的顺序：重新构建对象而不是删除后添加
              const newObject: any = {};
              for (const [key, val] of entries) {
                if (key === oldKey) {
                  newObject[newKey] = value;
                } else {
                  newObject[key] = val;
                }
              }
              // 替换整个对象以保持键的顺序
              Object.keys(newData).forEach(key => delete newData[key]);
              Object.assign(newData, newObject);
            } else if (newKey === oldKey) {
              // No change needed
            } else {
              toast.error('Cannot replace key: new key already exists');
              return;
            }
          }
        } else if (columnKey === 'value') {
          // Replace value
          const entries = Object.entries(newData);
          const [key] = entries[rowIndex];
          const currentValue = newData[key];
          const formattedValue = formatValue(currentValue);
          // 对可替换的数据类型进行替换，且搜索结果中的文本要与格式化值匹配
          if (isReplaceableValue(currentValue) && currentResult.text === formattedValue) {
            const newValue = formattedValue.replace(regex, replaceValue);
            // 尝试将新值转换回原始数据类型
            const convertedValue = convertToOriginalType(newValue, currentValue);
            newData[key] = convertedValue;
          }
        }
      } else if (tableInfo.type === 'primitive') {
        // For primitive type, handle different columns
        if (columnKey === 'type') {
          // Type column is computed and cannot be replaced
          toast.error('Cannot replace computed type values');
          return;
        } else if (columnKey === 'value') {
          // Replace the primitive value
          const formattedValue = formatValue(data);
          // 对可替换的数据类型进行替换，且搜索结果中的文本要与格式化值匹配
          if (isReplaceableValue(data) && currentResult.text === formattedValue) {
            const newValue = formattedValue.replace(regex, replaceValue);
            // 尝试将新值转换回原始数据类型
            const convertedValue = convertToOriginalType(newValue, data);
            onUpdate(convertedValue);
            toast.success('Value replaced successfully');
            return;
          }
        }
      }
      
      onUpdate(newData);
      toast.success('Value replaced successfully');
      
      // Move to next search result
      handleSearchNext();
    } catch (error) {
      toast.error('Failed to replace value');
    }
  }, [currentSearchIndex, searchResults, effectiveSearchTerm, replaceValue, data, tableInfo.type, onUpdate, handleSearchNext, createReplaceRegex]);
  
  const handleReplaceAll = useCallback(() => {
    if (!effectiveSearchTerm || !onUpdate) return;
    
    try {
      const newData = JSON.parse(JSON.stringify(data));
      let replaceCount = 0;
      const regex = createReplaceRegex(effectiveSearchTerm);
      
      // Group search results by location to handle multiple matches in the same cell
      const resultsByLocation = new Map();
      
      searchResults.forEach(result => {
        const locationKey = `${result.rowIndex}-${result.columnKey}`;
        if (!resultsByLocation.has(locationKey)) {
          resultsByLocation.set(locationKey, {
            rowIndex: result.rowIndex,
            columnKey: result.columnKey,
            count: 0
          });
        }
        resultsByLocation.get(locationKey).count++;
      });
      
      // Process each unique location
      resultsByLocation.forEach((locationInfo, locationKey) => {
        const rowIndex = locationInfo.rowIndex;
        const columnKey = locationInfo.columnKey;
        const matchCount = locationInfo.count;
        
        if (tableInfo.type === 'object-array') {
          const currentValue = newData[rowIndex][columnKey];
          // 对可替换的数据类型进行替换（包括 string, number, boolean, null）
          if (isReplaceableValue(currentValue)) {
            const formattedValue = formatValue(currentValue);
            const newValue = formattedValue.replace(regex, replaceValue);
            if (newValue !== formattedValue) {
              // 尝试将新值转换回原始数据类型
              const convertedValue = convertToOriginalType(newValue, currentValue);
              newData[rowIndex][columnKey] = convertedValue;
              replaceCount += matchCount; // Add the actual number of matches replaced
            }
          }
        } else if (tableInfo.type === 'primitive-array') {
          const currentValue = newData[rowIndex];
          // 对可替换的数据类型进行替换（包括 string, number, boolean, null）
          if (isReplaceableValue(currentValue)) {
            const formattedValue = formatValue(currentValue);
            const newValue = formattedValue.replace(regex, replaceValue);
            if (newValue !== formattedValue) {
              // 尝试将新值转换回原始数据类型
              const convertedValue = convertToOriginalType(newValue, currentValue);
              newData[rowIndex] = convertedValue;
              replaceCount += matchCount; // Add the actual number of matches replaced
            }
          }
        } else if (tableInfo.type === 'single-object') {
          // Skip computed type column
          if (columnKey === 'type') {
            // Skip type column replacements - just continue to next iteration
          } else if (columnKey === 'key') {
            // Replace key name
            const entries = Object.entries(newData);
            if (entries[rowIndex]) {
              const [oldKey, value] = entries[rowIndex];
              if (typeof oldKey === 'string') {
                const newKey = oldKey.replace(regex, replaceValue);
                if (newKey !== oldKey && !newData.hasOwnProperty(newKey)) {
                  // 保持键的顺序：重新构建对象而不是删除后添加
                  const newObject: any = {};
                  for (const [key, val] of entries) {
                    if (key === oldKey) {
                      newObject[newKey] = value;
                    } else {
                      newObject[key] = val;
                    }
                  }
                  // 替换整个对象以保持键的顺序
                  Object.keys(newData).forEach(key => delete newData[key]);
                  Object.assign(newData, newObject);
                  replaceCount += matchCount; // Add the actual number of matches replaced
                }
              }
            }
          } else if (columnKey === 'value') {
            // Replace value
            const entries = Object.entries(newData);
            if (entries[rowIndex]) {
              const [key] = entries[rowIndex];
              const currentValue = newData[key];
              // 对可替换的数据类型进行替换（包括 string, number, boolean, null）
              if (isReplaceableValue(currentValue)) {
                const formattedValue = formatValue(currentValue);
                const newValue = formattedValue.replace(regex, replaceValue);
                if (newValue !== formattedValue) {
                  // 尝试将新值转换回原始数据类型
                  const convertedValue = convertToOriginalType(newValue, currentValue);
                  newData[key] = convertedValue;
                  replaceCount += matchCount; // Add the actual number of matches replaced
                }
              }
            }
          }
        }
      });
      
      if (tableInfo.type === 'primitive') {
        // For primitive type, only replace if the search result is in the 'value' column
        const valueColumnResults = searchResults.filter(result => result.columnKey === 'value');
        if (valueColumnResults.length > 0) {
          // 对可替换的数据类型进行替换（包括 string, number, boolean, null）
          if (isReplaceableValue(data)) {
            const formattedValue = formatValue(data);
            const newValue = formattedValue.replace(regex, replaceValue);
            if (newValue !== formattedValue) {
              // 尝试将新值转换回原始数据类型
              const convertedValue = convertToOriginalType(newValue, data);
              onUpdate(convertedValue);
              replaceCount += valueColumnResults.length; // Add the actual number of matches replaced
            }
          }
        }
      } else {
        onUpdate(newData);
      }
      
      toast.success(`Replaced ${replaceCount} occurrence${replaceCount !== 1 ? 's' : ''}`);
      
      // 清空搜索词以刷新搜索结果
      if (!parentSearchTerm) {
        setSearchTerm('');
        onSearchChange?.('');
        setShowReplace(false);
        setReplaceValue('');
      }
    } catch (error) {
      toast.error('Failed to replace values');
    }
  }, [effectiveSearchTerm, replaceValue, data, searchResults, tableInfo.type, onUpdate, createReplaceRegex, parentSearchTerm, onSearchChange]);
  
  // Text highlighting function
  const highlightText = useCallback((text: string, searchTermToHighlight: string, rowIndex: number, columnKey: string) => {
    // Skip highlighting for computed type column
    if (columnKey === 'type') return text;
    
    if (!showSearch || !searchTermToHighlight || !text) return text;
    
    const textStr = String(text);
    let regex: RegExp;
    
    try {
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        regex = new RegExp(`(${searchTermToHighlight})`, flags);
      } else {
        const escapedTerm = searchTermToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (wholeWord) {
          regex = new RegExp(`(\\b${escapedTerm}\\b)`, caseSensitive ? 'g' : 'gi');
        } else {
          regex = new RegExp(`(${escapedTerm})`, caseSensitive ? 'g' : 'gi');
        }
      }
    } catch (error) {
      // If regex is invalid, fall back to simple highlighting
      const escapedTerm = searchTermToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(`(${escapedTerm})`, 'gi');
    }
    
    const parts = textStr.split(regex);
    
    // Check if this is the current search result
    const isCurrentResult = currentSearchIndex >= 0 && 
      searchResults[currentSearchIndex] && 
      searchResults[currentSearchIndex].rowIndex === rowIndex && 
      searchResults[currentSearchIndex].columnKey === columnKey;
    
    return parts.map((part, index) => {
      // Check if this part matches the search term based on current search mode
      let isMatch = false;
      try {
        if (useRegex) {
          const testRegex = new RegExp(searchTermToHighlight, caseSensitive ? '' : 'i');
          isMatch = testRegex.test(part);
        } else {
          if (wholeWord) {
            const wordRegex = new RegExp(`^${searchTermToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, caseSensitive ? '' : 'i');
            isMatch = wordRegex.test(part);
          } else {
            isMatch = caseSensitive ? part === searchTermToHighlight : part.toLowerCase() === searchTermToHighlight.toLowerCase();
          }
        }
      } catch (error) {
        isMatch = caseSensitive ? part === searchTermToHighlight : part.toLowerCase() === searchTermToHighlight.toLowerCase();
      }
      
      if (isMatch) {
        return (
          <mark 
            key={index} 
            className={cn(
              "px-0.5 rounded-sm font-medium",
              isCurrentResult 
                ? "bg-orange-300 dark:bg-orange-600 text-gray-900 dark:text-gray-100 ring-2 ring-orange-500" 
                : "bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-gray-100"
            )}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  }, [currentSearchIndex, searchResults, showSearch, caseSensitive, useRegex, wholeWord]);
  
  const handleSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  }, [onSearchChange]);
  
  if (!showSearch) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      {/* Search Input Row */}
      <div className="flex items-center gap-2 min-h-[32px]">
        <div className="relative" style={{ width: 'calc(100% - 240px)' }}>
          <Input
            type="text"
            placeholder="Search"
            value={effectiveSearchTerm}
            onChange={(e) => handleSearchTermChange(e.target.value)}
            disabled={!!parentSearchTerm}
            className={cn(
              "pl-8 h-8 text-sm pr-32",
              "border-gray-300 dark:border-gray-600"
            )}
          />
          <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          
          {/* Search options inside input */}
          {!parentSearchTerm && (
            <div className="absolute right-1 top-1 flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCaseSensitive(!caseSensitive)}
                className={cn(
                  "h-6 w-6 p-0 text-xs transition-colors border-0 font-medium",
                  caseSensitive 
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
                title="Case sensitive"
              >
                Aa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWholeWord(!wholeWord)}
                className={cn(
                  "h-6 w-6 p-0 text-xs transition-colors border-0 underline",
                  wholeWord 
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
                title="Whole word"
              >
                ab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseRegex(!useRegex)}
                className={cn(
                  "h-6 w-6 p-0 text-xs transition-colors border-0 font-mono ",
                  useRegex 
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
                title="Regular expression"
              >
                .*
              </Button>
             
            </div>
          )}
        </div>
        
        {/* Search navigation and results */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px]">
            {effectiveSearchTerm ? (
              searchResults.length > 0
                ? `${currentSearchIndex + 1}/${searchResults.length}`
                : 'No results'
            ) : ''}
          </span>
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchPrevious}
              disabled={searchResults.length === 0}
              className="h-8 w-8 p-0 rounded-l border border-gray-300 dark:border-gray-600 rounded-r-none"
              title="Previous result"
            >
              <ChevronUp size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchNext}
              disabled={searchResults.length === 0}
              className="h-8 w-8 p-0 rounded-r border border-gray-300 dark:border-gray-600 border-l-0 rounded-l-none"
              title="Next result"
            >
              <ChevronDown size={14} />
            </Button>
          </div>
          {onUpdate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleReplace}
              className="h-8 w-8 p-0 border border-gray-300 dark:border-gray-600"
              title="Toggle replace"
            >
              <Replace size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              onSearchChange?.('');
              setShowReplace(false);
            }}
            className="h-8 w-8 p-0"
            title="Close search"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Replace Input Row */}
      {showReplace && onUpdate && (
        <div className="flex items-center gap-2 min-h-[32px]">
          <div className="relative" style={{ width: 'calc(100% - 240px)' }}>
            <Input
              type="text"
              placeholder="Replace (use ↵ to view history)"
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              className="pl-8 h-8 text-sm border-gray-300 dark:border-gray-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReplaceOne();
                }
              }}
            />
            <Replace size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>
          
          {/* Replace buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplaceOne}
              disabled={searchResults.length === 0 || currentSearchIndex === -1}
              className="h-8 px-3 text-xs border border-gray-300 dark:border-gray-600"
              title="Replace current match"
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplaceAll}
              disabled={searchResults.length === 0}
              className="h-8 px-3 text-xs border border-gray-300 dark:border-gray-600"
              title="Replace all matches"
            >
              All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the highlight text function for use in parent components
export { TableSearch as default };