
"use client";

import { useState } from "react";
import { Settings, FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { tomlToJson } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";
import { getReverseConverterInfo } from "@/lib/converter-mappings";

export default function TomlToJsonPage() {
  const [tomlInput, setTomlInput] = useState("");
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
    const tomlValue = value || "";
    setTomlInput(tomlValue);
    convertToJson(tomlValue);
  };

  const convertToJson = (tomlText: string) => {
    if (!tomlText.trim()) {
      setJsonOutput("");
      setError(null);
      return;
    }

    try {
      const jsonData = tomlToJson(tomlText);
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
    input.accept = ".toml,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setTomlInput(content);
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
      question: "What is TOML format?",
      answer: "TOML (Tom's Obvious Minimal Language) is a configuration file format that's easy to read due to obvious semantics. It's designed to map unambiguously to a hash table."
    },
    {
      question: "How are TOML sections converted?",
      answer: "TOML sections [section] become nested JSON objects. Dotted keys like 'database.host' create nested structures automatically."
    },
    {
      question: "What TOML features are supported?",
      answer: "Our converter supports strings, numbers, booleans, arrays, inline tables, nested sections, and basic date/time parsing. Complex multiline strings and advanced TOML features are partially supported."
    },
    {
      question: "Are array tables supported?",
      answer: "Yes! Array tables [[products]] are converted to JSON arrays containing objects. This is useful for representing repeated configuration blocks."
    }
  ];

  // Get reverse converter info
  const reverseConverter = getReverseConverterInfo('/converter/toml-to-json') || undefined;

  return (
    <ConverterLayout
      title="TOML to JSON Converter"
      description="Convert TOML configuration files to JSON format"
      faqItems={faqItems}
      inputData={tomlInput}
      outputData={jsonOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="toml"
      outputLanguage="json"
      inputLanguageDisplayName="TOML"
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