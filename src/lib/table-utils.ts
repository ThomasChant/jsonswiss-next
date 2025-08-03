export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';

export type TableType = 'object-array' | 'primitive-array' | 'single-object';

export type SortDirection = 'asc' | 'desc' | null;

export type TableDensity = 'comfortable' | 'regular' | 'compact';

export interface FilterConfig {
  column: string;
  operator: FilterOperator;
  value: string;
}

/**
 * Enhanced type-aware comparison function for sorting
 * Handles proper null/undefined handling and type precedence (boolean < number < string < object)
 * Improved for better null handling and complex object comparison consistency
 */
export function compareValues(a: any, b: any, direction: 'asc' | 'desc' = 'asc'): number {
  // Enhanced null/undefined handling - nulls always sort to bottom in asc, top in desc
  const isANull = a == null;
  const isBNull = b == null;
  
  if (isANull && isBNull) return 0;
  if (isANull) return direction === 'asc' ? 1 : -1;  // null sorts last in asc
  if (isBNull) return direction === 'asc' ? -1 : 1;

  // Get type precedence values
  const getTypePrecedence = (value: any): number => {
    if (typeof value === 'boolean') return 1;
    if (typeof value === 'number') return 2;
    if (typeof value === 'string') return 3;
    if (Array.isArray(value)) return 4;
    if (typeof value === 'object') return 5;
    return 6;
  };

  const aPrecedence = getTypePrecedence(a);
  const bPrecedence = getTypePrecedence(b);

  // If different types, sort by type precedence
  if (aPrecedence !== bPrecedence) {
    return direction === 'asc' ? aPrecedence - bPrecedence : bPrecedence - aPrecedence;
  }

  // Same type comparison
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    // false < true
    const result = a === b ? 0 : (a ? 1 : -1);
    return direction === 'desc' ? -result : result;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    const result = a - b;
    return direction === 'desc' ? -result : result;
  }

  if (typeof a === 'string' && typeof b === 'string') {
    const result = a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    return direction === 'desc' ? -result : result;
  }

  // For objects, arrays, convert to string representation with consistent ordering
  try {
    const aStr = JSON.stringify(a, Object.keys(a || {}).sort());
    const bStr = JSON.stringify(b, Object.keys(b || {}).sort());
    const result = aStr.localeCompare(bStr);
    return direction === 'desc' ? -result : result;
  } catch {
    // Fallback to string conversion if JSON.stringify fails
    const aStr = String(a);
    const bStr = String(b);
    const result = aStr.localeCompare(bStr);
    return direction === 'desc' ? -result : result;
  }
}

/**
 * Check if a value matches a filter
 */
export function matchesFilter(value: any, filter: FilterConfig): boolean {
  const { operator, value: filterValue } = filter;

  // Handle empty value operators
  if (operator === 'is_empty') {
    return value == null || value === '' || (Array.isArray(value) && value.length === 0);
  }
  if (operator === 'is_not_empty') {
    return value != null && value !== '' && !(Array.isArray(value) && value.length === 0);
  }

  // Convert value to string for comparison (except for numeric operations)
  const valueStr = value?.toString() || '';
  const filterStr = filterValue.toString();

  switch (operator) {
    case 'equals':
      return valueStr.toLowerCase() === filterStr.toLowerCase();
    
    case 'not_equals':
      return valueStr.toLowerCase() !== filterStr.toLowerCase();
    
    case 'contains':
      return valueStr.toLowerCase().includes(filterStr.toLowerCase());
    
    case 'not_contains':
      return !valueStr.toLowerCase().includes(filterStr.toLowerCase());
    
    case 'starts_with':
      return valueStr.toLowerCase().startsWith(filterStr.toLowerCase());
    
    case 'ends_with':
      return valueStr.toLowerCase().endsWith(filterStr.toLowerCase());
    
    case 'greater_than':
      if (typeof value === 'number' && !isNaN(Number(filterValue))) {
        return value > Number(filterValue);
      }
      return valueStr.localeCompare(filterStr) > 0;
    
    case 'less_than':
      if (typeof value === 'number' && !isNaN(Number(filterValue))) {
        return value < Number(filterValue);
      }
      return valueStr.localeCompare(filterStr) < 0;
    
    default:
      return true;
  }
}

