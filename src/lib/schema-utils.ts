export interface SchemaAnalysis {
  depth: number;
  propertyCount: number;
  requiredProperties: number;
  optionalProperties: number;
  typeDistribution: Record<string, number>;
  hasArrays: boolean;
  hasNestedObjects: boolean;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedDataSize: 'small' | 'medium' | 'large';
}

export interface SchemaMetadata {
  title?: string;
  description?: string;
  version?: string;
  tags?: string[];
  examples?: any[];
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
}

// Analyze schema complexity and structure
export function analyzeSchema(schema: any): SchemaAnalysis {
  const analysis: SchemaAnalysis = {
    depth: 0,
    propertyCount: 0,
    requiredProperties: 0,
    optionalProperties: 0,
    typeDistribution: {},
    hasArrays: false,
    hasNestedObjects: false,
    complexity: 'simple',
    estimatedDataSize: 'small'
  };

  analyzeSchemaRecursive(schema, analysis, 0);
  
  // Determine complexity based on various factors
  analysis.complexity = determineComplexity(analysis);
  analysis.estimatedDataSize = estimateDataSize(analysis);
  
  return analysis;
}

function analyzeSchemaRecursive(schema: any, analysis: SchemaAnalysis, depth: number): void {
  if (!schema || typeof schema !== 'object') return;
  
  analysis.depth = Math.max(analysis.depth, depth);
  
  // Count type occurrences
  if (schema.type) {
    const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
    analysis.typeDistribution[type] = (analysis.typeDistribution[type] || 0) + 1;
    
    if (type === 'array') analysis.hasArrays = true;
    if (type === 'object') analysis.hasNestedObjects = true;
  }
  
  // Analyze properties
  if (schema.properties) {
    const properties = Object.keys(schema.properties);
    analysis.propertyCount += properties.length;
    
    const required = schema.required || [];
    analysis.requiredProperties += required.length;
    analysis.optionalProperties += properties.length - required.length;
    
    // Recursively analyze nested properties
    properties.forEach(prop => {
      analyzeSchemaRecursive(schema.properties[prop], analysis, depth + 1);
    });
  }
  
  // Analyze array items
  if (schema.items) {
    analyzeSchemaRecursive(schema.items, analysis, depth + 1);
  }
  
  // Analyze oneOf, anyOf, allOf
  ['oneOf', 'anyOf', 'allOf'].forEach(keyword => {
    if (schema[keyword] && Array.isArray(schema[keyword])) {
      schema[keyword].forEach((subSchema: any) => {
        analyzeSchemaRecursive(subSchema, analysis, depth);
      });
    }
  });
}

function determineComplexity(analysis: SchemaAnalysis): 'simple' | 'medium' | 'complex' {
  if (analysis.depth > 4 || analysis.propertyCount > 20) return 'complex';
  if (analysis.depth > 2 || analysis.propertyCount > 8 || analysis.hasNestedObjects) return 'medium';
  return 'simple';
}

function estimateDataSize(analysis: SchemaAnalysis): 'small' | 'medium' | 'large' {
  const totalProperties = analysis.propertyCount;
  const hasArrays = analysis.hasArrays;
  
  if (totalProperties > 30 || (hasArrays && totalProperties > 15)) return 'large';
  if (totalProperties > 10 || hasArrays) return 'medium';
  return 'small';
}

// Validate JSON Schema
export function validateJsonSchema(schema: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!schema || typeof schema !== 'object') {
    errors.push('Schema must be a valid object');
    return { isValid: false, errors };
  }
  
  // Check for required root properties
  if (!schema.type && !schema.properties && !schema.items && !schema.anyOf && !schema.oneOf && !schema.allOf) {
    errors.push('Schema must have a type or define properties, items, or composition keywords');
  }
  
  // Validate type values
  if (schema.type) {
    const validTypes = ['null', 'boolean', 'object', 'array', 'number', 'integer', 'string'];
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    
    types.forEach((type: string) => {
      if (!validTypes.includes(type)) {
        errors.push(`Invalid type: ${type}`);
      }
    });
  }
  
  // Validate properties structure
  if (schema.properties && typeof schema.properties !== 'object') {
    errors.push('Properties must be an object');
  }
  
  // Validate required array
  if (schema.required && !Array.isArray(schema.required)) {
    errors.push('Required must be an array');
  }
  
  // Check for circular references (basic check)
  if (hasCircularReferences(schema)) {
    errors.push('Schema contains circular references');
  }
  
  return { isValid: errors.length === 0, errors };
}

