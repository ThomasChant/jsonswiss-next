
"use client";

import { useState } from "react";
import { Code2, FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { dictToJson } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";

export default function DictToJsonPage() {
  const [dictInput, setDictInput] = useState("");
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
    const dictValue = value || "";
    setDictInput(dictValue);
    convertToJson(dictValue);
  };

  const convertToJson = (dictText: string) => {
    if (!dictText.trim()) {
      setJsonOutput("");
      setError(null);
      return;
    }

    try {
      const jsonData = dictToJson(dictText);
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
    input.accept = ".py,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setDictInput(content);
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
      question: "What Python dict syntax is supported?",
      answer: "We support standard Python dictionary and list syntax including single quotes, None, True/False values, nested structures, and tuples (converted to arrays)."
    },
    {
      question: "How are Python data types converted?",
      answer: "None → null, True/False → true/false, single quotes → double quotes, tuples → arrays. Numbers and strings are preserved with proper JSON formatting."
    },
    {
      question: "Can I paste Python code directly?",
      answer: "Yes! You can paste Python dict definitions, list comprehensions results, or any Python data structure that evaluates to a dict or list."
    },
    {
      question: "What about complex Python objects?",
      answer: "Only basic data types are supported: dict, list, tuple, str, int, float, bool, None. Custom objects need to be converted to basic types first."
    }
  ];

  return (
    <ConverterLayout
      title="Python Dict to JSON Converter"
      description="Convert Python dictionary format to JSON"
      faqItems={faqItems}
      inputData={dictInput}
      outputData={jsonOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="python"
      outputLanguage="json"
      inputLanguageDisplayName="Python Dict"
      outputLanguageDisplayName="JSON"
      inputIcon={<Code2 className="w-4 h-4" />}
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