export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  ignoreOrder?: boolean;
}

export interface DiffStatistics {
  additions: number;
  deletions: number;
  modifications: number;
  unchanged: number;
  totalChanges: number;
}

export interface DiffResult {
  diffs: any[];
  statistics: DiffStatistics;
  hasChanges: boolean;
  leftValue: any;
  rightValue: any;
}

export interface ComparisonSamplePair {
  name: string;
  description: string;
  jsonA: string;
  jsonB: string;
  category: string;
}

// Simple deep comparison for objects
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

// Simple diff implementation
function simpleDiff(objA: any, objB: any, path: string = ''): any[] {
  const changes: any[] = [];
  
  if (deepEqual(objA, objB)) {
    return changes;
  }
  
  if (typeof objA !== typeof objB || Array.isArray(objA) !== Array.isArray(objB)) {
    changes.push({
      type: 'CHANGE',
      key: path || 'root',
      leftValue: objA,
      rightValue: objB
    });
    return changes;
  }
  
  if (typeof objA !== 'object' || objA === null || objB === null) {
    changes.push({
      type: 'CHANGE',
      key: path || 'root',
      leftValue: objA,
      rightValue: objB
    });
    return changes;
  }
  
  if (Array.isArray(objA)) {
    const maxLength = Math.max(objA.length, objB.length);
    for (let i = 0; i < maxLength; i++) {
      const newPath = path ? `${path}[${i}]` : `[${i}]`;
      
      if (i >= objA.length) {
        changes.push({
          type: 'ADD',
          key: newPath,
          rightValue: objB[i]
        });
      } else if (i >= objB.length) {
        changes.push({
          type: 'REMOVE',
          key: newPath,
          leftValue: objA[i]
        });
      } else {
        changes.push(...simpleDiff(objA[i], objB[i], newPath));
      }
    }
  } else {
    const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
    
    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      
      if (!(key in objA)) {
        changes.push({
          type: 'ADD',
          key: newPath,
          rightValue: objB[key]
        });
      } else if (!(key in objB)) {
        changes.push({
          type: 'REMOVE',
          key: newPath,
          leftValue: objA[key]
        });
      } else {
        changes.push(...simpleDiff(objA[key], objB[key], newPath));
      }
    }
  }
  
  return changes;
}

