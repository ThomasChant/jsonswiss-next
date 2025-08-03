
"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { jsonToExcel, type JsonToExcelOptions } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function JsonToExcelPage() {
  const [inputJson, setInputJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [excelBuffer, setExcelBuffer] = useState<ArrayBuffer | null>(null);
  const { copy } = useClipboard({ successMessage: 'JSON copied to clipboard' });
  
  const [options, setOptions] = useState<JsonToExcelOptions>({
    sheetName: 'Sheet1',
    includeHeaders: true,
    bookType: 'xlsx'
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
      setError(null);
      return;
    }

    try {
      const parsedData = JSON.parse(jsonInput);
      const buffer = jsonToExcel(parsedData, options);
      setExcelBuffer(buffer);
      setDownloadReady(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setDownloadReady(false);
      setExcelBuffer(null);
    }
  };

  const handleOptionsChange = (newOptions: Partial<JsonToExcelOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    
    if (inputJson.trim()) {
      convertJsonToExcel(inputJson);
    }
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
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
    
    const blob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.sheetName || 'data'}.${options.bookType}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What JSON structures can be converted?",
      answer: "This tool works best with arrays of objects, which become Excel rows with columns. Simple objects become single-row tables, and primitive arrays become single-column tables."
    },
    {
      question: "How are nested objects handled?",
      answer: "Nested objects and arrays are flattened into string representations in Excel cells. For complex nested data, consider preprocessing your JSON first."
    },
    {
      question: "What Excel formats are supported?",
      answer: "You can export to .xlsx (modern Excel), .xls (legacy Excel), .csv (comma-separated), and other formats supported by the Excel export engine."
    },
    {
      question: "Can I customize the Excel output?",
      answer: "Yes! Use the Settings panel to customize the sheet name, toggle headers, and choose the output format. Headers are automatically generated from object keys."
    }
  ];

  const settingsContent = (
    <div>
      <h3 className="text-sm font-medium mb-3">Excel Export Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </div>
  );

  const emptyStateContent = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center">
        <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Enter JSON data to convert to Excel</p>
        <p className="text-sm mt-2">Arrays of objects work best</p>
        {downloadReady && (
          <div className="mt-4 text-green-600 dark:text-green-400">
            <span>✓ Excel file ready for download</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ConverterLayout
      title="JSON to Excel Converter"
      description="Convert JSON data to Excel spreadsheet format"
      faqItems={faqItems}
      inputData={inputJson}
      outputData=""
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="excel"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="Excel"
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
    />
  );
}