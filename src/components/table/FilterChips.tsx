"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FilterConfig, 
  getOperatorDisplay, 
  getOperatorLabel 
} from "@/lib/table-utils";
import { cn } from "@/lib/utils";

export interface FilterChipsProps {
  filters: FilterConfig[];
  onRemoveFilter: (index: number) => void;
  onClearAll: () => void;
  onEditFilter?: (index: number) => void;
  className?: string;
  density?: 'comfortable' | 'regular' | 'compact';
}

export function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  onEditFilter,
  className,
  density = 'regular'
}: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  const truncateValue = (value: string, maxLength: number = 20): string => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength - 3) + '...';
  };

  const formatFilterDisplay = (filter: FilterConfig): string => {
    const { column, operator, value } = filter;
    const operatorSymbol = getOperatorDisplay(operator);
    
    // For empty/not empty operators, don't show value
    if (operator === 'is_empty' || operator === 'is_not_empty') {
      return `${column} ${operatorSymbol}`;
    }
    
    return `${column} ${operatorSymbol} ${truncateValue(value)}`;
  };

  const getFilterTooltip = (filter: FilterConfig): string => {
    const { column, operator, value } = filter;
    const operatorLabel = getOperatorLabel(operator);
    
    if (operator === 'is_empty' || operator === 'is_not_empty') {
      return `${column} ${operatorLabel}`;
    }
    
    return `${column} ${operatorLabel} "${value}"`;
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700",
      density === 'compact' ? "gap-1.5 p-2" : "gap-2 p-4",
      className
    )}>
      {/* Filter Label */}
      <span className={cn(
        "font-medium text-slate-700 dark:text-slate-300",
        density === 'compact' ? "text-xs" : "text-sm"
      )}>
        Active Filters:
      </span>

      {/* Filter Chips */}
      <div className={cn(
        "flex flex-wrap",
        density === 'compact' ? "gap-1.5" : "gap-2"
      )}>
        {filters.map((filter, index) => (
          <Badge
            key={`${filter.column}-${filter.operator}-${index}`}
            variant="secondary"
            className={cn(
              "group relative flex items-center pr-1 max-w-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
              "filter-chip",
              density === 'compact' ? "filter-chip--compact gap-1 text-xs py-0.5 px-1.5" : "gap-2"
            )}
            title={getFilterTooltip(filter)}
            onClick={() => onEditFilter?.(index)}
          >
            <span className="truncate">
              {formatFilterDisplay(filter)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFilter(index);
              }}
              className={cn(
                "p-0 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full",
                "remove-button",
                density === 'compact' ? "h-3 w-3" : "h-4 w-4"
              )}
            >
              <X className={density === 'compact' ? "w-2.5 h-2.5" : "w-3 h-3"} />
            </Button>
          </Badge>
        ))}
      </div>

      {/* Clear All Button */}
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className={cn(
            "ml-auto text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
            density === 'compact' && "text-xs py-1 px-2"
          )}
        >
          Clear All
        </Button>
      )}
    </div>
  );
}