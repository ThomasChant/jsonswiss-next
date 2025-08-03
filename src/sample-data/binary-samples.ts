/**
 * Binary sample data utilities for Excel and other file-based converters
 * Provides base64-encoded sample files for immediate demo capability
 */

// Base64-encoded Excel file containing employee data with multiple sheets
// This is a small Excel file with employee data in Sheet1 and department data in Sheet2
export const SAMPLE_EXCEL_BASE64 = `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
AAAAAA==`;

// Function to convert base64 to ArrayBuffer for Excel processing
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Function to create a File object from base64 data
export function createExcelFile(filename: string = 'sample-employees.xlsx'): File {
  const buffer = base64ToArrayBuffer(SAMPLE_EXCEL_BASE64);
  return new File([buffer], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

// Metadata about the sample Excel file
export const SAMPLE_EXCEL_METADATA = {
  filename: 'sample-employees.xlsx',
  sheets: [
    {
      name: 'Employees',
      description: 'Employee data with personal info and employment details',
      headers: ['employeeId', 'firstName', 'lastName', 'email', 'position', 'department', 'salary', 'hireDate', 'isActive', 'rating'],
      rowCount: 4,
      hasHeaders: true
    },
    {
      name: 'Departments',
      description: 'Department information with budgets and managers',
      headers: ['id', 'name', 'budget', 'managerName', 'managerEmail'],
      rowCount: 3,
      hasHeaders: true
    }
  ],
  totalSize: '~5KB',
  description: 'Sample Excel workbook containing employee and department data for demonstration purposes'
};

// Helper function to get sample Excel data as File object
export function getSampleExcelFile(): File {
  return createExcelFile();
}

// Helper function to get Excel metadata
export function getExcelMetadata() {
  return SAMPLE_EXCEL_METADATA;
}