"use client";

import { useState, useMemo } from 'react';
import { compareValues, SortDirection } from '@/lib/table-utils';

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export interface UseTableSortReturn {
  sortState: SortState;
  handleSort: (columnKey: string) => void;
  applySorting: (data: any[], customSortFn?: (items: any[], column: string, direction: SortDirection) => any[]) => any[];
  resetSort: () => void;
}

/**
 * Custom hook for managing table sorting state and logic
 * Implements tri-state sorting (asc → desc → none)
 */
export function useTableSort(): UseTableSortReturn {
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null
  });

  /**
   * Handle column sorting with tri-state cycle
   * none → asc → desc → none
   */
  const handleSort = (columnKey: string) => {
    setSortState(prevState => {
      if (prevState.column !== columnKey) {
        // New column, start with ascending
        return { column: columnKey, direction: 'asc' };
      }
      
      // Same column, cycle through states
      switch (prevState.direction) {
        case null:
          return { column: columnKey, direction: 'asc' };
        case 'asc':
          return { column: columnKey, direction: 'desc' };
        case 'desc':
          return { column: null, direction: null }; // Reset to no sort
        default:
          return { column: columnKey, direction: 'asc' };
      }
    });
  };

  /**
   * Apply sorting to data array with optional custom sort function
   * Supports both regular table sorting and single object table sorting
   */
  const applySorting = useMemo(() => {
    return (data: any[], customSortFn?: (items: any[], column: string, direction: SortDirection) => any[]): any[] => {
      if (!Array.isArray(data) || !sortState.column || !sortState.direction) {
        return data;
      }

      // Use custom sort function if provided (for special cases like single object table)
      if (customSortFn && sortState.column && sortState.direction) {
        return customSortFn(data, sortState.column, sortState.direction);
      }

      // Create a copy to avoid mutating original data
      const sortedData = [...data];
      
      return sortedData.sort((a, b) => {
        // Handle both object and array structures
        let aValue, bValue;
        
        // Special handling for single object table rows (key-value pairs)
        if (a && typeof a === 'object' && 'key' in a && 'value' in a && 'type' in a) {
          // This is a single object table row
          switch (sortState.column) {
            case 'key':
              aValue = a.key;
              bValue = b.key;
              break;
            case 'value':
              aValue = a.value;
              bValue = b.value;
              break;
            case 'type':
              aValue = a.type;
              bValue = b.type;
              break;
            default:
              aValue = a[sortState.column!];
              bValue = b[sortState.column!];
          }
        } else if (typeof a === 'object' && a !== null && !Array.isArray(a)) {
          // Regular object-array table
          aValue = a[sortState.column!];
          bValue = b[sortState.column!];
        } else {
          // For non-object items, use the item itself
          aValue = a;
          bValue = b;
        }
        
        return compareValues(aValue, bValue, sortState.direction!);
      });
    };
  }, [sortState]);

  /**
   * Reset sorting to initial state
   */
  const resetSort = () => {
    setSortState({ column: null, direction: null });
  };

  return {
    sortState,
    handleSort,
    applySorting,
    resetSort
  };
}