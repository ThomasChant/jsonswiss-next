import * as XLSX from 'xlsx';

// Excel to JSON converter
export interface ExcelToJsonOptions {
  sheetIndex?: number;
  sheetName?: string;
  hasHeaders?: boolean;
  range?: string;
}

export interface ExcelMetadata {
  sheetNames: string[];
  selectedSheet: string;
  rowCount: number;
  columnCount: number;
}

export function excelToJson(arrayBuffer: ArrayBuffer, options: ExcelToJsonOptions = {}): {
  data: any[];
  metadata: ExcelMetadata;
} {
  const { sheetIndex = 0, hasHeaders = true, range } = options;
  
  try {
    // Read the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    if (workbook.SheetNames.length === 0) {
      throw new Error('Excel file contains no sheets');
    }
    
    // Get the target sheet
    let targetSheetName: string;
    if (options.sheetName && workbook.SheetNames.includes(options.sheetName)) {
      targetSheetName = options.sheetName;
    } else if (sheetIndex >= 0 && sheetIndex < workbook.SheetNames.length) {
      targetSheetName = workbook.SheetNames[sheetIndex];
    } else {
      targetSheetName = workbook.SheetNames[0];
    }
    
    const worksheet = workbook.Sheets[targetSheetName];
    
    if (!worksheet) {
      throw new Error(`Sheet "${targetSheetName}" not found`);
    }
    
    // Convert sheet to JSON
    const jsonOptions: XLSX.Sheet2JSONOpts = {
      header: hasHeaders ? 1 : undefined,
      defval: null,
      blankrows: false,
    };
    
    if (range) {
      jsonOptions.range = range;
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, jsonOptions);
    
    // Get sheet info for metadata
    const sheetRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const rowCount = sheetRange.e.r - sheetRange.s.r + 1;
    const columnCount = sheetRange.e.c - sheetRange.s.c + 1;
    
    const metadata: ExcelMetadata = {
      sheetNames: workbook.SheetNames,
      selectedSheet: targetSheetName,
      rowCount,
      columnCount,
    };
    
    return {
      data: jsonData,
      metadata,
    };
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to flatten nested objects for better Excel representation
function flattenObject(obj: any, prefix: string = '', separator: string = '.'): any {
  const flattened: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      const value = obj[key];
      
      if (value === null || value === undefined) {
        flattened[newKey] = value;
      } else if (Array.isArray(value)) {
        // Handle arrays - convert to readable format
        if (value.length === 0) {
          flattened[newKey] = '[]';
        } else if (value.every(item => typeof item !== 'object' || item === null)) {
          // Array of primitives - join with commas
          flattened[newKey] = value.join(', ');
        } else {
          // Array of objects - flatten each object with index
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              const subFlattened = flattenObject(item, `${newKey}[${index}]`, separator);
              Object.assign(flattened, subFlattened);
            } else {
              flattened[`${newKey}[${index}]`] = item;
            }
          });
        }
      } else if (typeof value === 'object') {
        // Nested object - flatten recursively
        const subFlattened = flattenObject(value, newKey, separator);
        Object.assign(flattened, subFlattened);
      } else {
        // Primitive value
        flattened[newKey] = value;
      }
    }
  }
  
  return flattened;
}

// JSON to Excel converter
export interface JsonToExcelOptions {
  sheetName?: string;
  includeHeaders?: boolean;
  bookType?: XLSX.BookType;
  flattenData?: boolean;
}

export function jsonToExcel(jsonData: any, options: JsonToExcelOptions = {}): ArrayBuffer {
  const { sheetName = 'Sheet1', includeHeaders = true, bookType = 'xlsx', flattenData = true } = options;
  
  try {
    let data: any[];
    
    // Handle different input types
    if (Array.isArray(jsonData)) {
      data = jsonData;
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      // Smart detection: if object contains only one array property, use that array
      const keys = Object.keys(jsonData);
      if (keys.length === 1 && Array.isArray(jsonData[keys[0]])) {
        data = jsonData[keys[0]];
      } else {
        // Convert single object to array
        data = [jsonData];
      }
    } else {
      throw new Error('Data must be an object or array of objects');
    }
    
    if (data.length === 0) {
      throw new Error('Data array cannot be empty');
    }
    
    // Check if all items are primitive values (not objects)
    const allPrimitive = data.every(item => typeof item !== 'object' || item === null);
    
    // Process data based on flattenData option
    const processedData = allPrimitive
      ? data.map(item => ({ value: item })) // Use consistent column name for primitive arrays
      : flattenData 
        ? data.map((item, index) => {
            if (typeof item !== 'object' || item === null) {
              return { [`value_${index}`]: item };
            }
            return flattenObject(item);
          })
        : data.map((item, index) => {
            if (typeof item !== 'object' || item === null) {
              return { [`value_${index}`]: item };
            }
            // For nested data without flattening, convert complex values to JSON strings
            const processedItem: any = {};
            for (const [key, value] of Object.entries(item)) {
              if (typeof value === 'object' && value !== null) {
                processedItem[key] = JSON.stringify(value);
              } else {
                processedItem[key] = value;
              }
            }
            return processedItem;
          });
    
    // Create worksheet from JSON
    // Use skipHeader to control whether the header row is written
    const worksheet = XLSX.utils.json_to_sheet(processedData, {
      skipHeader: !includeHeaders,
    });
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file as ArrayBuffer
    const excelBuffer = XLSX.write(workbook, {
      bookType,
      type: 'array',
    });
    
    // The XLSX library returns an ArrayBuffer when type is 'array'
    return excelBuffer;
  } catch (error) {
    throw new Error(`Excel generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get sheet names from Excel file
export function getExcelSheetNames(arrayBuffer: ArrayBuffer): string[] {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    return workbook.SheetNames;
  } catch (error) {
    throw new Error(`Failed to read Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to validate Excel file
export function isValidExcelFile(arrayBuffer: ArrayBuffer): boolean {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    return workbook.SheetNames.length > 0;
  } catch {
    return false;
  }
}

// CSV to JSON converter
export function csvToJson(csvText: string, options: {
  delimiter?: string;
  hasHeader?: boolean;
  skipEmptyLines?: boolean;
}): any[] {
  const { delimiter = ',', hasHeader = true, skipEmptyLines = true } = options;
  
  const lines = csvText.split('\n').filter(line => 
    !skipEmptyLines || line.trim() !== ''
  );
  
  if (lines.length === 0) {
    return [];
  }
  
  const headers = hasHeader 
    ? parseCSVLine(lines[0], delimiter)
    : Array.from({ length: parseCSVLine(lines[0], delimiter).length }, (_, i) => `column_${i + 1}`);
  
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  return dataLines.map(line => {
    const values = parseCSVLine(line, delimiter);
    const obj: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      obj[header.trim()] = convertValue(value.trim());
    });
    
    return obj;
  });
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i - 1] === delimiter || line[i - 1] === ' ')) {
      inQuotes = true;
      i++;
      continue;
    }
    
    if (char === '"' && inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
        continue;
      } else {
        inQuotes = false;
        i++;
        continue;
      }
    }
    
    if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
      i++;
      continue;
    }
    
    current += char;
    i++;
  }
  
  result.push(current);
  return result;
}

