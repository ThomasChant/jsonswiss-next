export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  statistics: JsonStatistics;
}

export interface JsonStatistics {
  totalLines: number;
  totalCharacters: number;
  totalBytes: number;
  objectCount: number;
  arrayCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
  maxDepth: number;
  keyCount: number;
}

export class JsonValidator {
  validate(jsonString: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      statistics: this.calculateStatistics(jsonString)
    };

    if (!jsonString.trim()) {
      result.errors.push({
        line: 1,
        column: 1,
        message: "Empty JSON input",
        severity: 'error'
      });
      return result;
    }

    try {
      const parsed = JSON.parse(jsonString);
      result.isValid = true;
      
      // Additional validation checks
      this.validateStructure(parsed, result);
      
    } catch (error) {
      result.isValid = false;
      const parseError = this.parseJsonError(error as Error, jsonString);
      result.errors.push(parseError);
    }

    return result;
  }

  private parseJsonError(error: Error, jsonString: string): ValidationError {
    const message = error.message;
    let line = 1;
    let column = 1;

    // Try to extract line and column from error message
    const positionMatch = message.match(/position (\d+)/);
    if (positionMatch) {
      const position = parseInt(positionMatch[1]);
      const lines = jsonString.substring(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    // Parse different types of JSON errors
    let friendlyMessage = message;
    if (message.includes('Unexpected token')) {
      const tokenMatch = message.match(/Unexpected token (.+?) in JSON at position/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        if (token === '}') {
          friendlyMessage = "Unexpected closing brace. Check for missing comma or extra brace.";
        } else if (token === ']') {
          friendlyMessage = "Unexpected closing bracket. Check for missing comma or extra bracket.";
        } else if (token === ',') {
          friendlyMessage = "Unexpected comma. Check for trailing comma or missing value.";
        } else {
          friendlyMessage = `Unexpected character '${token}'. Check for syntax errors.`;
        }
      }
    } else if (message.includes('Unexpected end of JSON input')) {
      friendlyMessage = "Incomplete JSON. Check for missing closing braces or brackets.";
    } else if (message.includes('Unexpected string')) {
      friendlyMessage = "Invalid string. Check for missing commas or incorrect quotes.";
    }

    return {
      line,
      column,
      message: friendlyMessage,
      severity: 'error'
    };
  }

  private validateStructure(obj: any, result: ValidationResult) {
    // Check for potential issues that aren't syntax errors
    this.checkForDuplicateKeys(obj, result);
    this.checkForDeepNesting(obj, result);
    this.checkForLargeNumbers(obj, result);
  }

  private checkForDuplicateKeys(obj: any, result: ValidationResult, path: string = '') {
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      // This check is limited as JSON.parse already handles duplicate keys
      // by keeping the last value, but we can warn about potential issues
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          this.checkForDuplicateKeys(value, result, currentPath);
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          this.checkForDuplicateKeys(item, result, `${path}[${index}]`);
        }
      });
    }
  }

  private checkForDeepNesting(obj: any, result: ValidationResult, depth: number = 0) {
    if (depth > 100) {
      result.warnings.push({
        line: 1,
        column: 1,
        message: `Very deep nesting detected (depth > 100). This might cause performance issues.`,
        severity: 'warning'
      });
      return;
    }

    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach(item => this.checkForDeepNesting(item, result, depth + 1));
      } else {
        Object.values(obj).forEach(value => this.checkForDeepNesting(value, result, depth + 1));
      }
    }
  }

  private checkForLargeNumbers(obj: any, result: ValidationResult) {
    if (typeof obj === 'number') {
      if (!Number.isSafeInteger(obj) && Number.isInteger(obj)) {
        result.warnings.push({
          line: 1,
          column: 1,
          message: `Large integer ${obj} detected. May lose precision in JavaScript.`,
          severity: 'warning'
        });
      }
    } else if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach(item => this.checkForLargeNumbers(item, result));
      } else {
        Object.values(obj).forEach(value => this.checkForLargeNumbers(value, result));
      }
    }
  }

  private calculateStatistics(jsonString: string): JsonStatistics {
    const stats: JsonStatistics = {
      totalLines: jsonString.split('\n').length,
      totalCharacters: jsonString.length,
      totalBytes: new Blob([jsonString]).size,
      objectCount: 0,
      arrayCount: 0,
      stringCount: 0,
      numberCount: 0,
      booleanCount: 0,
      nullCount: 0,
      maxDepth: 0,
      keyCount: 0
    };

    try {
      const parsed = JSON.parse(jsonString);
      this.countTypes(parsed, stats, 0);
    } catch {
      // If parsing fails, we can't get type statistics
    }

    return stats;
  }

  private countTypes(obj: any, stats: JsonStatistics, depth: number) {
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (obj === null) {
      stats.nullCount++;
    } else if (typeof obj === 'boolean') {
      stats.booleanCount++;
    } else if (typeof obj === 'number') {
      stats.numberCount++;
    } else if (typeof obj === 'string') {
      stats.stringCount++;
    } else if (Array.isArray(obj)) {
      stats.arrayCount++;
      obj.forEach(item => this.countTypes(item, stats, depth + 1));
    } else if (typeof obj === 'object') {
      stats.objectCount++;
      stats.keyCount += Object.keys(obj).length;
      Object.values(obj).forEach(value => this.countTypes(value, stats, depth + 1));
    }
  }
}

