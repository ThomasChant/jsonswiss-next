import { useState, useCallback } from 'react';
import { toast } from '@/lib/toast';
import { validateFile, validateJsonString, looksLikeJson, type FileValidationOptions } from '@/lib/validation';
import { useJsonStore } from '@/store/jsonStore';

interface FileImportOptions extends FileValidationOptions {
  accept?: string;
  multiple?: boolean;
  autoDetectFormat?: boolean;
  readAsArrayBuffer?: boolean;
}

interface FileImportResult {
  content: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  detectedFormat?: 'json' | 'csv' | 'xml' | 'yaml' | 'text' | 'excel';
  arrayBuffer?: ArrayBuffer;
}

interface SidebarImportResult {
  success: boolean;
  content: string;
  fileName: string;
  isValidJson: boolean;
  formattedContent?: string;
}

interface UseFileImportReturn {
  importFile: (file: File) => Promise<FileImportResult | null>;
  importFiles: (files: FileList | File[]) => Promise<(FileImportResult | null)[]>;
  importToSidebarEditor: (file: File) => Promise<SidebarImportResult | null>;
  handleSidebarDrop: (event: DragEvent) => Promise<void>;
  isLoading: boolean;
  progress: number;
}

export function useFileImport(options: FileImportOptions = {}): UseFileImportReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { setSidebarEditorContent, setSidebarMode } = useJsonStore();

  const detectFormat = useCallback((content: string, fileName: string): FileImportResult['detectedFormat'] => {
    if (!options.autoDetectFormat) return undefined;

    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Check by extension first (especially important for binary files)
    if (extension) {
      if (['json'].includes(extension)) return 'json';
      if (['csv'].includes(extension)) return 'csv';
      if (['xml'].includes(extension)) return 'xml';
      if (['yaml', 'yml'].includes(extension)) return 'yaml';
      if (['xlsx', 'xlsm', 'xls'].includes(extension)) return 'excel';
    }

    // Skip content detection for binary files
    if (content.startsWith('[Binary file:')) return 'excel';
    
    const trimmedContent = content.trim();

    // Check by content
    if (looksLikeJson(trimmedContent)) return 'json';
    
    if (trimmedContent.startsWith('<?xml') || trimmedContent.includes('<') && trimmedContent.includes('>')) {
      return 'xml';
    }
    
    if (trimmedContent.includes(',') && trimmedContent.includes('\n')) {
      // Simple heuristic for CSV
      const lines = trimmedContent.split('\n').slice(0, 5);
      const hasConsistentCommas = lines.every(line => line.includes(','));
      if (hasConsistentCommas) return 'csv';
    }

    // YAML detection (basic)
    if (trimmedContent.includes(':') && (trimmedContent.includes('\n-') || trimmedContent.match(/^\s*\w+:/m))) {
      return 'yaml';
    }

    return 'text';
  }, [options.autoDetectFormat]);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress((event.loaded / event.total) * 100);
        }
      };
      
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target?.result as ArrayBuffer);
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress((event.loaded / event.total) * 100);
        }
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const importFile = useCallback(async (file: File): Promise<FileImportResult | null> => {
    setIsLoading(true);
    setProgress(0);

    try {
      // Validate file
      const validation = validateFile(file, options);
      
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return null;
      }

      // Show warnings if any
      validation.warnings.forEach(warning => toast.info(warning));

      // Read file content
      let content: string = '';
      let arrayBuffer: ArrayBuffer | undefined;
      
      if (options.readAsArrayBuffer) {
        arrayBuffer = await readFileAsArrayBuffer(file);
        // For binary files, we can't provide text content directly
        content = `[Binary file: ${file.name}]`;
      } else {
        content = await readFileAsText(file);
        
        // Additional validation for JSON content
        if (options.autoDetectFormat && looksLikeJson(content)) {
          const jsonValidation = validateJsonString(content);
          if (!jsonValidation.isValid) {
            jsonValidation.errors.forEach(error => toast.error(error));
            return null;
          }
          jsonValidation.warnings.forEach(warning => toast.info(warning));
        }
      }

      const result: FileImportResult = {
        content,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        detectedFormat: options.readAsArrayBuffer ? 'excel' : detectFormat(content, file.name),
        arrayBuffer,
      };

      toast.success(`File "${file.name}" imported successfully`);
      return result;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to import file: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [options, detectFormat]);

  const importFiles = useCallback(async (files: FileList | File[]): Promise<(FileImportResult | null)[]> => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) {
      toast.error('No files selected');
      return [];
    }

    if (!options.multiple && fileArray.length > 1) {
      toast.error('Multiple files not allowed');
      return [];
    }

    setIsLoading(true);
    const results: (FileImportResult | null)[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setProgress((i / fileArray.length) * 100);
        
        const result = await importFile(file);
        results.push(result);
        
        // Small delay to prevent UI blocking
        if (fileArray.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      const successCount = results.filter(r => r !== null).length;
      const failureCount = results.length - successCount;

      if (fileArray.length > 1) {
        if (failureCount === 0) {
          toast.success(`All ${fileArray.length} files imported successfully`);
        } else if (successCount === 0) {
          toast.error(`Failed to import all ${fileArray.length} files`);
        } else {
          toast.info(`Imported ${successCount} of ${fileArray.length} files (${failureCount} failed)`);
        }
      }

      return results;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to import files: ${message}`);
      return [];
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [options, importFile]);

  const importToSidebarEditor = useCallback(async (file: File): Promise<SidebarImportResult | null> => {
    setIsLoading(true);
    setProgress(0);

    try {
      // Validate file for sidebar editor (only JSON and text files)
      const allowedTypes = ['application/json', 'text/plain', 'text/json'];
      const allowedExtensions = ['json', 'txt'];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension || '')) {
        toast.error('Only JSON and text files are supported for sidebar editor');
        return null;
      }

      // Basic file validation
      const validation = validateFile(file, {
        ...options,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB limit for sidebar editor
      });

      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return null;
      }

      // Read file content
      const content = await readFileAsText(file);
      
      if (!content.trim()) {
        toast.error('File is empty');
        return null;
      }

      // Check if content is valid JSON
      let isValidJson = false;
      let formattedContent = content;

      try {
        const parsed = JSON.parse(content);
        isValidJson = true;
        // Format the JSON with proper indentation
        formattedContent = JSON.stringify(parsed, null, 2);
      } catch (error) {
        // Not valid JSON, check if it looks like JSON that might be fixable
        if (looksLikeJson(content.trim())) {
          toast.warning('File content appears to be JSON but has syntax errors. You can edit it in the sidebar editor.');
        } else {
          toast.info('File imported as text. You can edit it to create valid JSON.');
        }
      }

      // Update sidebar editor content
      setSidebarEditorContent(formattedContent);

      // Switch to editor mode if not already
      setSidebarMode('editor');

      const result: SidebarImportResult = {
        success: true,
        content,
        fileName: file.name,
        isValidJson,
        formattedContent,
      };

      if (isValidJson) {
        toast.success(`JSON file "${file.name}" imported and formatted successfully`);
      } else {
        toast.success(`File "${file.name}" imported to sidebar editor`);
      }

      return result;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to import file to sidebar editor: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [setSidebarEditorContent, setSidebarMode, options]);

  const handleSidebarDrop = useCallback(async (event: DragEvent): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      toast.error('No files dropped');
      return;
    }

    if (files.length > 1) {
      toast.error('Please drop only one file at a time for sidebar editor');
      return;
    }

    const file = files[0];
    await importToSidebarEditor(file);
  }, [importToSidebarEditor]);

  return {
    importFile,
    importFiles,
    importToSidebarEditor,
    handleSidebarDrop,
    isLoading,
    progress,
  };
}