function convertValue(value: string): any {
  if (value === '') return '';
  if (value.toLowerCase() === 'null') return null;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Try to convert to number
  const num = Number(value);
  if (!isNaN(num) && isFinite(num)) {
    return num;
  }
  
  return value;
}

// XML to JSON converter
export function xmlToJson(xmlText: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`XML parsing error: ${parseError.textContent}`);
  }
  
  return xmlElementToJson(xmlDoc.documentElement);
}

function xmlElementToJson(element: Element): any {
  const result: any = {};
  
  // Handle attributes
  if (element.attributes.length > 0) {
    result['@attributes'] = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      result['@attributes'][attr.name] = attr.value;
    }
  }
  
  // Handle child nodes
  const childNodes = Array.from(element.childNodes);
  const elementChildren = childNodes.filter(node => node.nodeType === Node.ELEMENT_NODE) as Element[];
  const textContent = childNodes
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent?.trim())
    .filter(text => text)
    .join(' ');
  
  if (elementChildren.length === 0) {
    // Leaf node - return text content or attributes
    if (textContent) {
      if (Object.keys(result).length === 0) {
        return convertValue(textContent);
      } else {
        result['#text'] = convertValue(textContent);
      }
    }
    return Object.keys(result).length === 0 ? null : result;
  }
  
  // Group children by tag name
  const childGroups: Record<string, Element[]> = {};
  elementChildren.forEach(child => {
    const tagName = child.tagName;
    if (!childGroups[tagName]) {
      childGroups[tagName] = [];
    }
    childGroups[tagName].push(child);
  });
  
  // Convert child groups
  Object.entries(childGroups).forEach(([tagName, children]) => {
    if (children.length === 1) {
      result[tagName] = xmlElementToJson(children[0]);
    } else {
      result[tagName] = children.map(child => xmlElementToJson(child));
    }
  });
  
  // Add text content if present
  if (textContent && elementChildren.length > 0) {
    result['#text'] = convertValue(textContent);
  }
  
  return result;
}

// YAML to JSON converter
export function yamlToJson(yamlText: string): any {
  // This is a simplified YAML parser - for production use, consider using a proper YAML library
  return parseYamlValue(yamlText.trim());
}

function parseYamlValue(yaml: string): any {
  yaml = yaml.trim();
  
  if (!yaml) return null;
  
  // Handle basic scalar values
  if (yaml === 'null' || yaml === '~') return null;
  if (yaml === 'true') return true;
  if (yaml === 'false') return false;
  
  // Handle quoted strings
  if ((yaml.startsWith('"') && yaml.endsWith('"')) ||
      (yaml.startsWith("'") && yaml.endsWith("'"))) {
    return yaml.slice(1, -1);
  }
  
  // Handle numbers
  const num = Number(yaml);
  if (!isNaN(num) && isFinite(num)) {
    return num;
  }
  
  // Handle arrays
  if (yaml.startsWith('- ')) {
    return parseYamlArray(yaml);
  }
  
  // Handle objects
  if (yaml.includes(':') && !yaml.startsWith('-')) {
    return parseYamlObject(yaml);
  }
  
  // Return as string
  return yaml;
}

function parseYamlArray(yaml: string): any[] {
  const lines = yaml.split('\n');
  const result: any[] = [];
  let currentItem = '';
  let currentIndent = -1;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    const indent = line.length - line.trimLeft().length;
    
    if (trimmedLine.startsWith('- ')) {
      if (currentItem) {
        result.push(parseYamlValue(currentItem.trim()));
      }
      currentItem = trimmedLine.substring(2);
      currentIndent = indent;
    } else if (indent > currentIndent && currentIndent !== -1) {
      currentItem += '\n' + line;
    } else {
      if (currentItem) {
        result.push(parseYamlValue(currentItem.trim()));
        currentItem = '';
      }
      // This line doesn't belong to the array
      break;
    }
  }
  
  if (currentItem) {
    result.push(parseYamlValue(currentItem.trim()));
  }
  
  return result;
}

