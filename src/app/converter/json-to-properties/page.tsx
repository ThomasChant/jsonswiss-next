
"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";
import { jsonToProperties } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";

export default function JsonToPropertiesPage() {
  // Local state
  const [inputData, setInputData] = useState("");
  const [outputData, setOutputData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const { copy } = useClipboard({ 
    successMessage: 'Properties copied to clipboard',
    errorMessage: 'Failed to copy Properties to clipboard'
  });

  // Convert JSON to Properties
  const convert = (jsonStr: string): string => {
    if (!jsonStr.trim()) return "";

    try {
      const data = JSON.parse(jsonStr);
      return jsonToProperties(data);
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
    a.download = "config.properties";
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
      answer: "Nested objects are flattened using dot notation. For example, {\"database\": {\"host\": \"localhost\"}} becomes database.host=localhost."
    },
    {
      question: "How are arrays handled in Properties format?",
      answer: "Arrays are converted using indexed keys. For example, [\"a\", \"b\", \"c\"] becomes array.0=a, array.1=b, array.2=c."
    },
    {
      question: "Can I convert JSON data directly?",
      answer: "Yes! You can paste JSON directly into the input editor or import JSON data from various sources using the import button."
    },
    {
      question: "How are special characters handled?",
      answer: "Special characters like =, :, #, !, newlines, and Unicode characters are automatically escaped according to Properties format standards."
    },
    {
      question: "What data types are preserved?",
      answer: "Boolean values (true/false) and numbers are preserved as-is. Null values become empty strings. Strings are escaped as needed."
    }
  ];

  const emptyStateContent = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center">
        <FileText className="w-16 h-16 mx-auto mb-6 opacity-60" />
        <p>Add JSON data to see Properties output</p>
        <p className="text-sm mt-2">Your converted Properties configuration will appear here</p>
      </div>
    </div>
  );

  return (
    <ConverterLayout
      title="JSON to Properties Converter"
      description="Convert JSON data to Java Properties configuration file format"
      faqItems={faqItems}
      inputData={inputData}
      outputData={outputData}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="properties"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="Properties"
      outputIcon={<FileText className="w-4 h-4" />}
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
