
"use client";

import { useState } from "react";
import { FileText, Settings } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { iniToJson } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";

export default function IniToJsonPage() {
  const [iniInput, setIniInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { copy } = useClipboard({ 
    successMessage: 'JSON copied to clipboard',
    errorMessage: 'Failed to copy JSON to clipboard'
  });

  const handleInputChange = (value: string | undefined) => {
    const iniValue = value || "";
    setIniInput(iniValue);
    convertToJson(iniValue);
  };

  const convertToJson = (iniText: string) => {
    if (!iniText.trim()) {
      setJsonOutput("");
      setError(null);
      return;
    }

    try {
      const jsonData = iniToJson(iniText);
      const formattedJson = JSON.stringify(jsonData, null, 2);
      setJsonOutput(formattedJson);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setJsonOutput("");
    }
  };

  // Handle file import
  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ini,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setIniInput(content);
          handleInputChange(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleCopy = async () => {
    if (jsonOutput) {
      await copy(jsonOutput);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!jsonOutput) return;
    
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What is INI format?",
      answer: "INI files are configuration files that store data in sections with key-value pairs. They're commonly used in Windows applications and system configurations."
    },
    {
      question: "How are INI sections converted to JSON?",
      answer: "INI sections become JSON objects. Global key-value pairs (outside sections) are placed at the root level, while sectioned data creates nested objects."
    },
    {
      question: "What data types are supported?",
      answer: "The converter automatically detects numbers, booleans (true/false), and null values. Arrays can be represented as comma-separated values in INI."
    },
    {
      question: "Can I convert nested JSON back to INI?",
      answer: "Yes! Use our JSON to INI converter. Nested objects become INI sections, and arrays are converted to comma-separated values."
    }
  ];

  return (
    <ConverterLayout
      title="INI to JSON Converter"
      description="Convert INI configuration files to JSON format"
      faqItems={faqItems}
      inputData={iniInput}
      outputData={jsonOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="ini"
      outputLanguage="json"
      inputLanguageDisplayName="INI"
      outputLanguageDisplayName="JSON"
      inputIcon={<Settings className="w-4 h-4" />}
      outputIcon={<FileText className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onFileImport={handleFileImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
    />
  );
}