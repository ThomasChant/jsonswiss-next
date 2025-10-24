
"use client";

import { useState } from "react";
import { FileText, Settings } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { propertiesToJson } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";
import { getReverseConverterInfo } from "@/lib/converter-mappings";

export default function PropertiesToJsonPage() {
  const [propertiesInput, setPropertiesInput] = useState("");
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
    const propertiesValue = value || "";
    setPropertiesInput(propertiesValue);
    convertToJson(propertiesValue);
  };

  const convertToJson = (propertiesText: string) => {
    if (!propertiesText.trim()) {
      setJsonOutput("");
      setError(null);
      return;
    }

    try {
      const jsonData = propertiesToJson(propertiesText);
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
    input.accept = ".properties,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setPropertiesInput(content);
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
      question: "What is Properties format?",
      answer: "Properties files are simple text files used for configuration in Java applications. They contain key-value pairs separated by '=' or ':'."
    },
    {
      question: "How are nested objects handled?",
      answer: "Properties files don't support nested objects natively. Nested structures are typically represented using dot notation (e.g., database.host=localhost)."
    },
    {
      question: "What data types are supported?",
      answer: "The converter automatically detects numbers, booleans (true/false), and keeps strings as-is. Unicode escapes (\\uXXXX) are also supported."
    },
    {
      question: "How are comments handled?",
      answer: "Lines starting with '#' or '!' are treated as comments and ignored during conversion. Inline comments are not supported."
    },
    {
      question: "Can I use multiline values?",
      answer: "Yes! Use a backslash (\\) at the end of a line to continue the value on the next line. This is especially useful for long text values."
    }
  ];

  // Get reverse converter info
  const reverseConverter = getReverseConverterInfo('/converter/properties-to-json') || undefined;

  return (
    <ConverterLayout
      title="Properties to JSON Converter"
      description="Convert Java Properties configuration files to JSON format"
      faqItems={faqItems}
      inputData={propertiesInput}
      outputData={jsonOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="properties"
      outputLanguage="json"
      inputLanguageDisplayName="Properties"
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
      reverseConverter={reverseConverter}
    />
  );
}