function parseYamlObject(yaml: string): any {
  const lines = yaml.split('\n');
  const result: any = {};
  let currentKey = '';
  let currentValue = '';
  let currentIndent = -1;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    const indent = line.length - line.trimLeft().length;
    
    if (trimmedLine.includes(':') && !trimmedLine.startsWith('-')) {
      // Process previous key-value pair
      if (currentKey && currentValue !== '') {
        result[currentKey] = parseYamlValue(currentValue.trim());
      }
      
      const colonIndex = trimmedLine.indexOf(':');
      currentKey = trimmedLine.substring(0, colonIndex).trim();
      currentValue = trimmedLine.substring(colonIndex + 1).trim();
      currentIndent = indent;
    } else if (indent > currentIndent && currentIndent !== -1 && currentKey) {
      // Multi-line value
      if (currentValue) {
        currentValue += '\n' + line.substring(currentIndent + 2);
      } else {
        currentValue = line.substring(currentIndent + 2);
      }
    }
  }
  
  // Process the last key-value pair
  if (currentKey) {
    result[currentKey] = currentValue ? parseYamlValue(currentValue.trim()) : null;
  }
  
  return result;
}

// INI to JSON converter
export function iniToJson(iniText: string): any {
  const lines = iniText.split('\n');
  const result: any = {};
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
      continue;
    }
    
    // Section headers
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      continue;
    }
    
    // Key-value pairs
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      
      if (currentSection) {
        result[currentSection][key] = convertValue(value);
      } else {
        result[key] = convertValue(value);
      }
    }
  }
  
  return result;
}

// JSON to INI converter
export function jsonToIni(jsonData: any): string {
  let result = '';
  
  if (typeof jsonData !== 'object' || jsonData === null) {
    throw new Error('JSON data must be an object for INI conversion');
  }
  
  // Handle flat object (no sections)
  const flatKeys: string[] = [];
  const sectionKeys: string[] = [];
  
  Object.keys(jsonData).forEach(key => {
    if (typeof jsonData[key] === 'object' && jsonData[key] !== null && !Array.isArray(jsonData[key])) {
      sectionKeys.push(key);
    } else {
      flatKeys.push(key);
    }
  });
  
  // Add flat key-value pairs first
  flatKeys.forEach(key => {
    result += `${key}=${formatIniValue(jsonData[key])}\n`;
  });
  
  if (flatKeys.length > 0 && sectionKeys.length > 0) {
    result += '\n';
  }
  
  // Add sections
  sectionKeys.forEach((sectionKey, index) => {
    result += `[${sectionKey}]\n`;
    
    const section = jsonData[sectionKey];
    Object.entries(section).forEach(([key, value]) => {
      result += `${key}=${formatIniValue(value)}\n`;
    });
    
    if (index < sectionKeys.length - 1) {
      result += '\n';
    }
  });
  
  return result;
}

function formatIniValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'boolean') {
    return value.toString();
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (Array.isArray(value)) {
    return value.join(',');
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  const str = String(value);
  // Quote values that contain spaces or special characters
  if (str.includes(' ') || str.includes(';') || str.includes('#')) {
    return `"${str}"`;
  }
  
  return str;
}

// TOML to JSON converter (simplified)
export function tomlToJson(tomlText: string): any {
  const lines = tomlText.split('\n');
  const result: any = {};
  let currentSection = result;
  let currentSectionPath: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Section headers [section] or [[array.section]]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const sectionContent = trimmed.slice(1, -1);
      
      if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
        // Array of tables
        const arrayPath = sectionContent.split('.');
        currentSectionPath = arrayPath;
        
        let target = result;
        for (let i = 0; i < arrayPath.length - 1; i++) {
          if (!target[arrayPath[i]]) target[arrayPath[i]] = {};
          target = target[arrayPath[i]];
        }
        
        const lastKey = arrayPath[arrayPath.length - 1];
        if (!target[lastKey]) target[lastKey] = [];
        const newSection = {};
        target[lastKey].push(newSection);
        currentSection = newSection;
      } else {
        // Regular section
        const sectionPath = sectionContent.split('.');
        currentSectionPath = sectionPath;
        
        let target = result;
        for (const key of sectionPath) {
          if (!target[key]) target[key] = {};
          target = target[key];
        }
        currentSection = target;
      }
      continue;
    }
    
    // Key-value pairs
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      
      currentSection[key] = parseTOMLValue(value);
    }
  }
  
  return result;
}

function parseTOMLValue(value: string): any {
  value = value.trim();
  
  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // String (quoted)
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Array
  if (value.startsWith('[') && value.endsWith(']')) {
    const arrayContent = value.slice(1, -1).trim();
    if (!arrayContent) return [];
    
    return arrayContent.split(',').map(item => parseTOMLValue(item.trim()));
  }
  
  // Number
  const num = Number(value);
  if (!isNaN(num) && isFinite(num)) {
    return num;
  }
  
  // ISO 8601 date (basic detection)
  if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    return new Date(value);
  }
  
  // Unquoted string
  return value;
}

// JSON to TOML converter
export function jsonToToml(jsonData: any): string {
  let result = '';
  
  if (typeof jsonData !== 'object' || jsonData === null) {
    throw new Error('JSON data must be an object for TOML conversion');
  }
  
  // Add flat key-value pairs first
  const flatKeys: string[] = [];
  const sectionKeys: string[] = [];
  
  Object.keys(jsonData).forEach(key => {
    if (typeof jsonData[key] === 'object' && jsonData[key] !== null && !Array.isArray(jsonData[key])) {
      sectionKeys.push(key);
    } else {
      flatKeys.push(key);
    }
  });
  
  flatKeys.forEach(key => {
    result += `${key} = ${formatTOMLValue(jsonData[key])}\n`;
  });
  
  if (flatKeys.length > 0 && sectionKeys.length > 0) {
    result += '\n';
  }
  
  // Add sections
  sectionKeys.forEach((sectionKey, index) => {
    result += `[${sectionKey}]\n`;
    
    const section = jsonData[sectionKey];
    Object.entries(section).forEach(([key, value]) => {
      result += `${key} = ${formatTOMLValue(value)}\n`;
    });
    
    if (index < sectionKeys.length - 1) {
      result += '\n';
    }
  });
  
  return result;
}

