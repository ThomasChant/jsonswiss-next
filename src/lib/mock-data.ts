export interface MockDataOptions {
  arrayCount?: number;
  seed?: number;
  locale?: string;
  fillProperties?: boolean;
  optionalsProbability?: number;
}

export class MockDataGenerator {
  private options: Required<MockDataOptions>;
  private random: () => number;

  constructor(options: MockDataOptions = {}) {
    this.options = {
      arrayCount: options.arrayCount ?? 3,
      seed: options.seed ?? Math.floor(Math.random() * 10000),
      locale: options.locale ?? 'en',
      fillProperties: options.fillProperties ?? true,
      optionalsProbability: options.optionalsProbability ?? 0.8,
    };

    // Simple seeded random number generator for deterministic results
    let seedValue = this.options.seed;
    this.random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
  }

  generateFromSchema(schema: any): any {
    if (!schema || typeof schema !== 'object') {
      throw new Error('Invalid schema provided');
    }

    return this.generateValue(schema);
  }

  private generateValue(schema: any): any {
    // Handle schema references
    if (schema.$ref) {
      throw new Error('Schema references ($ref) are not supported in this implementation');
    }

    // Handle anyOf, oneOf, allOf
    if (schema.anyOf || schema.oneOf) {
      const options = schema.anyOf || schema.oneOf;
      const selectedSchema = options[Math.floor(this.random() * options.length)];
      return this.generateValue(selectedSchema);
    }

    if (schema.allOf) {
      // Merge all schemas for allOf
      const mergedSchema = schema.allOf.reduce((acc: any, subSchema: any) => {
        return { ...acc, ...subSchema };
      }, {});
      return this.generateValue(mergedSchema);
    }

    // Handle enum values
    if (schema.enum && Array.isArray(schema.enum)) {
      return schema.enum[Math.floor(this.random() * schema.enum.length)];
    }

    // Handle const values
    if (schema.const !== undefined) {
      return schema.const;
    }

    // Generate based on type
    const type = schema.type || this.inferType(schema);
    
    switch (type) {
      case 'null':
        return null;
      case 'boolean':
        return this.generateBoolean(schema);
      case 'integer':
      case 'number':
        return this.generateNumber(schema);
      case 'string':
        return this.generateString(schema);
      case 'array':
        return this.generateArray(schema);
      case 'object':
        return this.generateObject(schema);
      default:
        return null;
    }
  }

  private inferType(schema: any): string {
    if (schema.properties || schema.additionalProperties) return 'object';
    if (schema.items) return 'array';
    if (schema.format) return 'string';
    if (schema.minimum !== undefined || schema.maximum !== undefined) return 'number';
    return 'string';
  }

  private generateBoolean(schema: any): boolean {
    return this.random() < 0.5;
  }

  private generateNumber(schema: any): number {
    const min = schema.minimum ?? (schema.type === 'integer' ? 0 : 0);
    const max = schema.maximum ?? (schema.type === 'integer' ? 100 : 100);
    const multipleOf = schema.multipleOf ?? 1;

    let value = min + this.random() * (max - min);
    
    if (schema.type === 'integer') {
      value = Math.floor(value);
    }

    if (multipleOf !== 1) {
      value = Math.floor(value / multipleOf) * multipleOf;
    }

    return Math.max(min, Math.min(max, value));
  }

  private generateString(schema: any): string {
    const format = schema.format;
    const minLength = schema.minLength ?? 1;
    const maxLength = schema.maxLength ?? 50;

    // Handle specific formats
    switch (format) {
      case 'email':
        return this.generateEmail();
      case 'date':
        return this.generateDate();
      case 'date-time':
        return this.generateDateTime();
      case 'time':
        return this.generateTime();
      case 'uri':
      case 'url':
        return this.generateUrl();
      case 'uuid':
        return this.generateUuid();
      case 'ipv4':
        return this.generateIpv4();
      case 'ipv6':
        return this.generateIpv6();
      case 'hostname':
        return this.generateHostname();
      case 'phone':
        return this.generatePhone();
      default:
        return this.generateRandomString(minLength, maxLength, schema.pattern);
    }
  }

