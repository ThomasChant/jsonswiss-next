import React, { useState, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterOperator } from '@/lib/table-utils';

export interface BooleanFilterValue {
  includeTrue: boolean;
  includeFalse: boolean;
  includeUndefined: boolean;
  includeTruthy: boolean;
  includeFalsy: boolean;
}

export interface BooleanFilterProps {
  value: BooleanFilterValue;
  onChange: (value: BooleanFilterValue) => void;
  onApply: () => void;
  onClear: () => void;
  columnName: string;
}

const DEFAULT_VALUE: BooleanFilterValue = {
  includeTrue: false,
  includeFalse: false,
  includeUndefined: false,
  includeTruthy: false,
  includeFalsy: false,
};

export function BooleanFilter({
  value = DEFAULT_VALUE,
  onChange,
  onApply,
  onClear,
  columnName
}: BooleanFilterProps) {
  const [localValue, setLocalValue] = useState<BooleanFilterValue>(value);

  const handleCheckboxChange = useCallback((key: keyof BooleanFilterValue, checked: boolean) => {
    const newValue = { ...localValue, [key]: checked };
    setLocalValue(newValue);
    onChange(newValue);
  }, [localValue, onChange]);

  const handleClear = useCallback(() => {
    const clearedValue = { ...DEFAULT_VALUE };
    setLocalValue(clearedValue);
    onChange(clearedValue);
    onClear();
  }, [onChange, onClear]);

  const handleApply = useCallback(() => {
    onApply();
  }, [onApply]);

  const hasAnySelection = Object.values(localValue).some(Boolean);

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Filter Boolean - {columnName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exact value filtering */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Exact Values
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-true"
                checked={localValue.includeTrue}
                onCheckedChange={(checked) => handleCheckboxChange('includeTrue', !!checked)}
              />
              <Label htmlFor="include-true" className="text-sm">
                True
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-false"
                checked={localValue.includeFalse}
                onCheckedChange={(checked) => handleCheckboxChange('includeFalse', !!checked)}
              />
              <Label htmlFor="include-false" className="text-sm">
                False
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-undefined"
                checked={localValue.includeUndefined}
                onCheckedChange={(checked) => handleCheckboxChange('includeUndefined', !!checked)}
              />
              <Label htmlFor="include-undefined" className="text-sm">
                Undefined
              </Label>
            </div>
          </div>
        </div>

        {/* Logical value filtering */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Logical Values
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-truthy"
                checked={localValue.includeTruthy}
                onCheckedChange={(checked) => handleCheckboxChange('includeTruthy', !!checked)}
              />
              <Label htmlFor="include-truthy" className="text-sm">
                Truthy
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-falsy"
                checked={localValue.includeFalsy}
                onCheckedChange={(checked) => handleCheckboxChange('includeFalsy', !!checked)}
              />
              <Label htmlFor="include-falsy" className="text-sm">
                Falsy
              </Label>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!hasAnySelection}
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!hasAnySelection}
          >
            Apply Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 将布尔筛选值转换为FilterConfig数组
 */
export function booleanFilterToConfigs(
  columnName: string,
  filterValue: BooleanFilterValue
): Array<{ operator: FilterOperator; value: string }> {
  const configs: Array<{ operator: FilterOperator; value: string }> = [];

  if (filterValue.includeTrue) {
    configs.push({ operator: 'is_true', value: '' });
  }
  if (filterValue.includeFalse) {
    configs.push({ operator: 'is_false', value: '' });
  }
  if (filterValue.includeUndefined) {
    configs.push({ operator: 'is_undefined', value: '' });
  }
  if (filterValue.includeTruthy) {
    configs.push({ operator: 'is_truthy', value: '' });
  }
  if (filterValue.includeFalsy) {
    configs.push({ operator: 'is_falsy', value: '' });
  }

  return configs;
}

/**
 * 检查值是否匹配布尔筛选条件
 */
export function matchesBooleanFilter(
  value: any,
  filterValue: BooleanFilterValue
): boolean {
  // 如果没有选择任何条件，则匹配所有值
  if (!Object.values(filterValue).some(Boolean)) {
    return true;
  }

  // 检查精确值匹配
  if (filterValue.includeTrue && value === true) return true;
  if (filterValue.includeFalse && value === false) return true;
  if (filterValue.includeUndefined && value === undefined) return true;

  // 检查逻辑值匹配
  if (filterValue.includeTruthy && Boolean(value)) return true;
  if (filterValue.includeFalsy && !Boolean(value)) return true;

  return false;
}