function formatTOMLValue(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  
  if (typeof value === 'boolean') {
    return value.toString();
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (Array.isArray(value)) {
    const items = value.map(item => formatTOMLValue(item));
    return `[${items.join(', ')}]`;
  }
  
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  if (typeof value === 'object') {
    // Inline table (simplified)
    const pairs = Object.entries(value).map(([k, v]) => `${k} = ${formatTOMLValue(v)}`);
    return `{ ${pairs.join(', ')} }`;
  }
  
  // String - add quotes if needed
  const str = String(value);
  if (str.includes(' ') || str.includes('#') || str.includes('"') || str.includes("'")) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  
  return str;
}

// Dict (Python-style) to JSON converter
export function dictToJson(dictText: string): any {
  // Remove Python dict syntax and convert to JSON-like format
  let cleaned = dictText.trim();
  
  // Handle Python-style None, True, False
  cleaned = cleaned.replace(/\bNone\b/g, 'null');
  cleaned = cleaned.replace(/\bTrue\b/g, 'true');
  cleaned = cleaned.replace(/\bFalse\b/g, 'false');
  
  // Handle Python single quotes to double quotes
  cleaned = cleaned.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
  
  // Handle Python tuple syntax (convert to arrays)
  cleaned = cleaned.replace(/\(([^)]*)\)/g, '[$1]');
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Invalid Python dict format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// JSON to Dict (Python-style) converter
export function jsonToDict(jsonData: any): string {
  return formatPythonValue(jsonData);
}

function formatPythonValue(value: any): string {
  if (value === null || value === undefined) {
    return 'None';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'string') {
    // Use single quotes for Python strings
    return `'${value.replace(/'/g, "\\'")}'`;
  }
  
  if (Array.isArray(value)) {
    const items = value.map(item => formatPythonValue(item));
    return `[${items.join(', ')}]`;
  }
  
  if (typeof value === 'object') {
    const pairs = Object.entries(value).map(([key, val]) => {
      return `'${key}': ${formatPythonValue(val)}`;
    });
    return `{${pairs.join(', ')}}`;
  }
  
  return String(value);
}

// SQL INSERT statements to JSON converter
export function sqlToJson(sqlText: string): any[] {
  const result: any[] = [];
  
  // Extract INSERT statements
  const insertRegex = /INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s+VALUES\s*\((.*?)\)/gi;
  let match;
  
  while ((match = insertRegex.exec(sqlText)) !== null) {
    const tableName = match[1];
    const columns = match[2].split(',').map(col => col.trim().replace(/[`"'\[\]]/g, ''));
    const values = match[3].split(',').map(val => val.trim());
    
    const record: any = { _table: tableName };
    
    columns.forEach((column, index) => {
      if (values[index]) {
        record[column] = parseSQLValue(values[index]);
      }
    });
    
    result.push(record);
  }
  
  return result;
}

function parseSQLValue(value: string): any {
  value = value.trim();
  
  // NULL
  if (value.toUpperCase() === 'NULL') {
    return null;
  }
  
  // String (quoted)
  if ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1).replace(/''/g, "'").replace(/""/g, '"');
  }
  
  // Number
  const num = Number(value);
  if (!isNaN(num) && isFinite(num)) {
    return num;
  }
  
  // Boolean
  if (value.toUpperCase() === 'TRUE') return true;
  if (value.toUpperCase() === 'FALSE') return false;
  
  return value;
}

// JSON to SQL INSERT statements converter
export function jsonToSql(jsonData: any[], options: {
  tableName?: string;
  includeCreate?: boolean;
  dialect?: 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver' | 'oracle';
} = {}): string {
  const { tableName = 'data_table', includeCreate = false, dialect = 'mysql' } = options;
  
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return '';
  }
  
  // Get all unique column names
  const allColumns = new Set<string>();
  jsonData.forEach(record => {
    if (typeof record === 'object' && record !== null) {
      Object.keys(record).forEach(key => {
        if (key !== '_table') {
          allColumns.add(key);
        }
      });
    }
  });
  
  const columns = Array.from(allColumns);
  let result = '';
  
  // Add CREATE TABLE statement if requested
  if (includeCreate) {
    result += `CREATE TABLE ${tableName} (\n`;
    result += columns.map(col => `  ${col} ${getSQLTypeForDialect(guessColumnSample(jsonData, col), dialect)}`).join(',\n');
    result += '\n);\n\n';
  }
  
  // Generate INSERT statements
  jsonData.forEach(record => {
    if (typeof record === 'object' && record !== null) {
      const currentTableName = record._table || tableName;
      const values = columns.map(col => formatSQLValue(record[col], dialect));
      
      result += `INSERT INTO ${currentTableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    }
  });
  
  return result;
}

function formatSQLValue(value: any, dialect: 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver' | 'oracle' = 'mysql'): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    if (dialect === 'sqlserver' || dialect === 'oracle' || dialect === 'sqlite') {
      return value ? '1' : '0';
    }
    return value ? 'TRUE' : 'FALSE';
  }
  
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Infer a reasonable column type for a sample value and dialect
function getSQLTypeForDialect(sample: any, dialect: 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver' | 'oracle'): string {
  if (sample === null || sample === undefined) {
    // Fallback text-like type per dialect
    switch (dialect) {
      case 'postgresql':
        return 'TEXT';
      case 'sqlserver':
        return 'NVARCHAR(MAX)';
      case 'oracle':
        return 'CLOB';
      case 'sqlite':
        return 'TEXT';
      default:
        return 'TEXT';
    }
  }
  if (typeof sample === 'boolean') {
    switch (dialect) {
      case 'postgresql':
        return 'BOOLEAN';
      case 'mysql':
        return 'BOOLEAN';
      case 'sqlserver':
        return 'BIT';
      case 'oracle':
        return 'NUMBER(1)';
      case 'sqlite':
        return 'INTEGER';
      default:
        return 'BOOLEAN';
    }
  }
  if (typeof sample === 'number') {
    return Number.isInteger(sample) ? 'INTEGER' : 'DECIMAL(10,2)';
  }
  if (typeof sample === 'string') {
    const long = sample.length > 255;
    switch (dialect) {
      case 'postgresql':
        return long ? 'TEXT' : 'VARCHAR(255)';
      case 'mysql':
        return long ? 'TEXT' : 'VARCHAR(255)';
      case 'sqlserver':
        return long ? 'NVARCHAR(MAX)' : 'NVARCHAR(255)';
      case 'oracle':
        return long ? 'CLOB' : 'VARCHAR2(255)';
      case 'sqlite':
        return 'TEXT';
      default:
        return long ? 'TEXT' : 'VARCHAR(255)';
    }
  }
  // arrays/objects -> JSON where available
  if (Array.isArray(sample) || typeof sample === 'object') {
    switch (dialect) {
      case 'postgresql':
      case 'mysql':
        return 'JSON';
      case 'sqlserver':
        return 'NVARCHAR(MAX)';
      case 'oracle':
        return 'CLOB';
      case 'sqlite':
        return 'TEXT';
      default:
        return 'TEXT';
    }
  }
  return 'TEXT';
}

// Try to find a representative sample value for a column
function guessColumnSample(rows: any[], column: string): any {
  for (const r of rows) {
    if (r && typeof r === 'object' && column in r && r[column] != null) {
      return r[column];
    }
  }
  return null;
}

// Utility function to detect file format
export function detectFormat(content: string): 'json' | 'csv' | 'xml' | 'yaml' | 'ini' | 'toml' | 'dict' | 'sql' | 'properties' | 'unknown' {
  content = content.trim();
  
  if (!content) return 'unknown';
  
  // JSON detection
  if ((content.startsWith('{') && content.endsWith('}')) ||
      (content.startsWith('[') && content.endsWith(']'))) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // Not valid JSON, continue checking
    }
  }
  
  // XML detection
  if (content.startsWith('<?xml') || content.startsWith('<')) {
    return 'xml';
  }
  
  // CSV detection (simple heuristic)
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length > 1) {
    const firstLine = lines[0];
    const hasCommas = firstLine.includes(',');
    const hasSemicolons = firstLine.includes(';');
    const hasTabs = firstLine.includes('\t');
    
    if (hasCommas || hasSemicolons || hasTabs) {
      // Check if other lines have similar structure
      const delimiter = hasCommas ? ',' : hasSemicolons ? ';' : '\t';
      const firstLineFields = firstLine.split(delimiter).length;
      const consistentFieldCount = lines.slice(1, Math.min(5, lines.length)).every(line =>
        line.split(delimiter).length === firstLineFields
      );
      
      if (consistentFieldCount) {
        return 'csv';
      }
    }
  }
  
  // YAML detection
  if (content.includes(':') && (content.includes('- ') || content.match(/^\s*\w+:/m))) {
    return 'yaml';
  }
  
  // INI detection
  if (content.includes('=') && (content.includes('[') || content.match(/^\s*\w+\s*=/m))) {
    const hasSection = content.includes('[') && content.includes(']');
    const hasKeyValue = content.match(/^\s*\w+\s*=.+/m);
    if (hasSection) {
      return 'ini';
    } else if (hasKeyValue) {
      // Could be Properties or INI - check for Properties characteristics
      const hasComments = content.includes('#') || content.includes('!');
      const hasMultiline = content.includes('\\');
      if (hasComments || hasMultiline || !content.includes('[')) {
        return 'properties';
      }
      return 'ini';
    }
  }
  
  // TOML detection
  if (content.match(/^\s*\w+\s*=\s*.+$/m) && content.includes('[')) {
    // Look for TOML-style sections or key = value pairs
    if (content.match(/^\[[^\]]*\]$/m) || content.includes(' = ')) {
      return 'toml';
    }
  }
  
  // Python dict detection
  if ((content.startsWith('{') && content.endsWith('}')) ||
      (content.startsWith('[') && content.endsWith(']'))) {
    if (content.includes('True') || content.includes('False') || content.includes('None') ||
        content.match(/'[^']*'/) || content.includes('(') && content.includes(')')) {
      return 'dict';
    }
  }
  
  // SQL detection
  if (content.toUpperCase().includes('INSERT INTO') && 
      content.toUpperCase().includes('VALUES')) {
    return 'sql';
  }
  
  return 'unknown';
}

