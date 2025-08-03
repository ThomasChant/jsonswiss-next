
"use client";

import { ImportMetadata, ImportSource } from "@/components/import/ImportJsonDialog";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { JsonSchemaGenerator } from "@/lib/json-utils";
import { FileJson2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function SchemaGeneratorPage() {
  const [inputJson, setInputJson] = useState("");
  const [outputSchema, setOutputSchema] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'Schema copied to clipboard' });
  
  const schemaGenerator = useMemo(() => new JsonSchemaGenerator(), []);



  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    setError(null);
    setOutputSchema("");
    generateSchema(jsonValue);
  };

  const generateSchema = useCallback((jsonInput: string) => {
    if (!jsonInput.trim()) {
      setOutputSchema("");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const schema = schemaGenerator.generateSchema(parsed);
      setOutputSchema(JSON.stringify(schema, null, 2));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutputSchema("");
    }
  }, [schemaGenerator]);

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    handleInputChange(jsonString);
  };

  const handleCopyOutput = async () => {
    if (outputSchema) {
      await copy(outputSchema);
    }
  };

  const handleDownload = () => {
    if (!outputSchema) return;
    
    const blob = new Blob([outputSchema], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleInputMaximize = () => {
    setIsInputMaximized(!isInputMaximized);
    if (isOutputMaximized) setIsOutputMaximized(false);
  };

  const handleToggleOutputMaximize = () => {
    setIsOutputMaximized(!isOutputMaximized);
    if (isInputMaximized) setIsInputMaximized(false);
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const faqItems = [
    {
      question: "What is a JSON Schema?",
      answer: "JSON Schema is a vocabulary that allows you to annotate and validate JSON documents. It provides a contract for what JSON data is required for a given application and how to interact with it."
    },
    {
      question: "How do I generate a schema from my JSON data?",
      answer: "Simply paste your JSON data into the input editor. The schema will be automatically generated based on your data structure, including data types, required fields, and patterns."
    },
    {
      question: "What information is included in the generated schema?",
      answer: "The generated schema includes data types, required properties, property descriptions, array item definitions, object structure, and validation constraints based on your JSON data patterns."
    },
    {
      question: "Can I customize the generated schema?",
      answer: "Yes! After generation, you can copy the schema and modify it to add additional constraints, descriptions, or validation rules as needed for your specific use case."
    }
  ];

  const settingsPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-generate on input change</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Enabled</span>
      </div>
      <button
        onClick={() => generateSchema(inputJson)}
        disabled={!inputJson || !inputJson.trim()}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors w-full justify-center"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Regenerate Schema</span>
      </button>
    </div>
  );

  // 空状态内容
  const emptyStateContent = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center max-w-md">
        <FileJson2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Generate JSON Schema
        </h3>
        <p className="text-sm mb-4">
          Enter your JSON data on the left to automatically generate a corresponding JSON Schema
        </p>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          <p>• Supports nested objects and arrays</p>
          <p>• Auto-detects data types</p>
          <p>• Generates validation rules</p>
        </div>
      </div>
    </div>
  );

  return (
    <ConverterLayout
      title="JSON Schema Generator"
      description="Generate JSON schemas from your JSON data automatically with type detection and validation rules"
      faqItems={faqItems}
      inputData={inputJson}
      outputData={outputSchema}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="json"
      inputLanguageDisplayName="JSON Data"
      outputLanguageDisplayName="JSON Schema"
      inputIcon={<FileJson2 className="w-4 h-4 text-blue-500" />}
      outputIcon={<FileJson2 className="w-4 h-4 text-green-500" />}
      onInputChange={handleInputChange}
      onCopy={handleCopyOutput}
      onDownload={handleDownload}
      onToggleInputMaximize={handleToggleInputMaximize}
      onToggleOutputMaximize={handleToggleOutputMaximize}
      onToggleSettings={handleToggleSettings}
      onToggleImportDialog={setImportDialogOpen}
      settingsPanel={settingsPanel}
      onImport={handleImport}
      emptyStateContent={emptyStateContent}
    />
  );
}