/**
 * Get display representation for operators
 */
export function getOperatorDisplay(operator: FilterOperator): string {
  const operatorMap: Record<FilterOperator, string> = {
    equals: '=',
    not_equals: '≠',
    contains: '⊃',
    not_contains: '⊅',
    starts_with: '^',
    ends_with: '$',
    greater_than: '>',
    less_than: '<',
    is_empty: '∅',
    is_not_empty: '≠∅'
  };
  
  return operatorMap[operator] || operator;
}

/**
 * Get display label for operators
 */
export function getOperatorLabel(operator: FilterOperator): string {
  const operatorLabels: Record<FilterOperator, string> = {
    equals: 'Equals',
    not_equals: 'Not equals',
    contains: 'Contains',
    not_contains: 'Does not contain',
    starts_with: 'Starts with',
    ends_with: 'Ends with',
    greater_than: 'Greater than',
    less_than: 'Less than',
    is_empty: 'Is empty',
    is_not_empty: 'Is not empty'
  };
  
  return operatorLabels[operator] || operator;
}

/**
 * Infer the data type of a column based on its values
 */
export function inferColumnType(values: any[]): DataType {
  if (values.length === 0) return 'string';

  // Filter out null/undefined values for type inference
  const nonNullValues = values.filter(v => v != null);
  if (nonNullValues.length === 0) return 'null';

  // Count occurrences of each type
  const typeCounts: Record<string, number> = {};
  
  nonNullValues.forEach(value => {
    let type: string;
    if (Array.isArray(value)) {
      type = 'array';
    } else if (typeof value === 'object') {
      type = 'object';
    } else {
      type = typeof value;
    }
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  // Return the most common type
  const sortedTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a);
  
  return sortedTypes[0][0] as DataType;
}

/**
 * Get all available operators for a given data type
 */
export function getOperatorsForType(dataType: DataType): FilterOperator[] {
  const baseOperators: FilterOperator[] = ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
  
  switch (dataType) {
    case 'string':
      return [...baseOperators, 'contains', 'not_contains', 'starts_with', 'ends_with'];
    
    case 'number':
      return [...baseOperators, 'greater_than', 'less_than'];
    
    case 'boolean':
      return ['equals', 'not_equals'];
    
    case 'object':
    case 'array':
      return ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
    
    default:
      return baseOperators;
  }
}

/**
 * Priority keys for column ordering - these appear first
 * Enhanced to match vanilla JS version behavior
 */
const priorityKeys = ['id', 'name', 'title', 'type', 'key'];

/**
 * Extract column keys from data array with priority ordering
 * Enhanced with better priority handling and consistent sorting
 */
export function extractColumnKeys(data: any[]): string[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  const keySet = new Set<string>();
  
  data.forEach(item => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      Object.keys(item).forEach(key => keySet.add(key));
    }
  });
  
  const allKeys = Array.from(keySet);
  
  // Separate priority keys (in order) from other keys (alphabetically sorted)
  const foundPriorityKeys = priorityKeys.filter(key => allKeys.includes(key));
  const otherKeys = allKeys.filter(key => !priorityKeys.includes(key)).sort();
  
  return [...foundPriorityKeys, ...otherKeys];
}

/**
 * Get column information including type inference
 */
export function getColumnInfo(data: any[], columnKey: string) {
  const values = data.map(item => item?.[columnKey]);
  const dataType = inferColumnType(values);
  const availableOperators = getOperatorsForType(dataType);
  
  return {
    key: columnKey,
    type: dataType,
    operators: availableOperators,
    sampleValues: values.slice(0, 10) // First 10 values for reference
  };
}

/**
 * Determine the type of table data structure
 */
export function getTableType(data: any): TableType {
  if (!data) return 'single-object';
  
  if (Array.isArray(data)) {
    if (data.length === 0) return 'object-array';
    
    // Check if all items are objects (non-null, non-array)
    const hasObjects = data.some(item => 
      item !== null && 
      typeof item === 'object' && 
      !Array.isArray(item)
    );
    
    return hasObjects ? 'object-array' : 'primitive-array';
  }
  
  if (typeof data === 'object' && data !== null) {
    return 'single-object';
  }
  
  return 'single-object';
}