// JSON to XML converter
export function jsonToXml(jsonData: any, options: {
  rootElement?: string;
  attributePrefix?: string;
  textKey?: string;
  addDeclaration?: boolean;
  indentation?: string;
} = {}): string {
  const {
    rootElement = 'root',
    attributePrefix = '@',
    textKey = '#text',
    addDeclaration = true,
    indentation = '  '
  } = options;

  let result = '';
  
  if (addDeclaration) {
    result += '<?xml version="1.0" encoding="UTF-8"?>\n';
  }
  
  result += jsonToXmlElement(jsonData, rootElement, attributePrefix, textKey, indentation, 0);
  
  return result;
}

function jsonToXmlElement(
  value: any,
  tagName: string,
  attributePrefix: string,
  textKey: string,
  indentation: string,
  depth: number
): string {
  const indent = indentation.repeat(depth);
  
  if (value === null || value === undefined) {
    return `${indent}<${tagName}></${tagName}>\n`;
  }
  
  if (typeof value !== 'object') {
    const escapedValue = escapeXml(String(value));
    return `${indent}<${tagName}>${escapedValue}</${tagName}>\n`;
  }
  
  if (Array.isArray(value)) {
    let result = '';
    value.forEach((item, index) => {
      const itemTag = tagName.endsWith('s') ? tagName.slice(0, -1) : `${tagName}_item`;
      result += jsonToXmlElement(item, itemTag, attributePrefix, textKey, indentation, depth);
    });
    return result;
  }
  
  // Handle object
  let attributes = '';
  let textContent = '';
  let childElements = '';
  
  Object.entries(value).forEach(([key, val]) => {
    if (key.startsWith(attributePrefix)) {
      const attrName = key.substring(attributePrefix.length);
      attributes += ` ${attrName}="${escapeXml(String(val))}"`;
    } else if (key === textKey) {
      textContent = escapeXml(String(val));
    } else {
      if (Array.isArray(val)) {
        val.forEach(item => {
          childElements += jsonToXmlElement(item, key, attributePrefix, textKey, indentation, depth + 1);
        });
      } else {
        childElements += jsonToXmlElement(val, key, attributePrefix, textKey, indentation, depth + 1);
      }
    }
  });
  
  const openTag = `${indent}<${tagName}${attributes}>`;
  
  if (childElements) {
    return `${openTag}\n${childElements}${indent}</${tagName}>\n`;
  } else if (textContent) {
    return `${openTag}${textContent}</${tagName}>\n`;
  } else {
    return `${openTag}</${tagName}>\n`;
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// JSON to YAML converter
export function jsonToYaml(jsonData: any, options: {
  indentation?: number;
  sortKeys?: boolean;
} = {}): string {
  const { indentation = 2, sortKeys = false } = options;
  return jsonToYamlValue(jsonData, 0, indentation, sortKeys);
}

function jsonToYamlValue(value: any, depth: number, indentation: number, sortKeys: boolean): string {
  const indent = ' '.repeat(depth * indentation);
  
  if (value === null || value === undefined) {
    return 'null';
  }
  
  if (typeof value === 'boolean') {
    return value.toString();
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'string') {
    // Check if string needs quoting
    if (needsQuoting(value)) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    
    let result = '';
    value.forEach((item, index) => {
      const yamlValue = jsonToYamlValue(item, depth + 1, indentation, sortKeys);
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        result += `${indent}- ${yamlValue.substring((depth + 1) * indentation)}`;
      } else {
        result += `${indent}- ${yamlValue}`;
      }
      if (index < value.length - 1) result += '\n';
    });
    
    return result;
  }
  
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return '{}';
    }
    
    if (sortKeys) {
      keys.sort();
    }
    
    let result = '';
    keys.forEach((key, index) => {
      const yamlValue = jsonToYamlValue(value[key], depth + 1, indentation, sortKeys);
      
      if (typeof value[key] === 'object' && value[key] !== null) {
        if (Array.isArray(value[key]) && value[key].length > 0) {
          result += `${indent}${key}:\n${yamlValue}`;
        } else if (!Array.isArray(value[key]) && Object.keys(value[key]).length > 0) {
          result += `${indent}${key}:\n${yamlValue}`;
        } else {
          result += `${indent}${key}: ${yamlValue}`;
        }
      } else {
        result += `${indent}${key}: ${yamlValue}`;
      }
      
      if (index < keys.length - 1) result += '\n';
    });
    
    return result;
  }
  
  return String(value);
}

