"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SortDirection, DataType } from "@/lib/table-utils";
import { cn } from "@/lib/utils";

export interface SortableHeaderProps {
  column: string;
  dataType?: DataType;
  sortDirection: SortDirection;
  onSort: () => void;
  className?: string;
  children?: React.ReactNode;
  density?: 'comfortable' | 'regular' | 'compact';
}

const TYPE_COLORS: Record<DataType, string> = {
  string: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  number: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  boolean: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  object: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  array: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  null: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  undefined: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  date: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
};

const TYPE_LABELS: Record<DataType, string> = {
  string: "ABC",
  number: "123",
  boolean: "T/F",
  object: "{}",
  array: "[]",
  null: "∅",
  undefined: "?",
  date: "📅"
};

export function SortableHeader({
  column,
  dataType,
  sortDirection,
  onSort,
  className,
  children,
  density = 'regular'
}: SortableHeaderProps) {
  const getSortIcon = () => {
    const iconSize = density === 'compact' ? "w-3.5 h-3.5" : "w-4 h-4";
    switch (sortDirection) {
      case 'asc':
        return <ArrowUp className={iconSize} />;
      case 'desc':
        return <ArrowDown className={iconSize} />;
      default:
        return <ArrowUpDown className={cn(iconSize, "opacity-50 group-hover:opacity-100")} />;
    }
  };

  const getSortAriaSort = (): "none" | "ascending" | "descending" => {
    switch (sortDirection) {
      case 'asc':
        return 'ascending';
      case 'desc':
        return 'descending';
      default:
        return 'none';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort();
    }
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "group h-auto justify-start text-left font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
        sortDirection && "bg-slate-50 dark:bg-slate-800/50",
        density === 'compact' ? "sortable-header--compact min-h-[2rem] p-1.5 text-sm" : "min-h-[2.5rem] p-2",
        className
      )}
      onClick={onSort}
      onKeyDown={handleKeyDown}
      role="columnheader"
      aria-sort={getSortAriaSort()}
      tabIndex={0}
    >
      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Column Name */}
          <span className={cn(
            "font-semibold text-slate-900 dark:text-slate-100 truncate",
            density === 'compact' && "text-sm"
          )}>
            {children || column}
          </span>
          
          {/* Data Type Badge */}
          {dataType && (
            <Badge 
              variant="outline" 
              className={cn(
                "font-mono font-bold border-0",
                TYPE_COLORS[dataType],
                density === 'compact' ? "text-[10px] px-1 py-0.5 h-4" : "text-xs px-1.5 py-0.5 h-5"
              )}
              title={`Data type: ${dataType}`}
            >
              {TYPE_LABELS[dataType]}
            </Badge>
          )}
        </div>
        
        {/* Sort Icon */}
        <div className={cn(
          "flex items-center",
          density === 'compact' ? "ml-1.5" : "ml-2"
        )}>
          {getSortIcon()}
        </div>
      </div>
    </Button>
  );
}