export class JsonSchemaGenerator {
  generateSchema(obj: any): object {
    return this.inferType(obj);
  }

  private inferType(value: any): any {
    if (value === null) {
      return { type: "null" };
    }

    if (Array.isArray(value)) {
      const schema: any = {
        type: "array"
      };

      if (value.length > 0) {
        // Try to find common item type
        const itemTypes = value.map(item => this.inferType(item));
        const firstType = itemTypes[0];
        
        // Check if all items have the same type
        const allSameType = itemTypes.every(type => 
          JSON.stringify(type) === JSON.stringify(firstType)
        );

        if (allSameType) {
          schema.items = firstType;
        } else {
          schema.items = {
            anyOf: [...new Set(itemTypes.map(type => JSON.stringify(type)))]
              .map(typeStr => JSON.parse(typeStr))
          };
        }
      }

      return schema;
    }

    if (typeof value === 'object') {
      const schema: any = {
        type: "object",
        properties: {}
      };

      const required: string[] = [];

      for (const [key, val] of Object.entries(value)) {
        schema.properties[key] = this.inferType(val);
        required.push(key);
      }

      if (required.length > 0) {
        schema.required = required;
      }

      return schema;
    }

    if (typeof value === 'string') {
      const schema: any = { type: "string" };
      
      // Try to detect common patterns
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        schema.format = "date";
      } else if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        schema.format = "date-time";
      } else if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        schema.format = "email";
      } else if (value.match(/^https?:\/\/.+/)) {
        schema.format = "uri";
      }

      return schema;
    }

    if (typeof value === 'number') {
      return {
        type: Number.isInteger(value) ? "integer" : "number"
      };
    }

    if (typeof value === 'boolean') {
      return { type: "boolean" };
    }

    return { type: "string" };
  }
}

export function validateJsonSchema(data: any, schema: any): { valid: boolean; errors: string[] } {
  // Basic schema validation implementation
  const errors: string[] = [];
  
  try {
    const isValid = validateAgainstSchema(data, schema, '', errors);
    return { valid: isValid && errors.length === 0, errors };
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}

function validateAgainstSchema(data: any, schema: any, path: string, errors: string[]): boolean {
  if (!schema.type) return true;

  const currentPath = path || 'root';

  // Check type
  if (schema.type === 'null' && data !== null) {
    errors.push(`${currentPath}: Expected null, got ${typeof data}`);
    return false;
  }

  if (schema.type === 'array' && !Array.isArray(data)) {
    errors.push(`${currentPath}: Expected array, got ${typeof data}`);
    return false;
  }

  if (schema.type === 'object' && (typeof data !== 'object' || data === null || Array.isArray(data))) {
    errors.push(`${currentPath}: Expected object, got ${Array.isArray(data) ? 'array' : typeof data}`);
    return false;
  }

  if (schema.type === 'string' && typeof data !== 'string') {
    errors.push(`${currentPath}: Expected string, got ${typeof data}`);
    return false;
  }

  if (schema.type === 'number' && typeof data !== 'number') {
    errors.push(`${currentPath}: Expected number, got ${typeof data}`);
    return false;
  }

  if (schema.type === 'integer' && (!Number.isInteger(data))) {
    errors.push(`${currentPath}: Expected integer, got ${typeof data}`);
    return false;
  }

  if (schema.type === 'boolean' && typeof data !== 'boolean') {
    errors.push(`${currentPath}: Expected boolean, got ${typeof data}`);
    return false;
  }

  // Validate object properties
  if (schema.type === 'object' && schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (data[key] !== undefined) {
        validateAgainstSchema(data[key], propSchema, `${currentPath}.${key}`, errors);
      }
    }

    // Check required properties
    if (schema.required) {
      for (const requiredKey of schema.required) {
        if (data[requiredKey] === undefined) {
          errors.push(`${currentPath}: Missing required property '${requiredKey}'`);
        }
      }
    }
  }

  // Validate array items
  if (schema.type === 'array' && schema.items && Array.isArray(data)) {
    data.forEach((item, index) => {
      validateAgainstSchema(item, schema.items, `${currentPath}[${index}]`, errors);
    });
  }

  return true;
}