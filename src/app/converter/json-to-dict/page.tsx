
"use client";

import { useState, useEffect } from "react";
import { FileText, Code2 } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { jsonToDict } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";
import { getReverseConverterInfo } from "@/lib/converter-mappings";

export default function JsonToDictPage() {
  const [inputJson, setInputJson] = useState("");
  const [dictOutput, setDictOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ 
    successMessage: 'Python dict copied to clipboard',
    errorMessage: 'Failed to copy Python dict to clipboard'
  });

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    convertToDict(jsonValue);
  };

  const convertToDict = (jsonInput?: string) => {
    const input = jsonInput !== undefined ? jsonInput : inputJson;
    if (!input.trim()) {
      setDictOutput("");
      setError(null);
      return;
    }

    try {
      const data = JSON.parse(input);
      const result = jsonToDict(data);
      setDictOutput(result);
      setError(null);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(err instanceof Error ? err.message : "Conversion failed");
      setDictOutput("");
    }
  };

  const handleCopy = async () => {
    if (dictOutput) {
      await copy(dictOutput);
    }
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    convertToDict(jsonString);
    setImportDialogOpen(false);
  };

  // Handle download
  const handleDownload = () => {
    if (!dictOutput) return;
    
    const blob = new Blob([dictOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.py";
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Python syntax is generated?",
      answer: "The converter generates valid Python dictionary and list syntax using single quotes for strings, None for null values, True/False for booleans, and proper nested structures."
    },
    {
      question: "How are JSON data types converted?",
      answer: "null → None, true/false → True/False, strings get single quotes, numbers remain unchanged, arrays become Python lists, objects become Python dicts."
    },
    {
      question: "Can I use the output directly in Python?",
      answer: "Yes! The generated output is valid Python syntax that can be directly copied into your Python code or saved as a .py file."
    },
    {
      question: "How are special characters handled?",
      answer: "Special characters in strings are properly escaped using Python string escape sequences. Unicode characters are preserved correctly."
    }
  ];

  // Get reverse converter info
  const reverseConverter = getReverseConverterInfo('/converter/json-to-dict') || undefined;

  return (
    <ConverterLayout
      title="JSON to Python Dict Converter"
      description="Convert JSON data to Python dictionary format"
      faqItems={faqItems}
      inputData={inputJson}
      outputData={dictOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="python"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="Python Dict"
      inputIcon={<FileText className="w-4 h-4" />}
      outputIcon={<Code2 className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      reverseConverter={reverseConverter}
    />
  );
}