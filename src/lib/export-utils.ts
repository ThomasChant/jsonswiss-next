import { toast } from '@/lib/toast';
import { jsonToExcel } from '@/lib/converters';

export type ExportFormat = 'json' | 'csv' | 'excel';

/**
 * Generate a timestamped filename
 */
function generateFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `${baseName}_${timestamp}.${extension}`;
}

/**
 * Create and trigger a file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    toast.success(`File downloaded: ${filename}`);
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download file');
  }
}

/**
 * Export data as JSON file
 */
export function exportToJson(data: any[], filename?: string): void {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const fileName = filename || generateFilename('table_data', 'json');
    
    downloadFile(jsonContent, fileName, 'application/json');
  } catch (error) {
    console.error('JSON export failed:', error);
    toast.error('Failed to export JSON file');
  }
}

/**
 * Escape CSV field value
 */
function escapeCsvField(value: any): string {
  if (value == null) return '';
  
  let str = String(value);
  
  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""'); // Escape quotes by doubling them
    str = `"${str}"`;
  }
  
  return str;
}

/**
 * Convert object array to CSV format
 */
function convertToCsv(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get all unique column headers
  const headers = new Set<string>();
  data.forEach(item => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      Object.keys(item).forEach(key => headers.add(key));
    }
  });

  const headerArray = Array.from(headers).sort();
  
  // Handle case where data contains non-object items
  if (headerArray.length === 0) {
    // If no object properties found, treat each item as a single value
    const csvContent = ['Value', ...data.map(item => escapeCsvField(item))].join('\n');
    return csvContent;
  }

  // Create CSV content with headers
  const csvRows: string[] = [];
  
  // Add header row
  csvRows.push(headerArray.map(header => escapeCsvField(header)).join(','));
  
  // Add data rows
  data.forEach(item => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const row = headerArray.map(header => {
        const value = item[header];
        // Handle complex objects by converting to JSON string
        if (typeof value === 'object' && value !== null) {
          return escapeCsvField(JSON.stringify(value));
        }
        return escapeCsvField(value);
      });
      csvRows.push(row.join(','));
    } else {
      // For non-object items, put the value in the first column and empty strings for others
      const row = [escapeCsvField(item), ...new Array(headerArray.length - 1).fill('')];
      csvRows.push(row.join(','));
    }
  });

  return csvRows.join('\n');
}

/**
 * Export data as CSV file
 */
export function exportToCsv(data: any[], filename?: string): void {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvContent = convertToCsv(data);
    const fileName = filename || generateFilename('table_data', 'csv');
    
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  } catch (error) {
    console.error('CSV export failed:', error);
    toast.error('Failed to export CSV file');
  }
}

/**
 * Export data as Excel file
 */
export function exportToExcel(data: any[], filename?: string): void {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const excelBuffer = jsonToExcel(data, {
      sheetName: 'Data',
      includeHeaders: true,
      bookType: 'xlsx',
      flattenData: true
    });
    
    const fileName = filename || generateFilename('table_data', 'xlsx');
    
    // Create blob and download
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    toast.success(`Excel file downloaded: ${fileName}`);
  } catch (error) {
    console.error('Excel export failed:', error);
    toast.error('Failed to export Excel file');
  }
}

/**
 * Export data with automatic format detection
 */
export function exportData(data: any[], format: ExportFormat, filename?: string): void {
  switch (format) {
    case 'json':
      exportToJson(data, filename);
      break;
    case 'csv':
      exportToCsv(data, filename);
      break;
    case 'excel':
      exportToExcel(data, filename);
      break;
    default:
      toast.error('Unsupported export format');
  }
}

/**
 * Get export options based on data structure
 */
export function getExportOptions(data: any[]): Array<{ format: ExportFormat; label: string; description: string }> {
  const options = [
    {
      format: 'json' as ExportFormat,
      label: 'JSON',
      description: 'Export as JSON file with full data structure'
    }
  ];

  // CSV and Excel are suitable for tabular data (arrays of objects)
  if (Array.isArray(data) && data.length > 0) {
    const hasObjectStructure = data.some(item => 
      typeof item === 'object' && item !== null && !Array.isArray(item)
    );
    
    if (hasObjectStructure || data.every(item => typeof item !== 'object')) {
      options.push(
        {
          format: 'csv' as ExportFormat,
          label: 'CSV',
          description: 'Export as CSV file for spreadsheet applications'
        },
        {
          format: 'excel' as ExportFormat,
          label: 'Excel',
          description: 'Export as Excel XLSX file with formatting support'
        }
      );
    }
  }

  return options;
}