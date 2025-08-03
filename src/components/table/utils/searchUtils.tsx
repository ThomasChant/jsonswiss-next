import React from 'react';
import { cn } from '@/lib/utils';

interface SearchResult {
  rowIndex: number;
  columnKey: string;
  text: string;
  path?: string[];
}

interface HighlightTextOptions {
  showSearch: boolean;
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
  currentSearchIndex: number;
  searchResults: SearchResult[];
}

/**
 * 高亮搜索文本
 */
export function highlightText(
  text: string, 
  searchTerm: string, 
  rowIndex: number, 
  columnKey: string | { key: string },
  options: HighlightTextOptions
) {
  const { 
    showSearch, 
    caseSensitive, 
    useRegex, 
    wholeWord, 
    currentSearchIndex, 
    searchResults 
  } = options;
  
  // Extract the actual column key
  const actualColumnKey = typeof columnKey === 'string' ? columnKey : columnKey.key;
  
  // Skip highlighting for computed type column
  if (actualColumnKey === 'type') return text;
  
  if (!showSearch || !searchTerm || !text) return text;
  
  const textStr = String(text);
  let regex: RegExp;
  
  try {
    if (useRegex) {
      const flags = caseSensitive ? 'g' : 'gi';
      regex = new RegExp(`(${searchTerm})`, flags);
    } else {
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) {
        regex = new RegExp(`(\\b${escapedTerm}\\b)`, caseSensitive ? 'g' : 'gi');
      } else {
        regex = new RegExp(`(${escapedTerm})`, caseSensitive ? 'g' : 'gi');
      }
    }
  } catch (error) {
    // If regex is invalid, fall back to simple highlighting
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regex = new RegExp(`(${escapedTerm})`, 'gi');
  }
  
  const parts = textStr.split(regex);
  
  // Check if this is the current search result
  const isCurrentResult = currentSearchIndex >= 0 && 
    searchResults[currentSearchIndex] && 
    searchResults[currentSearchIndex].rowIndex === rowIndex && 
    searchResults[currentSearchIndex].columnKey === actualColumnKey;
  
  return parts.map((part, index) => {
    // Check if this part matches the search term based on current search mode
    let isMatch = false;
    try {
      if (useRegex) {
        const testRegex = new RegExp(searchTerm, caseSensitive ? '' : 'i');
        isMatch = testRegex.test(part);
      } else {
        if (wholeWord) {
          const wordRegex = new RegExp(`^${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, caseSensitive ? '' : 'i');
          isMatch = wordRegex.test(part);
        } else {
          isMatch = caseSensitive ? part === searchTerm : part.toLowerCase() === searchTerm.toLowerCase();
        }
      }
    } catch (error) {
      isMatch = caseSensitive ? part === searchTerm : part.toLowerCase() === searchTerm.toLowerCase();
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
}

/**
 * 创建替换用的正则表达式
 */
export function createReplaceRegex(
  searchTerm: string, 
  caseSensitive: boolean, 
  useRegex: boolean, 
  wholeWord: boolean
): RegExp {
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
}

/**
 * 检查值是否匹配搜索条件
 */
export function matchesSearchTerm(
  value: any, 
  searchTerm: string, 
  caseSensitive: boolean, 
  useRegex: boolean, 
  wholeWord: boolean
): boolean {
  if (value == null || !searchTerm) return false;
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
}