function hasCircularReferences(schema: any, visited = new Set()): boolean {
  if (visited.has(schema)) return true;
  if (!schema || typeof schema !== 'object') return false;
  
  visited.add(schema);
  
  if (schema.properties) {
    for (const prop of Object.values(schema.properties)) {
      if (hasCircularReferences(prop, new Set(visited))) return true;
    }
  }
  
  if (schema.items && hasCircularReferences(schema.items, new Set(visited))) {
    return true;
  }
  
  return false;
}

// Extract metadata from schema
export function extractSchemaMetadata(schema: any): SchemaMetadata {
  const metadata: SchemaMetadata = {};
  
  if (schema.title) metadata.title = schema.title;
  if (schema.description) metadata.description = schema.description;
  if (schema.version) metadata.version = schema.version;
  if (schema.examples) metadata.examples = schema.examples;
  if (schema.deprecated) metadata.deprecated = schema.deprecated;
  if (schema.readOnly) metadata.readOnly = schema.readOnly;
  if (schema.writeOnly) metadata.writeOnly = schema.writeOnly;
  
  // Extract custom tags if present
  if (schema['x-tags'] || schema.tags) {
    metadata.tags = schema['x-tags'] || schema.tags;
  }
  
  return metadata;
}

// Generate schema summary
export function generateSchemaSummary(schema: any): string {
  const analysis = analyzeSchema(schema);
  const metadata = extractSchemaMetadata(schema);
  
  const parts = [];
  
  if (metadata.title) {
    parts.push(`${metadata.title}`);
  }
  
  parts.push(`${analysis.complexity} schema`);
  parts.push(`${analysis.propertyCount} properties`);
  
  if (analysis.depth > 1) {
    parts.push(`${analysis.depth} levels deep`);
  }
  
  if (analysis.hasArrays) {
    parts.push('contains arrays');
  }
  
  if (analysis.hasNestedObjects) {
    parts.push('nested objects');
  }
  
  return parts.join(', ');
}

// Compare two schemas for similarity
export function compareSchemas(schemaA: any, schemaB: any): { 
  similarity: number; 
  commonProperties: string[]; 
  uniqueToA: string[]; 
  uniqueToB: string[] 
} {
  const propsA = extractAllPropertyPaths(schemaA);
  const propsB = extractAllPropertyPaths(schemaB);
  
  const commonProperties = propsA.filter(prop => propsB.includes(prop));
  const uniqueToA = propsA.filter(prop => !propsB.includes(prop));
  const uniqueToB = propsB.filter(prop => !propsA.includes(prop));
  
  const totalUnique = propsA.length + propsB.length;
  const similarity = totalUnique > 0 ? (commonProperties.length * 2) / totalUnique : 1;
  
  return {
    similarity,
    commonProperties,
    uniqueToA,
    uniqueToB
  };
}

function extractAllPropertyPaths(schema: any, path = ''): string[] {
  const paths: string[] = [];
  
  if (!schema || typeof schema !== 'object') return paths;
  
  if (schema.properties) {
    Object.keys(schema.properties).forEach(prop => {
      const fullPath = path ? `${path}.${prop}` : prop;
      paths.push(fullPath);
      paths.push(...extractAllPropertyPaths(schema.properties[prop], fullPath));
    });
  }
  
  if (schema.items) {
    const itemPath = path ? `${path}[]` : '[]';
    paths.push(...extractAllPropertyPaths(schema.items, itemPath));
  }
  
  return paths;
}

