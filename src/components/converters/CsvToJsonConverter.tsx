"use client";

import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { csvToJson } from "@/lib/converters";
import {
  BookOpen,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { useState } from "react";

export function CsvToJsonConverter({ faqItems }: { faqItems: Array<{ question: string; answer: string }> }) {
  const [inputCsv, setInputCsv] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { copy } = useClipboard({ successMessage: 'JSON copied to clipboard' });
  
  const [options, setOptions] = useState({
    delimiter: ',',
    hasHeader: true,
    skipEmptyLines: true
  });


  const handleInputChange = (value: string | undefined) => {
    const csvValue = value || "";
    setInputCsv(csvValue);
    convertCsvToJson(csvValue);
  };

  const convertCsvToJson = (csvInput: string) => {
    if (!csvInput.trim()) {
      setOutputJson("");
      setError(null);
      return;
    }

    try {
      const result = csvToJson(csvInput, options);
      setOutputJson(JSON.stringify(result, null, 2));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setOutputJson("");
    }
  };

  const handleOptionsChange = (newOptions: Partial<typeof options>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    if (inputCsv) {
      convertCsvToJson(inputCsv);
    }
  };

  const handleCopy = () => {
    copy(outputJson);
  };

  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInputCsv(content);
          convertCsvToJson(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDownload = () => {
    if (!outputJson) return;
    
    const blob = new Blob([outputJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const settingsContent = (
    <div>
      <h3 className="text-sm font-medium mb-3">Conversion Options</h3>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <label htmlFor="delimiter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Delimiter:
          </label>
          <select
            id="delimiter"
            value={options.delimiter}
            onChange={(e) => handleOptionsChange({ delimiter: e.target.value })}
            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="|">Pipe (|)</option>
            <option value="\t">Tab (\t)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasHeader"
            checked={options.hasHeader}
            onChange={(e) => handleOptionsChange({ hasHeader: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
          />
          <label htmlFor="hasHeader" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            First row contains headers
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="skipEmptyLines"
            checked={options.skipEmptyLines}
            onChange={(e) => handleOptionsChange({ skipEmptyLines: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
          />
          <label htmlFor="skipEmptyLines" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Skip empty lines
          </label>
        </div>
      </div>
    </div>
  );


  return (
    <ConverterLayout
      title="CSV to JSON Converter"
      description="Convert CSV data to structured JSON format"
      faqItems={faqItems} // FAQ is handled by parent ToolPageLayoutServer
      inputData={inputCsv}
      outputData={outputJson}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="text"
      outputLanguage="json"
      inputLanguageDisplayName="CSV"
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
    />
  );
}