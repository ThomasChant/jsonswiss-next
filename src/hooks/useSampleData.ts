/**
 * Custom hook for loading sample data into functional pages
 * Provides auto-loading on mount and manual load functions
 */

import { useEffect, useCallback, useState } from 'react';
import { getSampleData, getSampleSchema } from '@/sample-data';
import { getSampleExcelFile } from '@/sample-data/binary-samples';
import { getSchemaById } from '@/sample-data/schemas';
import { useJsonStore } from '@/store/jsonStore';

interface UseSampleDataOptions {
  toolType: string;
  setInput?: (value: string) => void;
  setJsonInput?: (value: string) => void;
  setFileInput?: (file: File) => void;
  autoLoad?: boolean;
  updateGlobalStore?: boolean;
}

interface UseSampleDataReturn {
  loadDemo: () => void;
  isLoaded: boolean;
  sampleLoaded: boolean;
}

export function useSampleData({
  toolType,
  setInput,
  setJsonInput,
  setFileInput,
  autoLoad = true,
  updateGlobalStore = false
}: UseSampleDataOptions): UseSampleDataReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);
  const { setJsonData, jsonData, setSampleDataLoaded } = useJsonStore();

  const loadSampleData = useCallback(() => {
    try {
      const sampleData = getSampleData(toolType);
      
      // Handle different data types
      if (toolType === 'excelToJson' && setFileInput) {
        // Load Excel file for Excel-to-JSON converter
        const excelFile = getSampleExcelFile();
        setFileInput(excelFile);
      } else if (typeof sampleData === 'string') {
        // Handle string-based data (CSV, XML, YAML, etc.)
        if (setInput) {
          setInput(sampleData);
        }
      } else if (typeof sampleData === 'object') {
        // Handle JSON objects
        const jsonString = JSON.stringify(sampleData, null, 2);
        
        if (setJsonInput) {
          setJsonInput(jsonString);
        } else if (setInput) {
          setInput(jsonString);
        }
        
        // Update global store if needed (for JSON-to-X converters)
        if (updateGlobalStore) {
          setJsonData(sampleData, `Sample data loaded for ${toolType}`);
          setSampleDataLoaded(true);
        }
      }
      
      setIsLoaded(true);
      setSampleLoaded(true);
      
    } catch (error) {
      console.error(`Failed to load sample data for ${toolType}:`, error);
    }
  }, [toolType, setInput, setJsonInput, setFileInput, updateGlobalStore, setJsonData, setSampleDataLoaded]);

  const loadDemo = useCallback(() => {
    loadSampleData();
  }, [loadSampleData]);

  // Auto-load sample data on mount if enabled
  useEffect(() => {
    if (autoLoad && !isLoaded) {
      // For JSON-to-X converters, only auto-load if no existing data
      if (updateGlobalStore && jsonData) {
        return; // Don't overwrite existing data
      }
      
      // Add small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        loadSampleData();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [autoLoad, isLoaded, loadSampleData, updateGlobalStore, jsonData]);

  return {
    loadDemo,
    isLoaded,
    sampleLoaded
  };
}

// Specialized hook for schema-related tools
export function useSampleSchema() {
  const [schemaLoaded, setSchemaLoaded] = useState(false);
  
  const loadSampleSchema = useCallback(() => {
    try {
      const schema = getSampleSchema();
      setSchemaLoaded(true);
      return schema;
    } catch (error) {
      console.error('Failed to load sample schema:', error);
      return null;
    }
  }, []);

  return {
    loadSampleSchema,
    schemaLoaded
  };
}

// Hook for pages that need both JSON data and schema
export function useSampleDataWithSchema(toolType: string, options: Omit<UseSampleDataOptions, 'toolType'>) {
  const sampleData = useSampleData({ toolType, ...options });
  const sampleSchema = useSampleSchema();
  
  return {
    ...sampleData,
    ...sampleSchema
  };
}

// Specialized hook for schema-based tools (Mock Generator, etc.)
export function useSchemaTemplates() {
  const [currentSchemaId, setCurrentSchemaId] = useState<string>('');
  
  const loadSchemaTemplate = useCallback((schemaId: string) => {
    try {
      const template = getSchemaById(schemaId);
      if (template) {
        setCurrentSchemaId(schemaId);
        return template;
      }
      return null;
    } catch (error) {
      console.error(`Failed to load schema template ${schemaId}:`, error);
      return null;
    }
  }, []);

  const loadDefaultSchema = useCallback(() => {
    // Load a default schema template for demonstration
    return loadSchemaTemplate('user-profile-basic');
  }, [loadSchemaTemplate]);

  return {
    loadSchemaTemplate,
    loadDefaultSchema,
    currentSchemaId
  };
}

// Hook for Mock Generator page specifically
export function useMockGeneratorData() {
  const [schemaInput, setSchemaInput] = useState("");
  const schemaTemplates = useSchemaTemplates();
  
  const loadDemoSchema = useCallback((schemaId?: string) => {
    const template = schemaTemplates.loadSchemaTemplate(schemaId || 'user-profile-basic');
    if (template) {
      setSchemaInput(JSON.stringify(template.schema, null, 2));
      return template;
    }
    return null;
  }, [schemaTemplates]);

  const loadFromUrl = useCallback(() => {
    // Check URL parameters for schema ID
    const urlParams = new URLSearchParams(window.location.search);
    const schemaParam = urlParams.get('schema');
    if (schemaParam) {
      return loadDemoSchema(schemaParam);
    }
    return null;
  }, [loadDemoSchema]);

  return {
    schemaInput,
    setSchemaInput,
    loadDemoSchema,
    loadFromUrl,
    ...schemaTemplates
  };
}