  private generateArray(schema: any): any[] {
    const minItems = schema.minItems ?? 1;
    const maxItems = schema.maxItems ?? this.options.arrayCount;
    const itemCount = minItems + Math.floor(this.random() * (maxItems - minItems + 1));

    const items: any[] = [];
    const itemSchema = schema.items || {};

    for (let i = 0; i < itemCount; i++) {
      items.push(this.generateValue(itemSchema));
    }

    return items;
  }

  private generateObject(schema: any): any {
    const obj: any = {};
    const properties = schema.properties || {};
    const required = schema.required || [];
    const additionalProperties = schema.additionalProperties;

    // Generate required properties
    required.forEach((propName: string) => {
      if (properties[propName]) {
        obj[propName] = this.generateValue(properties[propName]);
      }
    });

    // Generate optional properties
    Object.keys(properties).forEach(propName => {
      if (!required.includes(propName)) {
        if (this.random() < this.options.optionalsProbability) {
          obj[propName] = this.generateValue(properties[propName]);
        }
      }
    });

    // Handle additionalProperties
    if (additionalProperties === true || (typeof additionalProperties === 'object')) {
      const additionalCount = Math.floor(this.random() * 3);
      for (let i = 0; i < additionalCount; i++) {
        const propName = `additional_${i}`;
        if (additionalProperties === true) {
          obj[propName] = this.generateRandomValue();
        } else {
          obj[propName] = this.generateValue(additionalProperties);
        }
      }
    }

    return obj;
  }

  private generateRandomValue(): any {
    const types = ['string', 'number', 'boolean', 'null'];
    const type = types[Math.floor(this.random() * types.length)];
    
    switch (type) {
      case 'string':
        return this.generateRandomString(5, 20);
      case 'number':
        return Math.floor(this.random() * 1000);
      case 'boolean':
        return this.random() < 0.5;
      case 'null':
        return null;
      default:
        return null;
    }
  }

  // Format-specific generators
  private generateEmail(): string {
    const domains = ['example.com', 'test.org', 'demo.net', 'sample.io'];
    const usernames = ['user', 'john', 'jane', 'admin', 'test', 'demo'];
    
    const username = usernames[Math.floor(this.random() * usernames.length)];
    const domain = domains[Math.floor(this.random() * domains.length)];
    const suffix = Math.floor(this.random() * 1000);
    
    return `${username}${suffix}@${domain}`;
  }

  private generateDate(): string {
    const start = new Date(2020, 0, 1);
    const end = new Date(2024, 11, 31);
    const randomTime = start.getTime() + this.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString().split('T')[0];
  }

  private generateDateTime(): string {
    const start = new Date(2020, 0, 1);
    const end = new Date(2024, 11, 31);
    const randomTime = start.getTime() + this.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString();
  }

