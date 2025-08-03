"use client";

import { Search, Plus, Filter, Download, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportData, getExportOptions, ExportFormat } from "@/lib/export-utils";
import { cn } from "@/lib/utils";

export interface TableToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalRows: number;
  filteredRows: number;
  hasActiveFilters: boolean;
  onFilterToggle: () => void;
  onAddRow?: () => void;
  onClearFilters: () => void;
  data: any[];
  isArrayData?: boolean;
  className?: string;
  // New props for nested table support
  tableType?: 'object-array' | 'primitive-array' | 'single-object';
  nestingLevel?: number;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  parentPath?: string[];
  density?: 'comfortable' | 'regular' | 'compact';
}

export function TableToolbar({
  searchTerm,
  onSearchChange,
  totalRows,
  filteredRows,
  hasActiveFilters,
  onFilterToggle,
  onAddRow,
  onClearFilters,
  data,
  isArrayData = false,
  className,
  // New props for nested table support
  tableType = 'object-array',
  nestingLevel = 0,
  onExpandAll,
  onCollapseAll,
  parentPath = [],
  density = 'regular'
}: TableToolbarProps) {
  const exportOptions = getExportOptions(data);
  
  // Calculate z-index for dropdown based on nesting level
  const dropdownZIndex = Math.max(20, 50 - (nestingLevel || 0));

  const handleExport = (format: ExportFormat) => {
    exportData(data, format);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  // Determine button text based on table type
  const getAddButtonText = () => {
    switch (tableType) {
      case 'single-object':
        return 'Add Property';
      case 'primitive-array':
        return 'Add Item';
      default:
        return 'Add Row';
    }
  };

  // Determine if we should show expansion controls
  const showExpansionControls = nestingLevel === 0 && (onExpandAll || onCollapseAll);

  // Show path breadcrumb for nested tables
  const showPathBreadcrumb = parentPath.length > 0;

  return (
    <div className={cn(
      "flex flex-col border-b border-slate-200 dark:border-slate-700",
      "table-toolbar",
      density === 'compact' ? "table-toolbar--compact gap-2 p-2" : "gap-3 p-3",
      className
    )}>
      {/* Path Breadcrumb for nested tables */}
      {/* {showPathBreadcrumb && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">Location:</span>
          <div className={cn(
          "flex items-center",
          "breadcrumb",
          density === 'compact' ? "gap-0.5" : "gap-1"
        )}>
            {parentPath.map((segment, index) => (
              <span key={index} className="flex items-center gap-1">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {segment}
                </span>
                {index < parentPath.length - 1 && (
                  <ChevronRight className="w-3 h-3" />
                )}
              </span>
            ))}
          </div>
        </div>
      )} */}

      {/* Top Row - Search and Actions */}
     
      {/* Bottom Row - Status and Clear Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-sm text-slate-600 dark:text-slate-400">
        {/* Count Status */}
        {/* <div className="flex items-center gap-4">
          <span>
            Showing {filteredRows.toLocaleString()} of {totalRows.toLocaleString()} {
              tableType === 'single-object' ? 'properties' : 
              tableType === 'primitive-array' ? 'items' : 
              'rows'
            }
          </span>
          {hasActiveFilters && filteredRows !== totalRows && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Filtered
            </span>
          )}
        </div> */}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onClearFilters}
            className={cn(
              "flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
              density === 'compact' ? "gap-1 h-6 px-1.5 text-xs" : "gap-2"
            )}
          >
            <X className="w-3 h-3" />
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
}