function needsQuoting(str: string): boolean {
  // Simple heuristic for when YAML strings need quoting
  return /^[\d\s]|[\s]$|[:\-\[\]{}#|>*&!%@`"]/.test(str) ||
         str === 'true' || str === 'false' || str === 'null' ||
         str.includes('\n') || str.includes('\r');
}

// Properties to JSON converter
export function propertiesToJson(propertiesText: string): any {
  const lines = propertiesText.split('\n');
  const result: any = {};
  let currentKey = '';
  let currentValue = '';
  let isMultiline = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
      continue;
    }
    
    // Handle multiline continuation
    if (isMultiline) {
      if (line.endsWith('\\')) {
        currentValue += line.substring(0, line.length - 1);
        continue;
      } else {
        currentValue += line;
        result[currentKey] = parsePropertiesValue(currentValue.trim());
        currentKey = '';
        currentValue = '';
        isMultiline = false;
        continue;
      }
    }
    
    // Key-value pairs
    const separatorIndex = Math.max(line.indexOf('='), line.indexOf(':'));
    if (separatorIndex > 0) {
      currentKey = line.substring(0, separatorIndex).trim();
      let value = line.substring(separatorIndex + 1).trim();
      
      // Handle multiline values (ending with backslash)
      if (value.endsWith('\\')) {
        currentValue = value.substring(0, value.length - 1);
        isMultiline = true;
      } else {
        result[currentKey] = parsePropertiesValue(value);
      }
    }
  }
  
  // Handle any remaining multiline value
  if (isMultiline && currentKey) {
    result[currentKey] = parsePropertiesValue(currentValue.trim());
  }
  
  return result;
}

