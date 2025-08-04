
"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { ExcelSpreadsheet } from "@/components/table/ExcelSpreadsheet";
import { excelToJson, getExcelSheetNames, type ExcelToJsonOptions } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";

export default function ExcelToJsonPage() {
  const [inputData, setInputData] = useState(""); // Empty input for ConverterLayout compatibility
  const [outputJson, setOutputJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [spreadsheetData, setSpreadsheetData] = useState<any[]>([]); // 用于电子表格展示的数据
  const [isLoading, setIsLoading] = useState(false); // Excel导入loading状态
  const { copy } = useClipboard({ successMessage: 'JSON copied to clipboard' });
  
  const [options, setOptions] = useState<ExcelToJsonOptions>({
    sheetIndex: 0,
    hasHeaders: true,
    range: undefined
  });

  const convertExcelToJson = async (buffer: ArrayBuffer, opts: ExcelToJsonOptions) => {
    if (!buffer) {
      setOutputJson("");
      setSpreadsheetData([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // 添加一个小延迟以确保loading状态能够显示
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = excelToJson(buffer, opts);
      setOutputJson(JSON.stringify(result.data, null, 2));
      setSpreadsheetData(result.data); // 设置电子表格数据
      
      // Update available sheets if not already set
      if (availableSheets.length === 0 && result.metadata.sheetNames) {
        setAvailableSheets(result.metadata.sheetNames);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setOutputJson("");
      setSpreadsheetData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionsChange = async (newOptions: Partial<ExcelToJsonOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    
    if (fileBuffer) {
      await convertExcelToJson(fileBuffer, updatedOptions);
    }
  };

  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xlsm,.xls";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            setFileBuffer(buffer);
            setFileName(file.name);
            setInputData(file.name); // Update input to show file name
            
            // Get sheet names first
            const sheets = getExcelSheetNames(buffer);
            setAvailableSheets(sheets);
            
            // Reset options when loading new file
            const resetOptions = { ...options, sheetIndex: 0 };
            setOptions(resetOptions);
            await convertExcelToJson(buffer, resetOptions);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to read Excel file");
            setOutputJson("");
            setIsLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    };
    input.click();
  };

  const handleInputChange = (value: string | undefined) => {
    // Not used for Excel converter since we only accept file imports
    // This is just for ConverterLayout compatibility
  };

  const handleCopy = async () => {
    if (outputJson) {
      await copy(outputJson);
    }
  };

  const handleDownload = () => {
    if (!outputJson) return;
    
    const blob = new Blob([outputJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? fileName.replace(/\.[^/.]+$/, ".json") : "converted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Excel formats are supported?",
      answer: "This tool supports modern Excel formats including .xlsx, .xlsm (macro-enabled), and legacy .xls files. Both single and multi-sheet workbooks are supported."
    },
    {
      question: "How does sheet selection work?",
      answer: "After importing an Excel file, you can select which sheet to convert using the dropdown in settings. Sheet names are automatically detected from your workbook."
    },
    {
      question: "Can I convert specific cell ranges?",
      answer: "Yes! Use the range option in settings to specify a cell range like 'A1:D10'. Leave empty to convert the entire used range of the selected sheet."
    },
    {
      question: "How are headers handled?",
      answer: "When 'First row contains headers' is enabled, the first row values become JSON object keys. When disabled, generic keys like 'Column1', 'Column2' are used."
    }
  ];

  const settingsContent = (
    <div>
      <h3 className="text-sm font-medium mb-3">Excel Import Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sheet Selection */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="sheet" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Sheet:
          </label>
          <select
            id="sheet"
            value={options.sheetIndex}
            onChange={(e) => handleOptionsChange({ sheetIndex: parseInt(e.target.value) })}
            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm"
            disabled={availableSheets.length === 0}
          >
            {availableSheets.map((sheetName, index) => (
              <option key={index} value={index}>
                {sheetName}
              </option>
            ))}
            {availableSheets.length === 0 && (
              <option value={0}>No sheets available</option>
            )}
          </select>
        </div>

        {/* Range Input */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="range" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Range (optional):
          </label>
          <input
            type="text"
            id="range"
            value={options.range || ""}
            onChange={(e) => handleOptionsChange({ range: e.target.value || undefined })}
            placeholder="e.g., A1:D10"
            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm"
          />
        </div>

        {/* Headers Checkbox */}
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="hasHeaders"
            checked={options.hasHeaders}
            onChange={(e) => handleOptionsChange({ hasHeaders: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
          />
          <label htmlFor="hasHeaders" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            First row contains headers
          </label>
        </div>
      </div>
    </div>
  );

  const emptyStateContent = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center">
        <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Import an Excel file to convert to JSON</p>
        <p className="text-sm mt-2">Supports .xlsx, .xlsm, and .xls files</p>
        {fileName && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-2">
            ✓ Loaded: {fileName}
          </p>
        )}
      </div>
    </div>
  );

  // 自定义输入内容 - 电子表格展示
  const customInputContent = (
    <ExcelSpreadsheet 
      data={spreadsheetData}
      maxHeight="100%"
      className="h-full"
      isLoading={isLoading}
    />
  );

  return (
    <ConverterLayout
      title="Excel to JSON Converter"
      description="Convert Excel spreadsheet data to structured JSON format"
      faqItems={faqItems}
      inputData={inputData}
      outputData={outputJson}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="plaintext"
      outputLanguage="json"
      inputLanguageDisplayName="Excel Spreadsheet"
      outputLanguageDisplayName="JSON"
      inputIcon={<FileSpreadsheet className="w-4 h-4" />}
      outputIcon={<FileText className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onFileImport={handleFileImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
      customInputContent={customInputContent}
    />
  );
}