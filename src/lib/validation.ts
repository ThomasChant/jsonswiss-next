export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  maxFilenameLength?: number;
}

export interface JsonValidationOptions {
  maxDepth?: number;
  maxNodes?: number;
  maxStringLength?: number;
  maxArrayLength?: number;
  maxObjectKeys?: number;
}

// Default validation options
const DEFAULT_FILE_OPTIONS: Required<FileValidationOptions> = {
  maxSizeBytes: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['application/json', 'text/plain', 'text/csv', 'application/xml', 'text/xml', 'application/yaml', 'text/yaml'],
  maxFilenameLength: 255,
};

const DEFAULT_JSON_OPTIONS: Required<JsonValidationOptions> = {
  maxDepth: 50,
  maxNodes: 10000,
  maxStringLength: 1000000, // 1MB
  maxArrayLength: 10000,
  maxObjectKeys: 1000,
};

/**
 * Validates file upload requirements
 */
export function validateFile(file: File, options: FileValidationOptions = {}): ValidationResult {
  const opts = { ...DEFAULT_FILE_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  if (file.size > opts.maxSizeBytes) {
    errors.push(`File size (${formatBytes(file.size)}) exceeds maximum allowed size (${formatBytes(opts.maxSizeBytes)})`);
  }

  // Warn if file is large but under limit
  if (file.size > opts.maxSizeBytes * 0.8) {
    warnings.push(`Large file detected (${formatBytes(file.size)}). Processing may be slow.`);
  }

  // Check file type
  if (opts.allowedTypes.length > 0 && !opts.allowedTypes.includes(file.type)) {
    // Also check by extension if MIME type check fails
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['json', 'txt', 'csv', 'xml', 'yaml', 'yml'];
    
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File type '${file.type}' is not supported. Allowed types: ${opts.allowedTypes.join(', ')}`);
    }
  }

  // Check filename length
  if (file.name.length > opts.maxFilenameLength) {
    errors.push(`Filename is too long (${file.name.length} characters). Maximum allowed: ${opts.maxFilenameLength}`);
  }

  // Check for potentially problematic characters in filename
  if (/[<>:"|?*]/.test(file.name)) {
    warnings.push('Filename contains special characters that may cause issues.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates JSON structure for performance and security
 */
export function validateJsonStructure(data: any, options: JsonValidationOptions = {}): ValidationResult {
  const opts = { ...DEFAULT_JSON_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];
  
  let nodeCount = 0;
  let maxDepthFound = 0;

  function traverse(obj: any, currentDepth: number = 0, path: string = 'root'): void {
    nodeCount++;
    maxDepthFound = Math.max(maxDepthFound, currentDepth);

    // Check depth limit
    if (currentDepth > opts.maxDepth) {
      errors.push(`Maximum nesting depth (${opts.maxDepth}) exceeded at path: ${path}`);
      return;
    }

    // Check node count limit
    if (nodeCount > opts.maxNodes) {
      errors.push(`Maximum node count (${opts.maxNodes}) exceeded. Current count: ${nodeCount}`);
      return;
    }

    if (typeof obj === 'string') {
      // Check string length
      if (obj.length > opts.maxStringLength) {
        errors.push(`String too long at path ${path}: ${obj.length} characters (max: ${opts.maxStringLength})`);
      }
    } else if (Array.isArray(obj)) {
      // Check array length
      if (obj.length > opts.maxArrayLength) {
        errors.push(`Array too large at path ${path}: ${obj.length} items (max: ${opts.maxArrayLength})`);
      }

      // Traverse array elements
      obj.forEach((item, index) => {
        if (nodeCount <= opts.maxNodes) {
          traverse(item, currentDepth + 1, `${path}[${index}]`);
        }
      });
    } else if (obj && typeof obj === 'object') {
      const keys = Object.keys(obj);
      
      // Check object key count
      if (keys.length > opts.maxObjectKeys) {
        errors.push(`Object has too many keys at path ${path}: ${keys.length} keys (max: ${opts.maxObjectKeys})`);
      }

      // Traverse object properties
      keys.forEach(key => {
        if (nodeCount <= opts.maxNodes) {
          traverse(obj[key], currentDepth + 1, `${path}.${key}`);
        }
      });
    }
  }

  try {
    traverse(data);

    // Add performance warnings
    if (nodeCount > opts.maxNodes * 0.8) {
      warnings.push(`Large data structure detected (${nodeCount} nodes). Operations may be slow.`);
    }

    if (maxDepthFound > opts.maxDepth * 0.8) {
      warnings.push(`Deep nesting detected (${maxDepthFound} levels). Consider flattening the structure.`);
    }

  } catch (error) {
    errors.push(`Error during validation: ${(error as Error).message}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitizes user input to prevent XSS and other security issues
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates JSON string before parsing
 */
export function validateJsonString(jsonString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!jsonString || jsonString.trim() === '') {
    errors.push('JSON string is empty');
    return { isValid: false, errors, warnings };
  }

  // Check for potentially problematic patterns
  const suspiciousPatterns = [
    { pattern: /__proto__/, message: 'Contains potentially unsafe __proto__ property' },
    { pattern: /constructor/, message: 'Contains constructor property (potential prototype pollution)' },
    { pattern: /eval\s*\(/, message: 'Contains eval() function call' },
    { pattern: /function\s*\(/, message: 'Contains function definition' },
  ];

  suspiciousPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(jsonString)) {
      warnings.push(message);
    }
  });

  // Try to parse JSON
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate the parsed structure
    const structureValidation = validateJsonStructure(parsed);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);
    
  } catch (error) {
    errors.push(`Invalid JSON syntax: ${(error as Error).message}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Formats byte size for human reading
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if content appears to be JSON
 */
export function looksLikeJson(content: string): boolean {
  const trimmed = content.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

/**
 * Estimates processing time based on data size
 */
export function estimateProcessingTime(dataSize: number): string {
  if (dataSize < 1024) return 'Instant';
  if (dataSize < 1024 * 1024) return '< 1 second';
  if (dataSize < 10 * 1024 * 1024) return '1-5 seconds';
  if (dataSize < 50 * 1024 * 1024) return '5-30 seconds';
  return '30+ seconds';
}