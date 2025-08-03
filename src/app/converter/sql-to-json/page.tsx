
"use client";

import { useState } from "react";
import { Database, FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { sqlToJson } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";

export default function SqlToJsonPage() {
  const [sqlInput, setSqlInput] = useState("");
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
    const sqlValue = value || "";
    setSqlInput(sqlValue);
    convertToJson(sqlValue);
  };

  const convertToJson = (sqlText: string) => {
    if (!sqlText.trim()) {
      setJsonOutput("");
      setError(null);
      return;
    }

    try {
      const jsonData = sqlToJson(sqlText);
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
    input.accept = ".sql,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setSqlInput(content);
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
      question: "What SQL statements are supported?",
      answer: "Currently supports INSERT INTO statements with VALUES clause. Each INSERT statement becomes a JSON object with column names as keys and the table name stored in '_table' field."
    },
    {
      question: "How are SQL data types converted?",
      answer: "NULL → null, quoted strings → strings, numbers → numbers, TRUE/FALSE → booleans. Complex values are treated as strings and may need additional parsing."
    },
    {
      question: "Can I process multiple INSERT statements?",
      answer: "Yes! The converter processes all INSERT statements in the input and creates an array of JSON objects, one for each INSERT statement."
    },
    {
      question: "What about other SQL statements?",
      answer: "Currently only INSERT statements are supported. CREATE TABLE, SELECT, UPDATE, and DELETE statements are not processed but won't cause errors."
    }
  ];

  return (
    <ConverterLayout
      title="SQL to JSON Converter"
      description="Convert SQL INSERT statements to JSON format"
      faqItems={faqItems}
      inputData={sqlInput}
      outputData={jsonOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="sql"
      outputLanguage="json"
      inputLanguageDisplayName="SQL"
      outputLanguageDisplayName="JSON"
      inputIcon={<Database className="w-4 h-4" />}
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