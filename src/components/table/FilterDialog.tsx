"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FilterConfig, 
  FilterOperator, 
  getOperatorLabel, 
  getColumnInfo, 
  extractColumnKeys 
} from "@/lib/table-utils";

export interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilter: (filter: FilterConfig) => void;
  data: any[];
  existingFilter?: FilterConfig;
}

export function FilterDialog({
  open,
  onOpenChange,
  onApplyFilter,
  data,
  existingFilter
}: FilterDialogProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator>('equals');
  const [filterValue, setFilterValue] = useState<string>('');
  const [errors, setErrors] = useState<{ column?: string; operator?: string; value?: string }>({});

  // Get available columns from data
  const columns = extractColumnKeys(data);
  const columnInfo = selectedColumn ? getColumnInfo(data, selectedColumn) : null;

  // Reset form when dialog opens/closes or existing filter changes
  useEffect(() => {
    if (open) {
      if (existingFilter) {
        setSelectedColumn(existingFilter.column);
        setSelectedOperator(existingFilter.operator);
        setFilterValue(existingFilter.value);
      } else {
        setSelectedColumn('');
        setSelectedOperator('equals');
        setFilterValue('');
      }
      setErrors({});
    }
  }, [open, existingFilter]);

  // Update available operators when column changes
  useEffect(() => {
    if (selectedColumn && columnInfo) {
      const availableOperators = columnInfo.operators;
      if (!availableOperators.includes(selectedOperator)) {
        setSelectedOperator(availableOperators[0] || 'equals');
      }
    }
  }, [selectedColumn, columnInfo, selectedOperator]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!selectedColumn) {
      newErrors.column = 'Please select a column';
    }

    if (!selectedOperator) {
      newErrors.operator = 'Please select an operator';
    }

    // Check if value is required for the selected operator
    const valueNotRequiredOperators: FilterOperator[] = ['is_empty', 'is_not_empty'];
    if (!valueNotRequiredOperators.includes(selectedOperator) && !filterValue.trim()) {
      newErrors.value = 'Please enter a filter value';
    }

    // Validate numeric values for numeric operators
    if (selectedOperator === 'greater_than' || selectedOperator === 'less_than') {
      if (columnInfo?.type === 'number' && filterValue && isNaN(Number(filterValue))) {
        newErrors.value = 'Please enter a valid number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = () => {
    if (!validateForm()) return;

    const filter: FilterConfig = {
      column: selectedColumn,
      operator: selectedOperator,
      value: filterValue.trim()
    };

    onApplyFilter(filter);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const isValueRequired = !['is_empty', 'is_not_empty'].includes(selectedOperator);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" onKeyDown={handleKeyDown}>
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {existingFilter ? 'Edit Filter' : 'Add Filter'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Column Selection */}
          <div className="space-y-2">
            <Label htmlFor="column" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Column
            </Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className={`w-full ${errors.column ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select a column..." />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    <div className="flex items-center justify-between w-full">
                      <span>{column}</span>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        {getColumnInfo(data, column).type}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.column && (
              <p className="text-sm text-red-500 mt-1">{errors.column}</p>
            )}
          </div>

          {/* Operator Selection */}
          <div className="space-y-2">
            <Label htmlFor="operator" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Operator
            </Label>
            <Select 
              value={selectedOperator} 
              onValueChange={(value) => setSelectedOperator(value as FilterOperator)}
              disabled={!selectedColumn}
            >
              <SelectTrigger className={`w-full ${errors.operator ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select an operator..." />
              </SelectTrigger>
              <SelectContent>
                {columnInfo?.operators.map((operator) => (
                  <SelectItem key={operator} value={operator}>
                    {getOperatorLabel(operator)}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
            {errors.operator && (
              <p className="text-sm text-red-500 mt-1">{errors.operator}</p>
            )}
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <Label htmlFor="value" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Value {!isValueRequired && <span className="text-slate-500 dark:text-slate-400">(not required)</span>}
            </Label>
            <Input
              id="value"
              type={columnInfo?.type === 'number' ? 'number' : 'text'}
              placeholder={
                isValueRequired 
                  ? `Enter ${columnInfo?.type || 'value'}...` 
                  : 'Not required for this operator'
              }
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              disabled={!isValueRequired}
              className={`w-full ${errors.value ? 'border-red-500' : ''}`}
            />
            {errors.value && (
              <p className="text-sm text-red-500 mt-1">{errors.value}</p>
            )}
            {columnInfo?.type === 'number' && isValueRequired && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Enter a numeric value for comparison
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {existingFilter ? 'Update Filter' : 'Apply Filter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}