import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FilterConfig } from '@/lib/table-utils';

export interface DateFilterValue {
  // 日期范围筛选
  enableRange: boolean;
  startDate?: string;
  endDate?: string;
  includeStart: boolean;
  includeEnd: boolean;
  
  // 精确日期筛选
  enableExact: boolean;
  exactDate?: string;
  
  // 多值筛选
  enableMultiValue: boolean;
  values: string[];
  
  // 相对日期筛选
  enableRelative: boolean;
  relativeType: 'days' | 'weeks' | 'months' | 'years';
  relativeValue?: number;
  relativeDirection: 'before' | 'after' | 'within';
  
  // 空值处理
  includeNull: boolean;
  includeUndefined: boolean;
}

export interface DateFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  onApply: () => void;
  onClear: () => void;
  columnName: string;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  value,
  onChange,
  onApply,
  onClear,
  columnName
}) => {
  const handleRangeToggle = (enabled: boolean) => {
    onChange({ ...value, enableRange: enabled });
  };

  const handleExactToggle = (enabled: boolean) => {
    onChange({ ...value, enableExact: enabled });
  };

  const handleMultiValueToggle = (enabled: boolean) => {
    onChange({ ...value, enableMultiValue: enabled });
  };

  const handleRelativeToggle = (enabled: boolean) => {
    onChange({ ...value, enableRelative: enabled });
  };

  const addValue = () => {
    const newValue = prompt('Enter date (YYYY-MM-DD):');
    if (newValue && !value.values.includes(newValue)) {
      onChange({ ...value, values: [...value.values, newValue] });
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange({ 
      ...value, 
      values: value.values.filter(v => v !== valueToRemove) 
    });
  };

  return (
    <div className="space-y-4">
      {/* 日期范围筛选 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="enable-range"
            checked={value.enableRange}
            onCheckedChange={handleRangeToggle}
          />
          <Label htmlFor="enable-range">Date Range Filter</Label>
        </div>
        
        {value.enableRange && (
          <div className="ml-6 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={value.startDate || ''}
                  onChange={(e) => onChange({ ...value, startDate: e.target.value })}
                  placeholder="Start date"
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={value.endDate || ''}
                  onChange={(e) => onChange({ ...value, endDate: e.target.value })}
                  placeholder="End date"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-start"
                  checked={value.includeStart}
                  onCheckedChange={(checked) => onChange({ ...value, includeStart: !!checked })}
                />
                <Label htmlFor="include-start">Include Start Date</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-end"
                  checked={value.includeEnd}
                  onCheckedChange={(checked) => onChange({ ...value, includeEnd: !!checked })}
                />
                <Label htmlFor="include-end">Include End Date</Label>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* 精确日期筛选 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="enable-exact"
            checked={value.enableExact}
            onCheckedChange={handleExactToggle}
          />
          <Label htmlFor="enable-exact">Exact Date Filter</Label>
        </div>
        
        {value.enableExact && (
          <div className="ml-6">
            <Input
              type="date"
              value={value.exactDate || ''}
              onChange={(e) => onChange({ ...value, exactDate: e.target.value })}
              placeholder="Exact date"
            />
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* 多值筛选 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="enable-multi"
            checked={value.enableMultiValue}
            onCheckedChange={handleMultiValueToggle}
          />
          <Label htmlFor="enable-multi">Multi-value Filter</Label>
        </div>
        
        {value.enableMultiValue && (
          <div className="ml-6 space-y-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addValue}
            >
Add Date
            </Button>
            
            {value.values.length > 0 && (
              <div className="space-y-1">
                {value.values.map((val, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-sm">{val}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeValue(val)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* 相对日期筛选 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="enable-relative"
            checked={value.enableRelative}
            onCheckedChange={handleRelativeToggle}
          />
          <Label htmlFor="enable-relative">Relative Date Filter</Label>
        </div>
        
        {value.enableRelative && (
          <div className="ml-6 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <select 
                value={value.relativeDirection}
                onChange={(e) => onChange({ ...value, relativeDirection: e.target.value as 'before' | 'after' | 'within' })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="within">Within</option>
              </select>
              
              <Input
                type="number"
                value={value.relativeValue || ''}
                onChange={(e) => onChange({ ...value, relativeValue: parseInt(e.target.value) || undefined })}
                placeholder="Number"
                min="1"
              />
              
              <select 
                value={value.relativeType}
                onChange={(e) => onChange({ ...value, relativeType: e.target.value as 'days' | 'weeks' | 'months' | 'years' })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* 空值处理 */}
      <div className="space-y-2">
        <Label>Null Value Handling</Label>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-null"
              checked={value.includeNull}
              onCheckedChange={(checked) => onChange({ ...value, includeNull: !!checked })}
            />
            <Label htmlFor="include-null">Include null</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-undefined"
              checked={value.includeUndefined}
              onCheckedChange={(checked) => onChange({ ...value, includeUndefined: !!checked })}
            />
            <Label htmlFor="include-undefined">Include undefined</Label>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-2 pt-4">
        <Button onClick={onApply} className="flex-1">
          Apply Filter
        </Button>
        <Button onClick={onClear} variant="outline" className="flex-1">
          Clear
        </Button>
      </div>
    </div>
  );
};

// 将日期筛选值转换为FilterConfig数组
export const dateFilterToConfigs = (column: string, filterValue: DateFilterValue): FilterConfig[] => {
  const configs: FilterConfig[] = [];

  // 日期范围筛选
  if (filterValue.enableRange && filterValue.startDate) {
    configs.push({
      column,
      operator: filterValue.includeStart ? 'greater_than_or_equal' : 'greater_than',
      value: filterValue.startDate
    });
  }
  
  if (filterValue.enableRange && filterValue.endDate) {
    configs.push({
      column,
      operator: filterValue.includeEnd ? 'less_than_or_equal' : 'less_than',
      value: filterValue.endDate
    });
  }

  // 精确日期筛选
  if (filterValue.enableExact && filterValue.exactDate) {
    configs.push({
      column,
      operator: 'equals',
      value: filterValue.exactDate
    });
  }

  // 多值筛选
  if (filterValue.enableMultiValue && filterValue.values.length > 0) {
    filterValue.values.forEach(value => {
      configs.push({
        column,
        operator: 'equals',
        value
      });
    });
  }

  // 相对日期筛选（这里简化处理，实际应用中可能需要更复杂的逻辑）
  if (filterValue.enableRelative && filterValue.relativeValue) {
    const now = new Date();
    let targetDate: Date;
    
    switch (filterValue.relativeType) {
      case 'days':
        targetDate = new Date(now.getTime() - filterValue.relativeValue * 24 * 60 * 60 * 1000);
        break;
      case 'weeks':
        targetDate = new Date(now.getTime() - filterValue.relativeValue * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'months':
        targetDate = new Date(now);
        targetDate.setMonth(now.getMonth() - filterValue.relativeValue);
        break;
      case 'years':
        targetDate = new Date(now);
        targetDate.setFullYear(now.getFullYear() - filterValue.relativeValue);
        break;
      default:
        targetDate = now;
    }
    
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    switch (filterValue.relativeDirection) {
      case 'before':
        configs.push({
          column,
          operator: 'less_than',
          value: targetDateStr
        });
        break;
      case 'after':
        configs.push({
          column,
          operator: 'greater_than',
          value: targetDateStr
        });
        break;
      case 'within':
        configs.push({
          column,
          operator: 'greater_than_or_equal',
          value: targetDateStr
        });
        break;
    }
  }

  // 空值处理
  if (filterValue.includeNull) {
    configs.push({
      column,
      operator: 'is_null',
      value: 'null'
    });
  }
  
  if (filterValue.includeUndefined) {
    configs.push({
      column,
      operator: 'is_undefined',
      value: 'undefined'
    });
  }

  return configs;
};

// 检查值是否匹配日期筛选条件
export const matchesDateFilter = (value: any, filterValue: DateFilterValue): boolean => {
  // 空值处理
  if (value === null && filterValue.includeNull) return true;
  if (value === undefined && filterValue.includeUndefined) return true;
  if (value === null || value === undefined) return false;

  const dateValue = new Date(value);
  if (isNaN(dateValue.getTime())) return false;

  // 日期范围筛选
  if (filterValue.enableRange) {
    if (filterValue.startDate) {
      const startDate = new Date(filterValue.startDate);
      const comparison = filterValue.includeStart ? 
        dateValue >= startDate : dateValue > startDate;
      if (!comparison) return false;
    }
    
    if (filterValue.endDate) {
      const endDate = new Date(filterValue.endDate);
      const comparison = filterValue.includeEnd ? 
        dateValue <= endDate : dateValue < endDate;
      if (!comparison) return false;
    }
  }

  // 精确日期筛选
  if (filterValue.enableExact && filterValue.exactDate) {
    const exactDate = new Date(filterValue.exactDate);
    if (dateValue.getTime() !== exactDate.getTime()) return false;
  }

  // 多值筛选
  if (filterValue.enableMultiValue && filterValue.values.length > 0) {
    const dateStr = dateValue.toISOString().split('T')[0];
    if (!filterValue.values.includes(dateStr)) return false;
  }

  // 相对日期筛选
  if (filterValue.enableRelative && filterValue.relativeValue) {
    const now = new Date();
    let targetDate: Date;
    
    switch (filterValue.relativeType) {
      case 'days':
        targetDate = new Date(now.getTime() - filterValue.relativeValue * 24 * 60 * 60 * 1000);
        break;
      case 'weeks':
        targetDate = new Date(now.getTime() - filterValue.relativeValue * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'months':
        targetDate = new Date(now);
        targetDate.setMonth(now.getMonth() - filterValue.relativeValue);
        break;
      case 'years':
        targetDate = new Date(now);
        targetDate.setFullYear(now.getFullYear() - filterValue.relativeValue);
        break;
      default:
        targetDate = now;
    }
    
    switch (filterValue.relativeDirection) {
      case 'before':
        if (dateValue >= targetDate) return false;
        break;
      case 'after':
        if (dateValue <= targetDate) return false;
        break;
      case 'within':
        if (dateValue < targetDate) return false;
        break;
    }
  }

  return true;
};