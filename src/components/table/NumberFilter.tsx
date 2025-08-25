import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
// import { Separator } from '@/components/ui/separator'; // 使用hr替代
import { Plus, X } from 'lucide-react';
import { FilterOperator } from '@/lib/table-utils';

export interface NumberFilterValue {
  // 范围筛选
  enableRange: boolean;
  rangeMin?: number;
  rangeMax?: number;
  includeMin: boolean;
  includeMax: boolean;
  
  // 多值筛选
  enableMultiValue: boolean;
  values: number[];
  
  // 空值处理
  includeNull: boolean;
  includeUndefined: boolean;
}

export interface NumberFilterProps {
  value: NumberFilterValue;
  onChange: (value: NumberFilterValue) => void;
  onApply: () => void;
  onClear: () => void;
  columnName: string;
}

const DEFAULT_VALUE: NumberFilterValue = {
  enableRange: false,
  includeMin: true,
  includeMax: true,
  enableMultiValue: false,
  values: [],
  includeNull: false,
  includeUndefined: false,
};

export function NumberFilter({
  value = DEFAULT_VALUE,
  onChange,
  onApply,
  onClear,
  columnName
}: NumberFilterProps) {
  const [localValue, setLocalValue] = useState<NumberFilterValue>(value);
  const [newValueInput, setNewValueInput] = useState('');

  const updateLocalValue = useCallback((updates: Partial<NumberFilterValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
  }, [localValue, onChange]);

  const handleRangeMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const numVal = val === '' ? undefined : parseFloat(val);
    updateLocalValue({ rangeMin: numVal });
  }, [updateLocalValue]);

  const handleRangeMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const numVal = val === '' ? undefined : parseFloat(val);
    updateLocalValue({ rangeMax: numVal });
  }, [updateLocalValue]);

  const handleAddValue = useCallback(() => {
    const numVal = parseFloat(newValueInput);
    if (!isNaN(numVal) && !localValue.values.includes(numVal)) {
      updateLocalValue({ values: [...localValue.values, numVal] });
      setNewValueInput('');
    }
  }, [newValueInput, localValue.values, updateLocalValue]);

  const handleRemoveValue = useCallback((valueToRemove: number) => {
    updateLocalValue({ 
      values: localValue.values.filter(v => v !== valueToRemove) 
    });
  }, [localValue.values, updateLocalValue]);

  const handleClear = useCallback(() => {
    const clearedValue = { ...DEFAULT_VALUE };
    setLocalValue(clearedValue);
    onChange(clearedValue);
    setNewValueInput('');
    onClear();
  }, [onChange, onClear]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Filter Numbers - {columnName}
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* 范围筛选 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-range"
              checked={localValue.enableRange}
              onCheckedChange={(checked) => 
                updateLocalValue({ enableRange: checked as boolean })
              }
            />
            <Label htmlFor="enable-range" className="text-sm font-medium">
              Enable Range Filter
            </Label>
          </div>
          
          {localValue.enableRange && (
            <div className="space-y-3 pl-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Min Value</Label>
                  <Input
                    type="number"
                    placeholder="Min value"
                    value={localValue.rangeMin ?? ''}
                    onChange={handleRangeMinChange}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Max Value</Label>
                  <Input
                    type="number"
                    placeholder="Max value"
                    value={localValue.rangeMax ?? ''}
                    onChange={handleRangeMaxChange}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-min"
                    checked={localValue.includeMin}
                    onCheckedChange={(checked) => 
                      updateLocalValue({ includeMin: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-min" className="text-xs">
                    Include min value
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-max"
                    checked={localValue.includeMax}
                    onCheckedChange={(checked) => 
                      updateLocalValue({ includeMax: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-max" className="text-xs">
                    Include max value
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* 多值筛选 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-multi-value"
              checked={localValue.enableMultiValue}
              onCheckedChange={(checked) => 
                updateLocalValue({ enableMultiValue: checked as boolean })
              }
            />
            <Label htmlFor="enable-multi-value" className="text-sm font-medium">
              Enable Multi-Value Filter
            </Label>
          </div>
          
          {localValue.enableMultiValue && (
            <div className="space-y-3 pl-6">
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Enter number"
                  value={newValueInput}
                  onChange={(e) => setNewValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                  className="h-8 flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddValue}
                  disabled={!newValueInput || isNaN(parseFloat(newValueInput))}
                  className="h-8 px-3"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              {localValue.values.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">
                    Selected values ({localValue.values.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {localValue.values.map((val, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(val)}
                          className="hover:bg-blue-200 rounded p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* 空值处理 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Null Value Handling</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-null"
                checked={localValue.includeNull}
                onCheckedChange={(checked) => 
                  updateLocalValue({ includeNull: checked as boolean })
                }
              />
              <Label htmlFor="include-null" className="text-xs">
                Include null
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-undefined"
                checked={localValue.includeUndefined}
                onCheckedChange={(checked) => 
                  updateLocalValue({ includeUndefined: checked as boolean })
                }
              />
              <Label htmlFor="include-undefined" className="text-xs">
                Include undefined
              </Label>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={onApply}
            size="sm"
            className="flex-1"
          >
            Apply Filter
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 将数值筛选配置转换为FilterConfig数组
 */
export function numberFilterToConfigs(
  columnName: string,
  filterValue: NumberFilterValue
): Array<{ operator: FilterOperator; value: string }> {
  const configs: Array<{ operator: FilterOperator; value: string }> = [];

  // 范围筛选
  if (filterValue.enableRange) {
    if (filterValue.rangeMin !== undefined) {
      const operator = filterValue.includeMin ? 'greater_than_or_equal' : 'greater_than';
      configs.push({ operator: operator as FilterOperator, value: filterValue.rangeMin.toString() });
    }
    if (filterValue.rangeMax !== undefined) {
      const operator = filterValue.includeMax ? 'less_than_or_equal' : 'less_than';
      configs.push({ operator: operator as FilterOperator, value: filterValue.rangeMax.toString() });
    }
  }

  // 多值筛选
  if (filterValue.enableMultiValue && filterValue.values.length > 0) {
    filterValue.values.forEach(value => {
      configs.push({ operator: 'equals', value: value.toString() });
    });
  }

  // 空值处理
  if (filterValue.includeNull) {
    configs.push({ operator: 'equals', value: 'null' });
  }
  if (filterValue.includeUndefined) {
    configs.push({ operator: 'is_undefined', value: '' });
  }

  return configs;
}

/**
 * 检查数值是否匹配数值筛选条件
 */
export function matchesNumberFilter(
  value: any,
  filterValue: NumberFilterValue
): boolean {
  // 处理空值
  if (value === null && filterValue.includeNull) return true;
  if (value === undefined && filterValue.includeUndefined) return true;
  if (value === null || value === undefined) return false;

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) return false;

  // 范围筛选
  if (filterValue.enableRange) {
    if (filterValue.rangeMin !== undefined) {
      const minCheck = filterValue.includeMin 
        ? numValue >= filterValue.rangeMin 
        : numValue > filterValue.rangeMin;
      if (!minCheck) return false;
    }
    if (filterValue.rangeMax !== undefined) {
      const maxCheck = filterValue.includeMax 
        ? numValue <= filterValue.rangeMax 
        : numValue < filterValue.rangeMax;
      if (!maxCheck) return false;
    }
  }

  // 多值筛选
  if (filterValue.enableMultiValue) {
    if (filterValue.values.length > 0) {
      return filterValue.values.includes(numValue);
    }
  }

  // 如果没有启用任何筛选，则匹配所有非空值
  if (!filterValue.enableRange && !filterValue.enableMultiValue) {
    return true;
  }

  return true;
}