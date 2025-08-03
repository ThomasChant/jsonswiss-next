"use client";

import { useState, useMemo } from 'react';
import { FilterConfig, matchesFilter, extractColumnKeys } from '@/lib/table-utils';

export interface UseTableFiltersReturn {
  filters: FilterConfig[];
  searchTerm: string;
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (index: number) => void;
  updateFilter: (index: number, filter: FilterConfig) => void;
  clearAllFilters: () => void;
  setSearchTerm: (term: string) => void;
  applyFilters: (data: any[]) => any[];
  hasActiveFilters: boolean;
  getFilteredRowCount: (data: any[]) => number;
}

/**
 * Custom hook for managing table filtering state and operations
 * Maintains an array of filter objects and provides filtering functionality
 */
export function useTableFilters(): UseTableFiltersReturn {
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  /**
   * Add a new filter, replacing any existing filter for the same column
   */
  const addFilter = (filter: FilterConfig) => {
    setFilters(prevFilters => {
      // Remove existing filter for the same column
      const filtered = prevFilters.filter(f => f.column !== filter.column);
      return [...filtered, filter];
    });
  };

  /**
   * Remove filter at specific index
   */
  const removeFilter = (index: number) => {
    setFilters(prevFilters => prevFilters.filter((_, i) => i !== index));
  };

  /**
   * Update filter at specific index
   */
  const updateFilter = (index: number, filter: FilterConfig) => {
    setFilters(prevFilters => 
      prevFilters.map((f, i) => i === index ? filter : f)
    );
  };

  /**
   * Clear all filters and search term
   */
  const clearAllFilters = () => {
    setFilters([]);
    setSearchTerm('');
  };

  /**
   * Check if there are any active filters or search term
   */
  const hasActiveFilters = useMemo(() => {
    return filters.length > 0 || searchTerm.trim().length > 0;
  }, [filters, searchTerm]);

  /**
   * Apply all filters and search to data array
   */
  const applyFilters = useMemo(() => {
    return (data: any[]): any[] => {
      if (!Array.isArray(data)) return data;

      let filteredData = data;

      // Apply column filters
      if (filters.length > 0) {
        filteredData = filteredData.filter(item => {
          return filters.every(filter => {
            // Handle both object and primitive values
            let value;
            
            // Special handling for single object table rows (key-value pairs)
            if (item && typeof item === 'object' && 'key' in item && 'value' in item && 'type' in item) {
              // This is a single object table row
              switch (filter.column) {
                case 'key':
                  value = item.key;
                  break;
                case 'value':
                  value = item.value;
                  break;
                case 'type':
                  value = item.type;
                  break;
                default:
                  value = item[filter.column];
              }
            } else if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
              // Regular object
              value = item[filter.column];
            } else {
              // For primitive values or arrays, treat the item itself as the value
              // This handles cases where the data is an array of primitives
              value = item;
            }
            
            return matchesFilter(value, filter);
          });
        });
      }

      // Apply text search across all columns
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filteredData = filteredData.filter(item => {
          // Special handling for single object table rows (key-value pairs)
          if (item && typeof item === 'object' && 'key' in item && 'value' in item && 'type' in item) {
            // Search in key, value (as string), and type
            const keyStr = item.key?.toString() || '';
            const valueStr = item.value?.toString() || '';
            const typeStr = item.type?.toString() || '';
            
            return keyStr.toLowerCase().includes(searchLower) ||
                   valueStr.toLowerCase().includes(searchLower) ||
                   typeStr.toLowerCase().includes(searchLower);
          } else if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            // Search across all object properties
            return Object.values(item).some(value => {
              const valueStr = value?.toString() || '';
              return valueStr.toLowerCase().includes(searchLower);
            });
          } else {
            // Search the item itself if it's a primitive
            const itemStr = item?.toString() || '';
            return itemStr.toLowerCase().includes(searchLower);
          }
        });
      }

      return filteredData;
    };
  }, [filters, searchTerm]);

  /**
   * Get the count of filtered rows
   */
  const getFilteredRowCount = (data: any[]): number => {
    return applyFilters(data).length;
  };

  return {
    filters,
    searchTerm,
    addFilter,
    removeFilter,
    updateFilter,
    clearAllFilters,
    setSearchTerm,
    applyFilters,
    hasActiveFilters,
    getFilteredRowCount
  };
}