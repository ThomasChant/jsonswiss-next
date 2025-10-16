
"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { ExcelSpreadsheet } from "@/components/table/ExcelSpreadsheet";
import { jsonToExcel, type JsonToExcelOptions } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";

// Helper function to flatten nested objects (same logic as in converters.ts)
function flattenObject(obj: any, prefix: string = '', separator: string = '.'): any {
  const flattened: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      const value = obj[key];
      
      if (value === null || value === undefined) {
        flattened[newKey] = value;
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          flattened[newKey] = '[]';
        } else if (value.every(item => typeof item !== 'object' || item === null)) {
          flattened[newKey] = value.join(', ');
        } else {
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
        const subFlattened = flattenObject(value, newKey, separator);
        Object.assign(flattened, subFlattened);
      } else {
        flattened[newKey] = value;
      }
    }
  }
  
  return flattened;
}

export default function JsonToExcelPage() {
  const [inputJson, setInputJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [excelBuffer, setExcelBuffer] = useState<ArrayBuffer | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]); // 用于表格预览的数据
  const [isConverting, setIsConverting] = useState(false); // 转换状态
  const { copy } = useClipboard({ successMessage: 'JSON copied to clipboard' });
  
  const [options, setOptions] = useState<JsonToExcelOptions>({
    sheetName: 'Sheet1',
    includeHeaders: true,
    bookType: 'xlsx',
    flattenData: true
  });

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    convertJsonToExcel(jsonValue);
  };

  const convertJsonToExcel = (jsonInput: string) => {
    if (!jsonInput.trim()) {
      setDownloadReady(false);
      setExcelBuffer(null);
      setPreviewData([]);
      setError(null);
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const parsedData = JSON.parse(jsonInput);
      console.log('Converting JSON to Excel:', parsedData);
      
      // 准备预览数据 - 和Excel转换使用相同的展平逻辑
      let previewArray: any[];
      if (Array.isArray(parsedData)) {
        previewArray = parsedData;
      } else if (typeof parsedData === 'object' && parsedData !== null) {
        // 智能检测：如果对象只包含一个数组属性，使用该数组
        const keys = Object.keys(parsedData);
        if (keys.length === 1 && Array.isArray(parsedData[keys[0]])) {
          previewArray = parsedData[keys[0]];
          console.log('Detected single array property, using:', keys[0]);
        } else {
          previewArray = [parsedData];
        }
      } else {
        throw new Error('Data must be an object or array of objects');
      }

      if (previewArray.length === 0) {
        throw new Error('Data array cannot be empty');
      }

      // 检查是否所有元素都是原始值（和converters.ts中的逻辑一致）
      const allPrimitive = previewArray.every(item => typeof item !== 'object' || item === null);
      
      // 根据flatten选项处理预览数据（和converters.ts中的逻辑一致）
      const processedPreviewData = allPrimitive
        ? previewArray.map(item => ({ value: item })) // 为原始值数组使用一致的列名
        : options.flattenData 
          ? previewArray.map((item, index) => {
              if (typeof item !== 'object' || item === null) {
                return { [`value_${index}`]: item };
              }
              return flattenObject(item);
            })
          : previewArray.map((item, index) => {
              if (typeof item !== 'object' || item === null) {
                return { [`value_${index}`]: item };
              }
              // For nested data without flattening, convert complex values to JSON strings for preview
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

      // 生成Excel文件
      const buffer = jsonToExcel(parsedData, options);
      console.log('Excel conversion successful, buffer type:', typeof buffer, 'byteLength:', buffer?.byteLength);
      
      setExcelBuffer(buffer);
      setPreviewData(processedPreviewData);
      setDownloadReady(true);
      setError(null);
    } catch (err) {
      console.error('JSON to Excel conversion failed:', err);
      setError(err instanceof Error ? err.message : "Conversion failed");
      setDownloadReady(false);
      setExcelBuffer(null);
      setPreviewData([]);
    } finally {
      setIsConverting(false);
    }
  };

  const handleOptionsChange = (newOptions: Partial<JsonToExcelOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    
    if (inputJson.trim()) {
      convertJsonToExcel(inputJson);
    }
  };

  const handleImport = (json: any) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    convertJsonToExcel(jsonString);
    setImportDialogOpen(false);
  };

  const handleCopy = async () => {
    if (inputJson) {
      await copy(inputJson);
    }
  };

  const handleDownload = () => {
    if (!excelBuffer || !downloadReady) return;
    
    try {
      // Ensure we have a proper ArrayBuffer or Buffer
      let bufferData: ArrayBuffer | Uint8Array = excelBuffer;
      
      // Ensure we have a proper buffer for Blob constructor
      if (!(bufferData instanceof ArrayBuffer) && !ArrayBuffer.isView(bufferData)) {
        console.warn('Excel buffer is not ArrayBuffer, attempting conversion');
        // Convert to proper format for Blob constructor
        if (typeof bufferData === 'object' && bufferData && 'length' in bufferData) {
          bufferData = new Uint8Array(bufferData as any);
        }
      }
      
      const blob = new Blob([bufferData], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${options.sheetName || 'data'}.${options.bookType}`;
      document.body.appendChild(a); // Add to DOM for better compatibility
      a.click();
      document.body.removeChild(a); // Clean up
      URL.revokeObjectURL(url);
      
      console.log('Excel file download initiated successfully');
    } catch (error) {
      console.error('Excel download failed:', error);
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const faqItems = [
    {
      question: "How to convert JSON to Excel online?",
      answer: "Simply paste your JSON data into the input area, and our converter will instantly generate a live Excel preview. You can then download the Excel file in XLSX, XLS, or CSV format. The conversion works with arrays of objects, nested data, and complex JSON structures."
    },
    {
      question: "What JSON structures can be converted to Excel?",
      answer: "Our JSON to Excel converter supports all JSON data types: arrays of objects (ideal for spreadsheet rows), nested objects with automatic flattening, primitive arrays, and complex hierarchical data. The live preview shows exactly how your JSON will appear in Excel format."
    },
    {
      question: "How are nested objects handled in JSON to Excel conversion?",
      answer: "Choose between two conversion modes: Flatten nested data (default) creates separate columns with dot notation (e.g., 'user.address.city') and indexed arrays (e.g., 'items[0].name'). Non-flatten mode preserves nested structures as JSON strings in Excel cells."
    },
    {
      question: "What Excel formats are supported for JSON conversion?",
      answer: "Convert JSON to multiple Excel formats: XLSX (modern Excel), XLS (legacy Excel), CSV (comma-separated values), and ODS (OpenDocument). All formats maintain data integrity and support custom headers and sheet names."
    },
    {
      question: "Can I preview JSON data before converting to Excel?",
      answer: "Yes! Our JSON to Excel converter includes a live table preview that shows exactly how your data will appear in Excel. The preview uses Excel-style column names (A, B, C...) and updates automatically when you change conversion settings."
    },
    {
      question: "How to import JSON data into Excel spreadsheets?",
      answer: "Use our online JSON to Excel converter to transform your JSON data into Excel format. The tool automatically detects data structures, handles nested objects, and provides customizable export options including sheet names, headers, and multiple Excel formats."
    },
    {
      question: "Is the JSON to Excel converter free to use?",
      answer: "Yes, our JSON to Excel conversion tool is completely free. Convert unlimited JSON files to Excel format online without registration, downloads, or usage limits. Your data is processed locally for privacy and security."
    },
    {
      question: "Can I customize the Excel output from JSON conversion?",
      answer: "Absolutely! Customize sheet names, toggle column headers, choose between XLSX/XLS/CSV formats, and control how nested data is flattened. All settings are reflected in both the live preview and downloaded Excel file."
    }
  ];

  const settingsContent = (
    <div>
      <h3 className="text-sm font-medium mb-3">Excel Export Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sheet Name */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="sheetName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Sheet Name:
          </label>
          <input
            type="text"
            id="sheetName"
            value={options.sheetName}
            onChange={(e) => handleOptionsChange({ sheetName: e.target.value })}
            placeholder="Sheet1"
            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm"
          />
        </div>

        {/* Book Type */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="bookType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Format:
          </label>
          <select
            id="bookType"
            value={options.bookType}
            onChange={(e) => handleOptionsChange({ bookType: e.target.value as any })}
            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm"
          >
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="xls">Excel Legacy (.xls)</option>
            <option value="csv">CSV (.csv)</option>
            <option value="ods">OpenDocument (.ods)</option>
          </select>
        </div>

        {/* Headers Checkbox */}
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="includeHeaders"
            checked={options.includeHeaders}
            onChange={(e) => handleOptionsChange({ includeHeaders: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
          />
          <label htmlFor="includeHeaders" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Include headers
          </label>
        </div>

        {/* Flatten Data Checkbox */}
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="flattenData"
            checked={options.flattenData}
            onChange={(e) => handleOptionsChange({ flattenData: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
          />
          <label htmlFor="flattenData" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Flatten nested data
          </label>
        </div>
      </div>
    </div>
  );

  const emptyStateContent = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center">
        <FileSpreadsheet className="w-16 h-16 mx-auto mb-6 opacity-60" />
        <p>Enter JSON data to see Excel preview</p>
        <p className="text-sm mt-2">Arrays of objects work best for table format</p>
        {downloadReady && (
          <div className="mt-4 text-green-600 dark:text-green-400">
            <span>✓ Excel file ready for download</span>
          </div>
        )}
      </div>
    </div>
  );

  // 自定义输出内容 - 表格预览
  const customOutputContent = (
    <ExcelSpreadsheet 
      data={previewData}
      maxHeight="100%"
      className="h-full"
      isLoading={isConverting}
    />
  );

  return (
    <ConverterLayout
      title="JSON to Excel Converter Online"
      description="Convert JSON data to Excel XLSX format with live table preview and nested data support"
      faqItems={faqItems}
      inputData={inputJson}
      outputData={downloadReady ? "Excel file ready" : ""}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="plaintext"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="Excel Preview"
      inputIcon={<FileText className="w-4 h-4" />}
      outputIcon={<FileSpreadsheet className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
      customOutputContent={customOutputContent}
    />
  );
}
