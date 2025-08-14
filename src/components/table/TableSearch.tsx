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
import { highlightText } from './utils/searchUtils';

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
    if (!effectiveSearchTerm || effectiveSearchTerm.trim().length === 0) {
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
          // Build the correct data access path for nested search
          let dataAccessPath;
          if (tableInfo.type === 'object-array') {
            dataAccessPath = [...path, index.toString(), column.key];
          } else if (tableInfo.type === 'primitive-array') {
            dataAccessPath = [...path, index.toString()];
          } else if (tableInfo.type === 'single-object') {
            // For single object, we need to find the actual key at this row index
            const entries = Object.entries(data);
            if (entries[index]) {
              const [objectKey] = entries[index];
              dataAccessPath = [...path, objectKey];
            } else {
              dataAccessPath = [...path, column.key];
            }
          } else {
            dataAccessPath = [...path, column.key];
          }
          
          console.log('Building nested search path:', {
            tableType: tableInfo.type,
            baseDataPath: path,
            rowIndex: index,
            columnKey: column.key,
            finalDataAccessPath: dataAccessPath
          });
          
          const nestedResults = searchNestedData(cellValue, effectiveSearchTerm, dataAccessPath);
          results.push(...nestedResults.map(result => ({
            ...result,
            // Keep the original path from nested search but update display position
            rowIndex: index, // Keep the parent row index for highlighting
            columnKey: column.key // Keep the parent column for highlighting
            // path: result.path is preserved from the nested search
          })));
        }
      });
    });
    
    return results;
  }, [tableInfo, effectiveSearchTerm, searchNestedData, path, caseSensitive, useRegex, wholeWord]);
  
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
    
    console.log('=== REPLACEMENT CONTEXT DEBUG ===');
    console.log('Input data parameter:', data);
    console.log('Current table path:', path);
    console.log('Table info:', tableInfo);
    console.log('Search result:', currentResult);
    console.log('Is nested replacement:', !!(currentResult.path && currentResult.path.length > 0));
    
    try {
      const newData = JSON.parse(JSON.stringify(data));
      console.log('Cloned data for replacement:', newData);
      
      const regex = createReplaceRegex(effectiveSearchTerm);
      
      // Handle nested path replacements FIRST (most important case)
      if (currentResult.path && currentResult.path.length > 0) {
        console.log('=== NESTED PATH REPLACEMENT START ===');
        console.log('Saved path from search:', currentResult.path);
        console.log('Current table path:', path);
        console.log('Available data:', newData);
        
        // Calculate the relative path from current table position to target
        let relativePath = [...currentResult.path];
        
        // Remove the current table path prefix if it exists
        if (path && path.length > 0) {
          console.log('Removing table path prefix:', path);
          // Check if the saved path starts with the current table path
          let matchesPrefix = true;
          for (let i = 0; i < path.length && i < relativePath.length; i++) {
            if (path[i] !== relativePath[i]) {
              matchesPrefix = false;
              break;
            }
          }
          
          if (matchesPrefix && relativePath.length > path.length) {
            relativePath = relativePath.slice(path.length);
            console.log('Calculated relative path:', relativePath);
          } else {
            console.log('Path prefix mismatch - using full path');
          }
        }
        
        // Navigate to the nested location using the relative path
        let targetData = newData;
        const pathCopy = [...relativePath];
        const lastKey = pathCopy.pop(); // Get the final key/index
        
        console.log('Path steps to navigate:', pathCopy);
        console.log('Final key/index:', lastKey);
        
        // Navigate to the parent object/array
        for (let i = 0; i < pathCopy.length; i++) {
          const key = pathCopy[i];
          console.log(`Step ${i + 1}: Navigating to key "${key}"`);
          console.log('Current targetData:', targetData);
          console.log('targetData type:', typeof targetData);
          console.log('Is array:', Array.isArray(targetData));
          
          // Check if key exists in current data structure
          let keyExists = false;
          if (targetData) {
            if (Array.isArray(targetData)) {
              const index = parseInt(key, 10);
              keyExists = !isNaN(index) && index >= 0 && index < targetData.length;
              console.log(`Array check: index=${index}, length=${targetData.length}, exists=${keyExists}`);
            } else if (typeof targetData === 'object') {
              keyExists = targetData.hasOwnProperty(key);
              console.log(`Object check: key="${key}", exists=${keyExists}`);
            }
          }
          
          if (keyExists) {
            console.log(`✓ Key "${key}" exists in targetData`);
            targetData = targetData[key];
            console.log('New targetData after navigation:', targetData);
          } else {
            console.log(`✗ NAVIGATION FAILED: Key "${key}" not found`);
            console.log('Available keys/indices:', Array.isArray(targetData) ? 
              `Array[${targetData?.length || 0}] - indices 0 to ${(targetData?.length || 1) - 1}` : 
              Object.keys(targetData || {}));
            console.log('Is target an array?', Array.isArray(targetData));
            console.log('Target data:', targetData);
            console.log('=== NESTED PATH REPLACEMENT FAILED ===');
            toast.error(`Failed to navigate to nested location: key "${key}" not found`);
            return;
          }
        }
        
        console.log('=== FINAL REPLACEMENT STEP ===');
        console.log('Final targetData:', targetData);
        console.log('Last key:', lastKey);
        
        if (targetData && lastKey !== undefined) {
          // Check if this is a key replacement or value replacement
          if (currentResult.columnKey === 'key') {
            // Handle key replacement for nested objects
            if (typeof targetData === 'object' && !Array.isArray(targetData)) {
              const currentKey = String(lastKey);
              console.log('Attempting key replacement for:', currentKey);
              
              if (currentKey.includes(effectiveSearchTerm)) {
                const newKey = currentKey.replace(regex, replaceValue);
                console.log('New key after replacement:', newKey);
                
                if (newKey !== currentKey && !targetData.hasOwnProperty(newKey)) {
                  // Replace the key while preserving the value and order
                  const currentValue = targetData[lastKey];
                  const entries = Object.entries(targetData);
                  const newObject: any = {};
                  
                  for (const [key, value] of entries) {
                    if (key === currentKey) {
                      newObject[newKey] = currentValue;
                    } else {
                      newObject[key] = value;
                    }
                  }
                  
                  // Replace all properties in target object
                  Object.keys(targetData).forEach(key => delete targetData[key]);
                  Object.assign(targetData, newObject);
                  
                  console.log('=== NESTED KEY REPLACEMENT SUCCESS ===');
                  onUpdate(newData);
                  toast.success('Key replaced successfully');
                  handleSearchNext();
                  return;
                } else if (newKey === currentKey) {
                  console.log('✗ No change needed for key');
                } else {
                  console.log('✗ New key already exists:', newKey);
                  toast.error('Cannot replace key: new key already exists');
                  return;
                }
              } else {
                console.log('✗ Key does not contain search term');
              }
            } else {
              console.log('✗ Cannot replace keys in arrays or non-objects');
            }
          } else {
            // Handle value replacement for nested paths
            const currentValue = targetData[lastKey];
            console.log('Current value at final location:', currentValue);
            console.log('Is replaceable value:', isReplaceableValue(currentValue));
            
            if (isReplaceableValue(currentValue)) {
              const formattedValue = formatValue(currentValue);
              console.log('Formatted value:', formattedValue);
              console.log('Search result text:', currentResult.text);
              console.log('Values match:', currentResult.text === formattedValue);
              
              // Check if the search term is present in the formatted value
              const searchMatches = formattedValue.includes(effectiveSearchTerm) || 
                                  (useRegex && regex.test(formattedValue)) ||
                                  currentResult.text === formattedValue;
              
              console.log('Replacement validation:', {
                formattedValue,
                searchTerm: effectiveSearchTerm,
                resultText: currentResult.text,
                exactMatch: currentResult.text === formattedValue,
                containsSearch: formattedValue.includes(effectiveSearchTerm),
                regexMatch: useRegex ? regex.test(formattedValue) : false,
                finalMatch: searchMatches
              });
              
              if (searchMatches) {
                const newValue = formattedValue.replace(regex, replaceValue);
                console.log('Value after regex replacement:', newValue);
                
                const convertedValue = convertToOriginalType(newValue, currentValue);
                console.log('Converted value:', convertedValue);
                
                targetData[lastKey] = convertedValue;
                console.log('Updated targetData:', targetData);
                console.log('Final complete data:', newData);
                console.log('=== NESTED PATH REPLACEMENT SUCCESS ===');
                
                onUpdate(newData);
                toast.success('Value replaced successfully');
                handleSearchNext();
                return;
              } else {
                console.log('✗ No search match found in value');
                console.log('Expected search term:', effectiveSearchTerm);
                console.log('Result text:', currentResult.text);
                console.log('Formatted value:', formattedValue);
              }
            } else {
              console.log('✗ Value is not replaceable');
              console.log('Value type:', typeof currentValue);
              console.log('Value:', currentValue);
            }
          }
        } else {
          console.log('✗ Final navigation failed');
          console.log('targetData exists:', !!targetData);
          console.log('lastKey defined:', lastKey !== undefined);
        }
        
        console.log('=== NESTED PATH REPLACEMENT FAILED ===');
        console.log('Attempting fallback: simple replacement in current data');
        
        // Fallback: Try to replace directly in the current level data
        // This handles cases where the nested path might be incorrectly calculated
        let fallbackSuccess = false;
        
        // Try to find and replace the value in the current table data
        try {
          const findAndReplace = (obj: any, searchValue: string, replaceValue: string): boolean => {
            if (typeof obj === 'string' && obj.includes(searchValue)) {
              return obj.replace(regex, replaceValue) !== obj;
            }
            
            if (Array.isArray(obj)) {
              for (let i = 0; i < obj.length; i++) {
                if (typeof obj[i] === 'string' && obj[i].includes(searchValue)) {
                  const newValue = obj[i].replace(regex, replaceValue);
                  if (newValue !== obj[i]) {
                    obj[i] = convertToOriginalType(newValue, obj[i]);
                    return true;
                  }
                }
                if (typeof obj[i] === 'object' && obj[i] !== null) {
                  if (findAndReplace(obj[i], searchValue, replaceValue)) {
                    return true;
                  }
                }
              }
            }
            
            if (typeof obj === 'object' && obj !== null) {
              // First check for key replacements
              for (const [key] of Object.entries(obj)) {
                if (typeof key === 'string' && key.includes(searchValue)) {
                  const newKey = key.replace(regex, replaceValue);
                  if (newKey !== key && !obj.hasOwnProperty(newKey)) {
                    // Create new object with replaced key
                    const newObj: any = {};
                    for (const [k, v] of Object.entries(obj)) {
                      if (k === key) {
                        newObj[newKey] = v;
                      } else {
                        newObj[k] = v;
                      }
                    }
                    
                    // Replace all properties in current object
                    Object.keys(obj).forEach(k => delete obj[k]);
                    Object.assign(obj, newObj);
                    return true;
                  }
                }
              }
              
              // Then check for value replacements
              for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string' && value.includes(searchValue)) {
                  const newValue = value.replace(regex, replaceValue);
                  if (newValue !== value) {
                    obj[key] = convertToOriginalType(newValue, value);
                    return true;
                  }
                }
                if (typeof value === 'object' && value !== null) {
                  if (findAndReplace(value, searchValue, replaceValue)) {
                    return true;
                  }
                }
              }
            }
            
            return false;
          };
          
          fallbackSuccess = findAndReplace(newData, effectiveSearchTerm, replaceValue);
        } catch (error) {
          console.log('Fallback replacement failed:', error);
        }
        
        if (fallbackSuccess) {
          console.log('=== FALLBACK REPLACEMENT SUCCESS ===');
          onUpdate(newData);
          toast.success('Value replaced successfully');
          handleSearchNext();
          return;
        }
        
        console.log('=== ALL REPLACEMENT STRATEGIES FAILED ===');
        toast.error('Could not replace nested value');
        return;
      }
      
      // Handle regular (non-nested) replacements
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
      
      // Track already processed locations to avoid duplicate replacements
      const processedLocations = new Set();
      
      // Process each search result individually to handle nested paths correctly
      searchResults.forEach(result => {
        // Handle nested path replacements
        if (result.path && result.path.length > 0) {
          // Create unique key for this nested location
          const locationKey = `nested:${result.path.join('.')}`;
          if (processedLocations.has(locationKey)) {
            return; // Skip if already processed
          }
          processedLocations.add(locationKey);
          
          // Navigate to the nested location using the saved path
          let targetData = newData;
          const pathCopy = [...result.path];
          const lastKey = pathCopy.pop(); // Get the final key/index
          
          // Navigate to the parent object/array
          for (const key of pathCopy) {
            if (targetData && targetData.hasOwnProperty(key)) {
              targetData = targetData[key];
            } else {
              return; // Skip this result if path navigation fails
            }
          }
          
          if (targetData && lastKey !== undefined) {
            // Check if this is a key replacement or value replacement
            if (result.columnKey === 'key') {
              // Handle key replacement for nested objects
              if (typeof targetData === 'object' && !Array.isArray(targetData)) {
                const currentKey = String(lastKey);
                if (currentKey.includes(effectiveSearchTerm)) {
                  const newKey = currentKey.replace(regex, replaceValue);
                  if (newKey !== currentKey && !targetData.hasOwnProperty(newKey)) {
                    // Replace the key while preserving the value and order
                    const currentValue = targetData[lastKey];
                    const entries = Object.entries(targetData);
                    const newObject: any = {};
                    
                    for (const [key, value] of entries) {
                      if (key === currentKey) {
                        newObject[newKey] = currentValue;
                      } else {
                        newObject[key] = value;
                      }
                    }
                    
                    // Replace all properties in target object
                    Object.keys(targetData).forEach(key => delete targetData[key]);
                    Object.assign(targetData, newObject);
                    replaceCount++;
                  }
                }
              }
            } else {
              // Handle value replacement for nested paths
              const currentValue = targetData[lastKey];
              
              if (isReplaceableValue(currentValue)) {
                const formattedValue = formatValue(currentValue);
                const newValue = formattedValue.replace(regex, replaceValue);
                if (newValue !== formattedValue) {
                  const convertedValue = convertToOriginalType(newValue, currentValue);
                  targetData[lastKey] = convertedValue;
                  replaceCount++;
                }
              }
            }
          }
          return; // Continue to next result
        }
        
        // Handle regular (non-nested) replacements
        const rowIndex = result.rowIndex;
        const columnKey = result.columnKey;
        const locationKey = `regular:${rowIndex}-${columnKey}`;
        
        if (processedLocations.has(locationKey)) {
          return; // Skip if already processed
        }
        processedLocations.add(locationKey);
        
        if (tableInfo.type === 'object-array') {
          const currentValue = newData[rowIndex][columnKey];
          if (isReplaceableValue(currentValue)) {
            const formattedValue = formatValue(currentValue);
            const newValue = formattedValue.replace(regex, replaceValue);
            if (newValue !== formattedValue) {
              const convertedValue = convertToOriginalType(newValue, currentValue);
              newData[rowIndex][columnKey] = convertedValue;
              replaceCount++;
            }
          }
        } else if (tableInfo.type === 'primitive-array') {
          const currentValue = newData[rowIndex];
          if (isReplaceableValue(currentValue)) {
            const formattedValue = formatValue(currentValue);
            const newValue = formattedValue.replace(regex, replaceValue);
            if (newValue !== formattedValue) {
              const convertedValue = convertToOriginalType(newValue, currentValue);
              newData[rowIndex] = convertedValue;
              replaceCount++;
            }
          }
        } else if (tableInfo.type === 'single-object') {
          if (columnKey !== 'type') { // Skip computed type column
            if (columnKey === 'key') {
              // Replace key name
              const entries = Object.entries(newData);
              if (entries[rowIndex]) {
                const [oldKey, value] = entries[rowIndex];
                if (typeof oldKey === 'string') {
                  const newKey = oldKey.replace(regex, replaceValue);
                  if (newKey !== oldKey && !newData.hasOwnProperty(newKey)) {
                    const newObject: any = {};
                    for (const [key, val] of entries) {
                      if (key === oldKey) {
                        newObject[newKey] = value;
                      } else {
                        newObject[key] = val;
                      }
                    }
                    Object.keys(newData).forEach(key => delete newData[key]);
                    Object.assign(newData, newObject);
                    replaceCount++;
                  }
                }
              }
            } else if (columnKey === 'value') {
              // Replace value
              const entries = Object.entries(newData);
              if (entries[rowIndex]) {
                const [key] = entries[rowIndex];
                const currentValue = newData[key];
                if (isReplaceableValue(currentValue)) {
                  const formattedValue = formatValue(currentValue);
                  const newValue = formattedValue.replace(regex, replaceValue);
                  if (newValue !== formattedValue) {
                    const convertedValue = convertToOriginalType(newValue, currentValue);
                    newData[key] = convertedValue;
                    replaceCount++;
                  }
                }
              }
            }
          }
        } else if (tableInfo.type === 'primitive') {
          if (columnKey === 'value') {
            if (isReplaceableValue(data)) {
              const formattedValue = formatValue(data);
              const newValue = formattedValue.replace(regex, replaceValue);
              if (newValue !== formattedValue) {
                const convertedValue = convertToOriginalType(newValue, data);
                onUpdate(convertedValue);
                replaceCount++;
                return;
              }
            }
          }
        }
      });
      
      if (tableInfo.type !== 'primitive') {
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

// Export the component and re-export highlight function from utils
export { highlightText } from './utils/searchUtils';
export { TableSearch as default };