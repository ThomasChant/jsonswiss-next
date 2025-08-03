
"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";
import { jsonToToml } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";

export default function JsonToTomlPage() {
  // Local state
  const [inputData, setInputData] = useState("");
  const [outputData, setOutputData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const { copy } = useClipboard({ 
    successMessage: 'TOML copied to clipboard',
    errorMessage: 'Failed to copy TOML to clipboard'
  });

  // Convert JSON to TOML
  const convert = (jsonStr: string): string => {
    if (!jsonStr.trim()) return "";

    try {
      const data = JSON.parse(jsonStr);
      return jsonToToml(data);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Conversion failed");
    }
  };

  // Handle input change
  const handleInputChange = (value: string | undefined) => {
    const newValue = value || "";
    setInputData(newValue);
    setError(null);

    try {
      const result = convert(newValue);
      setOutputData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setOutputData("");
    }
  };

  // Handle copy
  const handleCopy = async () => {
    if (outputData) {
      await copy(outputData);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!outputData) return;
    
    const blob = new Blob([outputData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.toml";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = (data: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonStr = JSON.stringify(data, null, 2);
    handleInputChange(jsonStr);
    setImportDialogOpen(false);
  };

  const faqItems = [
    {
      question: "How are nested JSON objects converted?",
      answer: "Nested objects become TOML sections with dot notation. For example, {database: {host: 'localhost'}} becomes [database] with host = 'localhost'."
    },
    {
      question: "How are JSON arrays handled?",
      answer: "Simple arrays become TOML arrays with square brackets. Arrays of objects are converted to array tables using [[table.name]] syntax."
    },
    {
      question: "What about complex data types?",
      answer: "Dates are formatted as ISO 8601 strings, complex nested structures become inline tables, and special characters are properly escaped."
    },
    {
      question: "Can I convert JSON data directly?",
      answer: "Yes! You can paste JSON directly into the input editor or import JSON data from various sources using the import button."
    }
  ];

  const emptyStateContent = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center">
        <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Add JSON data to see TOML output</p>
        <p className="text-sm mt-2">Your converted TOML configuration will appear here</p>
      </div>
    </div>
  );

  return (
    <ConverterLayout
      title="JSON to TOML Converter"
      description="Convert JSON data to TOML configuration format"
      faqItems={faqItems}
      inputData={inputData}
      outputData={outputData}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="toml"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="TOML"
      outputIcon={<Settings className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      emptyStateContent={emptyStateContent}
    />
  );
}