// Converter reverse mappings - defines the reverse conversion for each converter
export interface ReverseConverterInfo {
  path: string;
  title: string;
  description: string;
}

export const CONVERTER_REVERSE_MAPPINGS: Record<string, ReverseConverterInfo> = {
  // CSV conversions
  'csv-to-json': {
    path: '/converter/json-to-csv',
    title: 'JSON to CSV Converter',
    description: 'Convert JSON data to CSV format'
  },
  'json-to-csv': {
    path: '/converter/csv-to-json',
    title: 'CSV to JSON Converter',
    description: 'Convert CSV data to JSON format'
  },

  // Dictionary conversions
  'dict-to-json': {
    path: '/converter/json-to-dict',
    title: 'JSON to Dict Converter',
    description: 'Convert JSON data to Python dictionary format'
  },
  'json-to-dict': {
    path: '/converter/dict-to-json',
    title: 'Dict to JSON Converter',
    description: 'Convert Python dictionary to JSON format'
  },

  // Excel conversions
  'excel-to-json': {
    path: '/converter/json-to-excel',
    title: 'JSON to Excel Converter',
    description: 'Convert JSON data to Excel format'
  },
  'json-to-excel': {
    path: '/converter/excel-to-json',
    title: 'Excel to JSON Converter',
    description: 'Convert Excel data to JSON format'
  },

  // INI conversions
  'ini-to-json': {
    path: '/converter/json-to-ini',
    title: 'JSON to INI Converter',
    description: 'Convert JSON data to INI configuration format'
  },
  'json-to-ini': {
    path: '/converter/ini-to-json',
    title: 'INI to JSON Converter',
    description: 'Convert INI configuration to JSON format'
  },

  // Properties conversions
  'properties-to-json': {
    path: '/converter/json-to-properties',
    title: 'JSON to Properties Converter',
    description: 'Convert JSON data to Java properties format'
  },
  'json-to-properties': {
    path: '/converter/properties-to-json',
    title: 'Properties to JSON Converter',
    description: 'Convert Java properties to JSON format'
  },

  // SQL conversions
  'sql-to-json': {
    path: '/converter/json-to-sql',
    title: 'JSON to SQL Converter',
    description: 'Convert JSON data to SQL format'
  },
  'json-to-sql': {
    path: '/converter/sql-to-json',
    title: 'SQL to JSON Converter',
    description: 'Convert SQL data to JSON format'
  },

  // TOML conversions
  'toml-to-json': {
    path: '/converter/json-to-toml',
    title: 'JSON to TOML Converter',
    description: 'Convert JSON data to TOML configuration format'
  },
  'json-to-toml': {
    path: '/converter/toml-to-json',
    title: 'TOML to JSON Converter',
    description: 'Convert TOML configuration to JSON format'
  },

  // XML conversions
  'xml-to-json': {
    path: '/converter/json-to-xml',
    title: 'JSON to XML Converter',
    description: 'Convert JSON data to XML format'
  },
  'json-to-xml': {
    path: '/converter/xml-to-json',
    title: 'XML to JSON Converter',
    description: 'Convert XML data to JSON format'
  },

  // YAML conversions
  'yaml-to-json': {
    path: '/converter/json-to-yaml',
    title: 'JSON to YAML Converter',
    description: 'Convert JSON data to YAML format'
  },
  'json-to-yaml': {
    path: '/converter/yaml-to-json',
    title: 'YAML to JSON Converter',
    description: 'Convert YAML data to JSON format'
  },

  // JAR conversions (no reverse for this one)
  'jar-to-json': {
    path: '/converter/json-to-csv', // Fallback to a common converter
    title: 'JSON to CSV Converter',
    description: 'Convert JSON data to CSV format'
  }
};

// Helper function to get reverse converter info
export function getReverseConverterInfo(currentPath: string): ReverseConverterInfo | null {
  // Extract the converter name from the path (e.g., '/converter/csv-to-json' -> 'csv-to-json')
  const pathParts = currentPath.split('/');
  const converterName = pathParts[pathParts.length - 1];
  
  return CONVERTER_REVERSE_MAPPINGS[converterName] || null;
}

// Helper function to check if a converter has a reverse
export function hasReverseConverter(currentPath: string): boolean {
  return getReverseConverterInfo(currentPath) !== null;
}

