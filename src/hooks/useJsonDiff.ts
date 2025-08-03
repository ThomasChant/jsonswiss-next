import { useState, useCallback, useMemo } from 'react';
import { 
  compareJsonObjects, 
  generateDiffReport, 
  validateJsonString,
  getDiffSummary,
  DiffOptions, 
  DiffResult, 
  DiffStatistics 
} from '@/lib/json-diff';

export interface UseJsonDiffResult {
  // State
  diffResult: DiffResult | null;
  isComparing: boolean;
  diffStatistics: DiffStatistics | null;
  lastComparisonTime: Date | null;
  error: string | null;
  jsonAValid: boolean;
  jsonBValid: boolean;
  
  // Functions
  compareJson: (jsonA: string, jsonB: string, options?: DiffOptions) => Promise<void>;
  clearDiff: () => void;
  exportDiffReport: (jsonA: string, jsonB: string, options?: DiffOptions) => Promise<string>;
  validateJson: (jsonString: string) => { isValid: boolean; error?: string };
  
  // Computed values
  hasChanges: boolean;
  changeCount: number;
  diffSummary: string;
}

export function useJsonDiff(): UseJsonDiffResult {
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [lastComparisonTime, setLastComparisonTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonAValid, setJsonAValid] = useState(false);
  const [jsonBValid, setJsonBValid] = useState(false);

  // Debounced comparison to avoid excessive re-computation
  const compareJson = useCallback(async (
    jsonA: string, 
    jsonB: string, 
    options: DiffOptions = {}
  ): Promise<void> => {
    if (!jsonA.trim() || !jsonB.trim()) {
      setDiffResult(null);
      setError(null);
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      // Validate both JSON strings
      const validationA = validateJsonString(jsonA);
      const validationB = validateJsonString(jsonB);
      
      setJsonAValid(validationA.isValid);
      setJsonBValid(validationB.isValid);

      if (!validationA.isValid) {
        throw new Error(`JSON A is invalid: ${validationA.error}`);
      }

      if (!validationB.isValid) {
        throw new Error(`JSON B is invalid: ${validationB.error}`);
      }

      // Perform comparison
      const result = compareJsonObjects(validationA.parsed, validationB.parsed, options);
      
      setDiffResult(result);
      setLastComparisonTime(new Date());
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Comparison failed';
      setError(errorMessage);
      setDiffResult(null);
      console.error('JSON comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  }, []);

  // Clear diff results and reset state
  const clearDiff = useCallback(() => {
    setDiffResult(null);
    setError(null);
    setLastComparisonTime(null);
    setJsonAValid(false);
    setJsonBValid(false);
  }, []);

  // Export diff report as markdown
  const exportDiffReport = useCallback(async (
    jsonA: string, 
    jsonB: string, 
    options: DiffOptions = {}
  ): Promise<string> => {
    try {
      // Validate both JSON strings first
      const validationA = validateJsonString(jsonA);
      const validationB = validateJsonString(jsonB);

      if (!validationA.isValid) {
        throw new Error(`JSON A is invalid: ${validationA.error}`);
      }

      if (!validationB.isValid) {
        throw new Error(`JSON B is invalid: ${validationB.error}`);
      }

      // Generate the report
      const report = generateDiffReport(validationA.parsed, validationB.parsed, options);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Report generation failed';
      throw new Error(`Failed to export diff report: ${errorMessage}`);
    }
  }, []);

  // Validate a single JSON string
  const validateJson = useCallback((jsonString: string) => {
    return validateJsonString(jsonString);
  }, []);

  // Computed values using useMemo for performance
  const diffStatistics = useMemo(() => {
    return diffResult?.statistics || null;
  }, [diffResult]);

  const hasChanges = useMemo(() => {
    return diffResult?.hasChanges || false;
  }, [diffResult]);

  const changeCount = useMemo(() => {
    return diffStatistics?.totalChanges || 0;
  }, [diffStatistics]);

  const diffSummary = useMemo(() => {
    if (!diffResult) return 'No comparison performed';
    
    const summary = getDiffSummary(diffResult);
    return summary.summary;
  }, [diffResult]);

  return {
    // State
    diffResult,
    isComparing,
    diffStatistics,
    lastComparisonTime,
    error,
    jsonAValid,
    jsonBValid,
    
    // Functions
    compareJson,
    clearDiff,
    exportDiffReport,
    validateJson,
    
    // Computed values
    hasChanges,
    changeCount,
    diffSummary,
  };
}