// Optimize schema by removing unnecessary properties
export function optimizeSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema;
  
  const optimized = { ...schema };
  
  // Remove empty descriptions
  if (optimized.description === '') {
    delete optimized.description;
  }
  
  // Remove redundant type arrays with single values
  if (Array.isArray(optimized.type) && optimized.type.length === 1) {
    optimized.type = optimized.type[0];
  }
  
  // Remove empty required arrays
  if (Array.isArray(optimized.required) && optimized.required.length === 0) {
    delete optimized.required;
  }
  
  // Recursively optimize nested schemas
  if (optimized.properties) {
    optimized.properties = Object.fromEntries(
      Object.entries(optimized.properties).map(([key, value]) => [
        key,
        optimizeSchema(value)
      ])
    );
  }
  
  if (optimized.items) {
    optimized.items = optimizeSchema(optimized.items);
  }
  
  return optimized;
}

// Transform schema for different use cases
export function transformSchema(schema: any, transformations: {
  makeAllOptional?: boolean;
  makeAllRequired?: boolean;
  removeDescriptions?: boolean;
  removeExamples?: boolean;
  addDefaults?: boolean;
}): any {
  if (!schema || typeof schema !== 'object') return schema;
  
  const transformed = { ...schema };
  
  if (transformations.makeAllOptional) {
    delete transformed.required;
  }
  
  if (transformations.makeAllRequired && transformed.properties) {
    transformed.required = Object.keys(transformed.properties);
  }
  
  if (transformations.removeDescriptions) {
    delete transformed.description;
  }
  
  if (transformations.removeExamples) {
    delete transformed.examples;
    delete transformed.example;
  }
  
  if (transformations.addDefaults && !transformed.default) {
    transformed.default = generateDefaultValue(transformed);
  }
  
  // Recursively transform nested schemas
  if (transformed.properties) {
    transformed.properties = Object.fromEntries(
      Object.entries(transformed.properties).map(([key, value]) => [
        key,
        transformSchema(value, transformations)
      ])
    );
  }
  
  if (transformed.items) {
    transformed.items = transformSchema(transformed.items, transformations);
  }
  
  return transformed;
}

function generateDefaultValue(schema: any): any {
  if (schema.default !== undefined) return schema.default;
  if (schema.const !== undefined) return schema.const;
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];
  
  switch (schema.type) {
    case 'null': return null;
    case 'boolean': return false;
    case 'integer':
    case 'number': return 0;
    case 'string': return '';
    case 'array': return [];
    case 'object': return {};
    default: return null;
  }
}

// Utility to check if schema supports a specific feature
export function schemaSupportsFeature(schema: any, feature: string): boolean {
  const features: Record<string, () => boolean> = {
    nullable: () => schema.type === 'null' || (Array.isArray(schema.type) && schema.type.includes('null')),
    arrays: () => schema.type === 'array' || hasArraysRecursively(schema),
    objects: () => schema.type === 'object' || hasObjectsRecursively(schema),
    enums: () => !!schema.enum || hasEnumsRecursively(schema),
    formats: () => !!schema.format || hasFormatsRecursively(schema),
    references: () => !!schema.$ref || hasReferencesRecursively(schema)
  };
  
  return features[feature]?.() || false;
}

function hasArraysRecursively(schema: any): boolean {
  if (schema.type === 'array') return true;
  if (schema.properties) {
    return Object.values(schema.properties).some((prop: any) => hasArraysRecursively(prop));
  }
  return false;
}

function hasObjectsRecursively(schema: any): boolean {
  if (schema.type === 'object') return true;
  if (schema.properties) {
    return Object.values(schema.properties).some((prop: any) => hasObjectsRecursively(prop));
  }
  return false;
}

function hasEnumsRecursively(schema: any): boolean {
  if (schema.enum) return true;
  if (schema.properties) {
    return Object.values(schema.properties).some((prop: any) => hasEnumsRecursively(prop));
  }
  return false;
}

function hasFormatsRecursively(schema: any): boolean {
  if (schema.format) return true;
  if (schema.properties) {
    return Object.values(schema.properties).some((prop: any) => hasFormatsRecursively(prop));
  }
  return false;
}

function hasReferencesRecursively(schema: any): boolean {
  if (schema.$ref) return true;
  if (schema.properties) {
    return Object.values(schema.properties).some((prop: any) => hasReferencesRecursively(prop));
  }
  return false;
}