function parsePropertiesValue(value: string): any {
  if (!value) return '';
  
  // Handle escaped characters
  value = value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\=/g, '=')
    .replace(/\\:/g, ':')
    .replace(/\\#/g, '#')
    .replace(/\\!/g, '!');
  
  // Handle Unicode escapes
  value = value.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });
  
  // Try to convert to appropriate type
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  const num = Number(value);
  if (!isNaN(num) && isFinite(num)) {
    return num;
  }
  
  return value;
}

// JSON to Properties converter  
export function jsonToProperties(jsonData: any): string {
  if (typeof jsonData !== 'object' || jsonData === null) {
    throw new Error('JSON data must be an object for Properties conversion');
  }
  
  let result = '';
  
  function addProperty(key: string, value: any, prefix: string = ''): void {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value === null || value === undefined) {
      result += `${fullKey}=\n`;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Nested object - flatten with dot notation
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        addProperty(nestedKey, nestedValue, fullKey);
      });
    } else if (Array.isArray(value)) {
      // Array - use indexed keys
      value.forEach((item, index) => {
        addProperty(index.toString(), item, fullKey);
      });
    } else {
      result += `${fullKey}=${formatPropertiesValue(value)}\n`;
    }
  }
  
  Object.entries(jsonData).forEach(([key, value]) => {
    addProperty(key, value);
  });
  
  return result.trim();
}

function formatPropertiesValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'boolean' || typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'string') {
    // Escape special characters
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/=/g, '\\=')
      .replace(/:/g, '\\:')
      .replace(/#/g, '\\#')
      .replace(/!/g, '\\!');
  }
  
  // For other types, convert to string and escape
  return formatPropertiesValue(String(value));
}

// JAR file structure interfaces
export interface JarFileEntry {
  name: string;
  isDirectory: boolean;
  size: number;
  content?: string;
  type: 'class' | 'resource' | 'manifest' | 'config' | 'other';
}

export interface JarManifest {
  mainClass?: string;
  version?: string;
  createdBy?: string;
  buildJdk?: string;
  attributes: Record<string, string>;
}

export interface JavaClass {
  packageName: string;
  className: string;
  superClass?: string;
  interfaces: string[];
  fields: JavaField[];
  methods: JavaMethod[];
  annotations: string[];
  isPublic: boolean;
  isAbstract: boolean;
  isFinal: boolean;
}

export interface JavaField {
  name: string;
  type: string;
  modifiers: string[];
  annotations: string[];
  value?: any;
}

export interface JavaMethod {
  name: string;
  returnType: string;
  parameters: JavaParameter[];
  modifiers: string[];
  annotations: string[];
  exceptions: string[];
}

export interface JavaParameter {
  name: string;
  type: string;
  annotations: string[];
}

export interface JarAnalysis {
  manifest?: JarManifest;
  classes: JavaClass[];
  resources: JarFileEntry[];
  structure: {
    totalFiles: number;
    totalClasses: number;
    totalResources: number;
    packages: string[];
    dependencies: string[];
  };
  metadata: {
    fileName: string;
    fileSize: number;
    extractedAt: string;
    jarType: 'executable' | 'library' | 'web-app' | 'unknown';
  };
}