// Main function to compare two JSON objects
export function compareJsonObjects(objA: any, objB: any, options: DiffOptions = {}): DiffResult {
  try {
    // Preprocess objects based on options
    const processedA = preprocessObject(objA, options);
    const processedB = preprocessObject(objB, options);
    
    // Perform the diff
    const diffs = simpleDiff(processedA, processedB);
    
    // Calculate statistics
    const statistics = calculateDiffStatistics(diffs);
    const hasChanges = statistics.totalChanges > 0;
    
    return {
      diffs,
      statistics,
      hasChanges,
      leftValue: processedA,
      rightValue: processedB,
    };
  } catch (error) {
    console.error('Error comparing JSON objects:', error);
    throw new Error(`JSON comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate a human-readable diff report
export function generateDiffReport(objA: any, objB: any, options: DiffOptions = {}): string {
  try {
    const diffResult = compareJsonObjects(objA, objB, options);
    const { statistics, diffs } = diffResult;
    
    let report = '# JSON Comparison Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    // Summary statistics
    report += '## Summary\n';
    report += `- **Total Changes**: ${statistics.totalChanges}\n`;
    report += `- **Additions**: ${statistics.additions}\n`;
    report += `- **Deletions**: ${statistics.deletions}\n`;
    report += `- **Modifications**: ${statistics.modifications}\n`;
    report += `- **Unchanged**: ${statistics.unchanged}\n\n`;
    
    if (statistics.totalChanges === 0) {
      report += '## Result\n';
      report += 'No differences found. The JSON objects are identical.\n';
      return report;
    }
    
    // Detailed changes
    report += '## Changes\n\n';
    
    diffs.forEach((diff, index) => {
      report += `### Change ${index + 1}\n`;
      report += `**Type**: ${diff.type}\n`;
      report += `**Path**: ${diff.key || 'root'}\n`;
      
      if (diff.type === 'ADD') {
        report += `**Added**: \`${JSON.stringify(diff.rightValue)}\`\n`;
      } else if (diff.type === 'REMOVE') {
        report += `**Removed**: \`${JSON.stringify(diff.leftValue)}\`\n`;
      } else if (diff.type === 'CHANGE') {
        report += `**Before**: \`${JSON.stringify(diff.leftValue)}\`\n`;
        report += `**After**: \`${JSON.stringify(diff.rightValue)}\`\n`;
      }
      
      report += '\n';
    });
    
    return report;
  } catch (error) {
    console.error('Error generating diff report:', error);
    throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Format JSON string for comparison
export function formatJsonForComparison(jsonString: string, options: DiffOptions = {}): string {
  try {
    const parsed = JSON.parse(jsonString);
    const processed = preprocessObject(parsed, options);
    return JSON.stringify(processed, null, 2);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Calculate detailed statistics from diff results
export function calculateDiffStatistics(diffs: any[]): DiffStatistics {
  const stats: DiffStatistics = {
    additions: 0,
    deletions: 0,
    modifications: 0,
    unchanged: 0,
    totalChanges: 0,
  };
  
  diffs.forEach(diff => {
    switch (diff.type) {
      case 'ADD':
        stats.additions++;
        break;
      case 'REMOVE':
        stats.deletions++;
        break;
      case 'CHANGE':
        stats.modifications++;
        break;
      default:
        stats.unchanged++;
        break;
    }
  });
  
  stats.totalChanges = stats.additions + stats.deletions + stats.modifications;
  
  return stats;
}

// Preprocess objects based on diff options
function preprocessObject(obj: any, options: DiffOptions): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle primitive values
  if (typeof obj !== 'object') {
    if (typeof obj === 'string' && options.ignoreCase) {
      return obj.toLowerCase();
    }
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    const processed = obj.map(item => preprocessObject(item, options));
    return options.ignoreOrder ? processed.sort() : processed;
  }
  
  // Handle objects
  const processed: any = {};
  Object.keys(obj).forEach(key => {
    const processedKey = options.ignoreCase ? key.toLowerCase() : key;
    processed[processedKey] = preprocessObject(obj[key], options);
  });
  
  // Sort object keys if ignoring order
  if (options.ignoreOrder) {
    const sortedKeys = Object.keys(processed).sort();
    const sortedObj: any = {};
    sortedKeys.forEach(key => {
      sortedObj[key] = processed[key];
    });
    return sortedObj;
  }
  
  return processed;
}

// Validate JSON string
export function validateJsonString(jsonString: string): { isValid: boolean; error?: string; parsed?: any } {
  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, parsed };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error',
    };
  }
}

// Check if two JSON strings are structurally identical
export function areJsonStringsEqual(jsonA: string, jsonB: string, options: DiffOptions = {}): boolean {
  try {
    const objA = JSON.parse(jsonA);
    const objB = JSON.parse(jsonB);
    const diffResult = compareJsonObjects(objA, objB, options);
    return !diffResult.hasChanges;
  } catch {
    return false;
  }
}

// Extract paths of all changes from diff result
export function extractChangePaths(diffs: any[]): string[] {
  return diffs.map(diff => diff.key || 'root').filter(Boolean);
}

// Get diff summary as a simple object
export function getDiffSummary(diffResult: DiffResult): {
  hasChanges: boolean;
  changeCount: number;
  summary: string;
} {
  const { statistics, hasChanges } = diffResult;
  
  if (!hasChanges) {
    return {
      hasChanges: false,
      changeCount: 0,
      summary: 'No differences found',
    };
  }
  
  const parts = [];
  if (statistics.additions > 0) parts.push(`${statistics.additions} addition${statistics.additions !== 1 ? 's' : ''}`);
  if (statistics.deletions > 0) parts.push(`${statistics.deletions} deletion${statistics.deletions !== 1 ? 's' : ''}`);
  if (statistics.modifications > 0) parts.push(`${statistics.modifications} modification${statistics.modifications !== 1 ? 's' : ''}`);
  
  return {
    hasChanges: true,
    changeCount: statistics.totalChanges,
    summary: parts.join(', '),
  };
}