  private generateTime(): string {
    const hours = Math.floor(this.random() * 24).toString().padStart(2, '0');
    const minutes = Math.floor(this.random() * 60).toString().padStart(2, '0');
    const seconds = Math.floor(this.random() * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  private generateUrl(): string {
    const protocols = ['http', 'https'];
    const domains = ['example.com', 'test.org', 'demo.net', 'api.sample.io'];
    const paths = ['', '/api', '/v1', '/data', '/users', '/products'];
    
    const protocol = protocols[Math.floor(this.random() * protocols.length)];
    const domain = domains[Math.floor(this.random() * domains.length)];
    const path = paths[Math.floor(this.random() * paths.length)];
    
    return `${protocol}://${domain}${path}`;
  }

  private generateUuid(): string {
    const hex = '0123456789abcdef';
    let uuid = '';
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else if (i === 14) {
        uuid += '4';
      } else if (i === 19) {
        uuid += hex[(Math.floor(this.random() * 4) + 8)];
      } else {
        uuid += hex[Math.floor(this.random() * 16)];
      }
    }
    return uuid;
  }

  private generateIpv4(): string {
    const octets = [];
    for (let i = 0; i < 4; i++) {
      octets.push(Math.floor(this.random() * 256));
    }
    return octets.join('.');
  }

  private generateIpv6(): string {
    const segments = [];
    for (let i = 0; i < 8; i++) {
      segments.push(Math.floor(this.random() * 65536).toString(16).padStart(4, '0'));
    }
    return segments.join(':');
  }

  private generateHostname(): string {
    const domains = ['example.com', 'test.org', 'demo.net', 'sample.io'];
    const subdomains = ['www', 'api', 'app', 'cdn', 'mail'];
    
    const subdomain = subdomains[Math.floor(this.random() * subdomains.length)];
    const domain = domains[Math.floor(this.random() * domains.length)];
    
    return `${subdomain}.${domain}`;
  }

  private generatePhone(): string {
    const areaCodes = ['555', '123', '456', '789'];
    const areaCode = areaCodes[Math.floor(this.random() * areaCodes.length)];
    const exchange = Math.floor(this.random() * 900) + 100;
    const number = Math.floor(this.random() * 9000) + 1000;
    
    return `+1-${areaCode}-${exchange}-${number}`;
  }

  private generateRandomString(minLength: number, maxLength: number, pattern?: string): string {
    const length = minLength + Math.floor(this.random() * (maxLength - minLength + 1));
    
    if (pattern) {
      // Simple pattern handling - just generate random string for now
      // A full regex-to-string generator would be complex
      return this.generateSimpleRandomString(length);
    }
    
    return this.generateSimpleRandomString(length);
  }

  private generateSimpleRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(this.random() * chars.length)];
    }
    return result;
  }
}

// Helper functions for common data patterns
export const mockDataPatterns = {
  names: {
    first: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Lisa', 'Robert', 'Maria'],
    last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
  },
  
  addresses: {
    streets: ['Main St', 'Oak Ave', 'Elm Dr', 'Park Blvd', 'First Ave', 'Second St', 'Third Ave', 'Fourth St'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
    states: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC']
  },
  
  companies: ['Tech Corp', 'Data Systems', 'Global Solutions', 'Innovation Labs', 'Digital Works', 'Smart Technologies'],
  
  products: ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Monitor', 'Keyboard', 'Mouse', 'Camera', 'Printer', 'Speaker']
};

// Convenience function to generate mock data
export function generateMockData(schema: any, options?: MockDataOptions): any {
  const generator = new MockDataGenerator(options);
  return generator.generateFromSchema(schema);
}

// Function to validate schema before generation
export function validateSchemaForMockGeneration(schema: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!schema || typeof schema !== 'object') {
    errors.push('Schema must be a valid object');
    return { isValid: false, errors };
  }
  
  // Check for unsupported features
  if (hasUnsupportedFeatures(schema)) {
    errors.push('Schema contains unsupported features like $ref, dependencies, or complex conditionals');
  }
  
  // Check for infinite recursion potential
  if (hasInfiniteRecursion(schema)) {
    errors.push('Schema may cause infinite recursion');
  }
  
  return { isValid: errors.length === 0, errors };
}

function hasUnsupportedFeatures(schema: any, visited = new Set()): boolean {
  if (visited.has(schema)) return false;
  visited.add(schema);
  
  if (schema.$ref || schema.dependencies || schema.if || schema.then || schema.else) {
    return true;
  }
  
  if (schema.properties) {
    for (const prop of Object.values(schema.properties)) {
      if (hasUnsupportedFeatures(prop, visited)) return true;
    }
  }
  
  if (schema.items && hasUnsupportedFeatures(schema.items, visited)) {
    return true;
  }
  
  return false;
}

function hasInfiniteRecursion(schema: any, depth = 0): boolean {
  if (depth > 10) return true; // Arbitrary depth limit
  
  if (schema.properties) {
    for (const prop of Object.values(schema.properties)) {
      if (hasInfiniteRecursion(prop, depth + 1)) return true;
    }
  }
  
  if (schema.items && hasInfiniteRecursion(schema.items, depth + 1)) {
    return true;
  }
  
  return false;
}