// JAR to JSON converter - Main entry point
export async function jarToJson(jarFile: File): Promise<JarAnalysis> {
  try {
    const arrayBuffer = await jarFile.arrayBuffer();
    const analysis = await analyzeJarFile(arrayBuffer, jarFile.name);
    return analysis;
  } catch (error) {
    throw new Error(`Failed to analyze JAR file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Analyze JAR file structure and content
async function analyzeJarFile(arrayBuffer: ArrayBuffer, fileName: string): Promise<JarAnalysis> {
  const entries = await extractJarEntries(arrayBuffer);
  const manifest = extractManifest(entries);
  const classes = await extractClasses(entries);
  const resources = extractResources(entries);
  const structure = analyzeStructure(entries, classes);
  
  return {
    manifest,
    classes,
    resources,
    structure,
    metadata: {
      fileName,
      fileSize: arrayBuffer.byteLength,
      extractedAt: new Date().toISOString(),
      jarType: determineJarType(manifest, entries)
    }
  };
}

// Extract entries from JAR file (ZIP format)
async function extractJarEntries(arrayBuffer: ArrayBuffer): Promise<JarFileEntry[]> {
  const entries: JarFileEntry[] = [];
  
  try {
    // Simple ZIP file parsing - JAR files are ZIP files
    const view = new DataView(arrayBuffer);
    let offset = 0;
    
    // Look for central directory
    const centralDirOffset = findCentralDirectory(view);
    if (centralDirOffset === -1) {
      throw new Error('Invalid JAR/ZIP file format');
    }
    
    // Parse central directory entries
    offset = centralDirOffset;
    while (offset < arrayBuffer.byteLength - 4) {
      const signature = view.getUint32(offset, true);
      if (signature !== 0x02014b50) break; // Central directory signature
      
      const entry = parseCentralDirectoryEntry(view, offset, arrayBuffer);
      if (entry) {
        entries.push(entry);
      }
      
      const filenameLength = view.getUint16(offset + 28, true);
      const extraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      
      offset += 46 + filenameLength + extraLength + commentLength;
    }
    
    return entries;
  } catch (error) {
    // Fallback: try to read as text-based analysis
    return await fallbackJarAnalysis(arrayBuffer);
  }
}

// Fallback analysis when ZIP parsing fails
async function fallbackJarAnalysis(arrayBuffer: ArrayBuffer): Promise<JarFileEntry[]> {
  const entries: JarFileEntry[] = [];
  
  // Try to detect common JAR patterns in the binary data
  const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
  
  // Look for class file signatures and common file patterns
  const classMatches = text.match(/([a-zA-Z_$][a-zA-Z0-9_$]*\/)*[a-zA-Z_$][a-zA-Z0-9_$]*\.class/g) || [];
  const resourceMatches = text.match(/([a-zA-Z_$][a-zA-Z0-9_$]*\/)*[a-zA-Z0-9_$.-]+\.(xml|properties|json|yml|yaml|txt|config)/g) || [];
  
  // Add discovered class files
  classMatches.forEach(className => {
    entries.push({
      name: className,
      isDirectory: false,
      size: 0,
      type: 'class'
    });
  });
  
  // Add discovered resource files
  resourceMatches.forEach(resourceName => {
    entries.push({
      name: resourceName,
      isDirectory: false,
      size: 0,
      type: 'resource'
    });
  });
  
  return entries;
}

// Find central directory in ZIP file
function findCentralDirectory(view: DataView): number {
  // Look for End of Central Directory signature from the end
  for (let i = view.byteLength - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      const centralDirOffset = view.getUint32(i + 16, true);
      return centralDirOffset;
    }
  }
  return -1;
}

// Parse central directory entry
function parseCentralDirectoryEntry(view: DataView, offset: number, arrayBuffer: ArrayBuffer): JarFileEntry | null {
  try {
    const filenameLength = view.getUint16(offset + 28, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    
    // Extract filename
    const filenameBytes = new Uint8Array(arrayBuffer, offset + 46, filenameLength);
    const filename = new TextDecoder('utf-8').decode(filenameBytes);
    
    const isDirectory = filename.endsWith('/');
    
    return {
      name: filename,
      isDirectory,
      size: uncompressedSize,
      type: determineFileType(filename)
    };
  } catch (error) {
    return null;
  }
}

// Determine file type based on filename
function determineFileType(filename: string): 'class' | 'resource' | 'manifest' | 'config' | 'other' {
  if (filename === 'META-INF/MANIFEST.MF') return 'manifest';
  if (filename.endsWith('.class')) return 'class';
  if (filename.match(/\.(xml|properties|json|yml|yaml|config|conf)$/)) return 'config';
  if (filename.startsWith('META-INF/') || filename.match(/\.(txt|md|license|notice)$/i)) return 'resource';
  return 'other';
}

// Extract manifest information
function extractManifest(entries: JarFileEntry[]): JarManifest | undefined {
  const manifestEntry = entries.find(e => e.name === 'META-INF/MANIFEST.MF');
  if (!manifestEntry || !manifestEntry.content) return undefined;
  
  const attributes: Record<string, string> = {};
  let mainClass: string | undefined;
  let version: string | undefined;
  let createdBy: string | undefined;
  let buildJdk: string | undefined;
  
  const lines = manifestEntry.content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes(':')) continue;
    
    const [key, ...valueParts] = trimmed.split(':');
    const value = valueParts.join(':').trim();
    
    switch (key.trim()) {
      case 'Main-Class':
        mainClass = value;
        break;
      case 'Implementation-Version':
      case 'Specification-Version':
        if (!version) version = value;
        break;
      case 'Created-By':
        createdBy = value;
        break;
      case 'Build-Jdk':
        buildJdk = value;
        break;
    }
    
    attributes[key.trim()] = value;
  }
  
  return {
    mainClass,
    version,
    createdBy,
    buildJdk,
    attributes
  };
}

// Extract class information (simplified)
async function extractClasses(entries: JarFileEntry[]): Promise<JavaClass[]> {
  const classes: JavaClass[] = [];
  
  const classEntries = entries.filter(e => e.type === 'class' && !e.isDirectory);
  
  for (const entry of classEntries) {
    const className = entry.name.replace(/\.class$/, '').replace(/\//g, '.');
    const packageParts = className.split('.');
    const simpleClassName = packageParts.pop() || '';
    const packageName = packageParts.join('.');
    
    // Simplified class analysis - in a real implementation, you'd parse the bytecode
    classes.push({
      packageName,
      className: simpleClassName,
      interfaces: [],
      fields: [],
      methods: [],
      annotations: [],
      isPublic: true,
      isAbstract: false,
      isFinal: false
    });
  }
  
  return classes;
}

// Extract resource files
function extractResources(entries: JarFileEntry[]): JarFileEntry[] {
  return entries.filter(e => 
    e.type === 'resource' || 
    e.type === 'config' || 
    (e.type === 'other' && !e.isDirectory)
  );
}

// Analyze JAR structure
function analyzeStructure(entries: JarFileEntry[], classes: JavaClass[]): JarAnalysis['structure'] {
  const packages = [...new Set(classes.map(c => c.packageName).filter(Boolean))];
  const dependencies: string[] = [];
  
  // Extract potential dependencies from file paths
  entries.forEach(entry => {
    if (entry.name.includes('lib/') || entry.name.includes('dependency/')) {
      const parts = entry.name.split('/');
      const libName = parts[parts.length - 1];
      if (libName && !dependencies.includes(libName)) {
        dependencies.push(libName);
      }
    }
  });
  
  return {
    totalFiles: entries.length,
    totalClasses: classes.length,
    totalResources: entries.filter(e => e.type === 'resource').length,
    packages: packages.sort(),
    dependencies
  };
}

// Determine JAR type
function determineJarType(manifest?: JarManifest, entries: JarFileEntry[] = []): 'executable' | 'library' | 'web-app' | 'unknown' {
  if (manifest?.mainClass) return 'executable';
  
  const hasWebXml = entries.some(e => e.name === 'WEB-INF/web.xml');
  if (hasWebXml) return 'web-app';
  
  const hasMainClass = entries.some(e => e.name.includes('Main.class'));
  if (hasMainClass) return 'executable';
  
  return 'library';
}
