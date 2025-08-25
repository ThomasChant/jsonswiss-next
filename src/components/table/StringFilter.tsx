import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { FilterConfig } from '@/lib/table-utils';

export interface StringFilterValue {
  // 模糊搜索
  enableFuzzy: boolean;
  fuzzyValue: string;
  caseSensitive: boolean;
  
  // 精确匹配
  enableExact: boolean;
  exactValue: string;
  
  // 多值筛选
  enableMultiValue: boolean;
  values: string[];
  
  // 空值处理
  includeNull: boolean;
  includeUndefined: boolean;
  includeEmpty: boolean;
  
  // 正则表达式
  enableRegex: boolean;
  regexValue: string;
  regexFlags: string;
}

export interface StringFilterProps {
  value: StringFilterValue;
  onChange: (value: StringFilterValue) => void;
  onApply: () => void;
  onClear: () => void;
  columnName: string;
}

export function StringFilter({ value, onChange, onApply, onClear, columnName }: StringFilterProps) {
  const [newValue, setNewValue] = useState('');

  const addValue = () => {
    if (newValue.trim() && !value.values.includes(newValue.trim())) {
      onChange({
        ...value,
        values: [...value.values, newValue.trim()]
      });
      setNewValue('');
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
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Filter options for column: <span className="font-medium">{columnName}</span>
      </div>

      {/* Fuzzy Search */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-fuzzy"
            checked={value.enableFuzzy}
            onCheckedChange={(checked) => onChange({ ...value, enableFuzzy: !!checked })}
          />
          <label htmlFor="enable-fuzzy" className="text-sm font-medium">
            Fuzzy Search (contains)
          </label>
        </div>
        {value.enableFuzzy && (
          <div className="space-y-2 ml-6">
            <Input
              placeholder="Search text..."
              value={value.fuzzyValue}
              onChange={(e) => onChange({ ...value, fuzzyValue: e.target.value })}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="case-sensitive"
                checked={value.caseSensitive}
                onCheckedChange={(checked) => onChange({ ...value, caseSensitive: !!checked })}
              />
              <label htmlFor="case-sensitive" className="text-sm">
                Case sensitive
              </label>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Exact Match */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-exact"
            checked={value.enableExact}
            onCheckedChange={(checked) => onChange({ ...value, enableExact: !!checked })}
          />
          <label htmlFor="enable-exact" className="text-sm font-medium">
            Exact Match
          </label>
        </div>
        {value.enableExact && (
          <div className="ml-6">
            <Input
              placeholder="Exact value..."
              value={value.exactValue}
              onChange={(e) => onChange({ ...value, exactValue: e.target.value })}
            />
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Multiple Values */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-multi"
            checked={value.enableMultiValue}
            onCheckedChange={(checked) => onChange({ ...value, enableMultiValue: !!checked })}
          />
          <label htmlFor="enable-multi" className="text-sm font-medium">
            Multiple Values (OR)
          </label>
        </div>
        {value.enableMultiValue && (
          <div className="space-y-2 ml-6">
            <div className="flex space-x-2">
              <Input
                placeholder="Add value..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addValue();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={addValue}
                disabled={!newValue.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {value.values.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {value.values.map((val, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {val}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeValue(val)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Regular Expression */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-regex"
            checked={value.enableRegex}
            onCheckedChange={(checked) => onChange({ ...value, enableRegex: !!checked })}
          />
          <label htmlFor="enable-regex" className="text-sm font-medium">
            Regular Expression
          </label>
        </div>
        {value.enableRegex && (
          <div className="space-y-2 ml-6">
            <Input
              placeholder="Regular expression pattern..."
              value={value.regexValue}
              onChange={(e) => onChange({ ...value, regexValue: e.target.value })}
            />
            <Input
              placeholder="Flags (e.g., gi)"
              value={value.regexFlags}
              onChange={(e) => onChange({ ...value, regexFlags: e.target.value })}
            />
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Special Values */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Include Special Values</div>
        <div className="space-y-1 ml-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-null"
              checked={value.includeNull}
              onCheckedChange={(checked) => onChange({ ...value, includeNull: !!checked })}
            />
            <label htmlFor="include-null" className="text-sm">null values</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-undefined"
              checked={value.includeUndefined}
              onCheckedChange={(checked) => onChange({ ...value, includeUndefined: !!checked })}
            />
            <label htmlFor="include-undefined" className="text-sm">undefined values</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-empty"
              checked={value.includeEmpty}
              onCheckedChange={(checked) => onChange({ ...value, includeEmpty: !!checked })}
            />
            <label htmlFor="include-empty" className="text-sm">empty strings</label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onClear}>
          Clear All
        </Button>
        <Button onClick={onApply}>
          Apply Filter
        </Button>
      </div>
    </div>
  );
}

// 将字符串筛选值转换为FilterConfig数组
export function stringFilterToConfigs(column: string, filter: StringFilterValue): FilterConfig[] {
  const configs: FilterConfig[] = [];

  // 模糊搜索
  if (filter.enableFuzzy && filter.fuzzyValue.trim()) {
    configs.push({
      column,
      operator: 'contains',
      value: filter.fuzzyValue.trim()
    });
  }

  // 精确匹配
  if (filter.enableExact && filter.exactValue.trim()) {
    configs.push({
      column,
      operator: 'equals',
      value: filter.exactValue.trim()
    });
  }

  // 多值筛选
  if (filter.enableMultiValue && filter.values.length > 0) {
    filter.values.forEach(value => {
      configs.push({
        column,
        operator: 'equals',
        value: value
      });
    });
  }

  // 正则表达式
  if (filter.enableRegex && filter.regexValue.trim()) {
    configs.push({
      column,
      operator: 'regex',
      value: filter.regexValue.trim()
    });
  }

  // 空值处理
  if (filter.includeNull) {
    configs.push({
      column,
      operator: 'is_null',
      value: ''
    });
  }

  if (filter.includeUndefined) {
    configs.push({
      column,
      operator: 'is_undefined',
      value: ''
    });
  }

  if (filter.includeEmpty) {
    configs.push({
      column,
      operator: 'equals',
      value: ''
    });
  }

  return configs;
}

// 检查值是否匹配字符串筛选条件
export function matchesStringFilter(value: any, filter: StringFilterValue): boolean {
  const stringValue = value?.toString() || '';
  
  // 如果没有启用任何筛选条件，返回true
  if (!filter.enableFuzzy && !filter.enableExact && !filter.enableMultiValue && 
      !filter.enableRegex && !filter.includeNull && !filter.includeUndefined && !filter.includeEmpty) {
    return true;
  }

  let matches = false;

  // 模糊搜索
  if (filter.enableFuzzy && filter.fuzzyValue.trim()) {
    const searchValue = filter.caseSensitive ? filter.fuzzyValue : filter.fuzzyValue.toLowerCase();
    const targetValue = filter.caseSensitive ? stringValue : stringValue.toLowerCase();
    if (targetValue.includes(searchValue)) {
      matches = true;
    }
  }

  // 精确匹配
  if (filter.enableExact && filter.exactValue.trim()) {
    if (stringValue === filter.exactValue) {
      matches = true;
    }
  }

  // 多值筛选
  if (filter.enableMultiValue && filter.values.length > 0) {
    if (filter.values.includes(stringValue)) {
      matches = true;
    }
  }

  // 正则表达式
  if (filter.enableRegex && filter.regexValue.trim()) {
    try {
      const regex = new RegExp(filter.regexValue, filter.regexFlags || '');
      if (regex.test(stringValue)) {
        matches = true;
      }
    } catch (e) {
      // 正则表达式无效，忽略
    }
  }

  // 空值处理
  if (value === null && filter.includeNull) {
    matches = true;
  }
  if (value === undefined && filter.includeUndefined) {
    matches = true;
  }
  if (stringValue === '' && filter.includeEmpty) {
    matches = true;
  }

  return matches;
}