/**
 * Check if a value should be displayed as an expandable nested table
 */
export function shouldShowAsNestedTable(value: any): boolean {
  if (value == null) return false;
  
  if (Array.isArray(value)) {
    // Show as nested if array has objects or is non-empty
    return value.length > 0 && (
      value.some(item => typeof item === 'object' && item !== null) ||
      value.length > 3 // Show expansion for large primitive arrays too
    );
  }
  
  if (typeof value === 'object') {
    // Show as nested if object has properties
    return Object.keys(value).length > 0;
  }
  
  return false;
}

/**
 * Get a display preview for complex values
 */
export function getValuePreview(value: any, maxLength: number = 50): string {
  if (value == null) return 'null';
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `Array[${value.length}]`;
  }
  
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return `Object{${keys.length}}`;
  }
  
  const str = String(value);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Get the data type label for display
 */
export function getTypeLabel(value: any): string {
  if (value == null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Get the value type for a given value (used by PrimitiveValueDisplay)
 */
export function getValueType(value: any): DataType {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value as DataType;
}

/**
 * Format a value for display (used by PrimitiveValueDisplay)
 */
export function formatValue(value: any): string {
  // Handle null and undefined explicitly
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  // Handle primitive types
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toString();
  
  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[${value.length} items]`;
  }
  
  // Handle objects
  if (typeof value === 'object' && value !== null) {
    try {
      const keys = Object.keys(value);
      if (keys.length === 0) return '{}';
      return `{${keys.length} properties}`;
    } catch (error) {
      // Fallback for objects that can't be enumerated
      return '[object]';
    }
  }
  
  // Final fallback - ensure we never return [object Object]
  try {
    const stringValue = String(value);
    // If String() returns [object Object], try to provide a better representation
    if (stringValue === '[object Object]') {
      return '[complex object]';
    }
    return stringValue;
  } catch (error) {
    return '[invalid value]';
  }
}

/**
 * Check if a value is complex (object or array)
 */
export function isComplexValue(value: any): boolean {
  return value != null && (typeof value === 'object' || Array.isArray(value));
}

/**
 * Get density-specific CSS classes
 */
export function getDensityClasses(density: TableDensity): {
  container: string;
  row: string;
  cell: string;
  header: string;
  toolbar: string;
} {
  const classes = {
    container: 'table-container',
    row: 'table-row',
    cell: 'table-cell',
    header: 'table-header',
    toolbar: 'table-toolbar'
  };

  if (density === 'compact') {
    return {
      container: `${classes.container} table-container--compact`,
      row: `${classes.row} table-row--compact`,
      cell: `${classes.cell} table-cell--compact`,
      header: `${classes.header} table-header--compact`,
      toolbar: `${classes.toolbar} table-toolbar--compact`
    };
  }

  return classes;
}

/**
 * Get the default table density
 */
export function getDefaultDensity(): TableDensity {
  return 'regular';
}

/**
 * Check if density is compact
 */
export function isDensityCompact(density: TableDensity): boolean {
  return density === 'compact';
}

/**
 * Density-specific measurements
 */
export const DENSITY_MEASUREMENTS = {
  comfortable: {
    rowHeight: '3rem',
    cellPadding: '0.75rem 1rem',
    headerHeight: '3.5rem',
    containerPadding: '1rem'
  },
  regular: {
    rowHeight: '2.75rem',
    cellPadding: '0.625rem 0.875rem',
    headerHeight: '3rem',
    containerPadding: '0.875rem'
  },
  compact: {
    rowHeight: '2.25rem',
    cellPadding: '0.5rem 0.75rem',
    headerHeight: '2.5rem',
    containerPadding: '0.75rem'
  }
} as const;

/**
 * Get measurements for a specific density
 */
export function getDensityMeasurements(density: TableDensity) {
  return DENSITY_MEASUREMENTS[density];
}