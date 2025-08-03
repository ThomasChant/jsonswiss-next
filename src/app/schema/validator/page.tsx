
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Editor } from "@monaco-editor/react";
import { 
  FileJson2, 
  CheckCircle2, 
  AlertCircle,
  Upload
} from "lucide-react";
import { validateJsonSchema } from "@/lib/json-utils";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function SchemaValidatorPage() {
  const { resolvedTheme } = useTheme();
  const [inputJson, setInputJson] = useState("");
  const [schemaJson, setSchemaJson] = useState("");
  const [validationResult, setValidationResult] = useState<{valid: boolean; errors: string[]} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<'data' | 'schema'>('data');
  const { copy } = useClipboard({ successMessage: 'Validation result copied to clipboard' });

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    setError(null);
    setValidationResult(null);
    // Auto-validate if schema is available
    if (schemaJson.trim()) {
      setTimeout(() => validateWithSchema(jsonValue, schemaJson), 100);
    }
  };

  const handleSchemaChange = (value: string | undefined) => {
    const schemaValue = value || "";
    setSchemaJson(schemaValue);
    setValidationResult(null);
    setError(null);
    // Auto-validate if JSON data is available
    if (inputJson.trim()) {
      setTimeout(() => validateWithSchema(inputJson, schemaValue), 100);
    }
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

  const validateWithSchema = (jsonData?: string, schemaData?: string) => {
    const dataToValidate = jsonData || inputJson;
    const schemaToUse = schemaData || schemaJson;
    
    if (!dataToValidate.trim() || !schemaToUse.trim()) {
      setValidationResult(null);
      setError(null);
      return;
    }

    try {
      const data = JSON.parse(dataToValidate);
      const schema = JSON.parse(schemaToUse);
      const result = validateJsonSchema(data, schema);
      setValidationResult(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON or schema");
      setValidationResult(null);
    }
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = JSON.stringify(json, null, 2);
    if (importTarget === 'data') {
      setInputJson(jsonString);
      handleInputChange(jsonString);
    } else {
      setSchemaJson(jsonString);
      handleSchemaChange(jsonString);
    }
  };

  const openImportDialog = (target: 'data' | 'schema') => {
    setImportTarget(target);
    setImportDialogOpen(true);
  };

  const handleCopyOutput = async () => {
    if (validationResult) {
      await copy(JSON.stringify(validationResult, null, 2));
    }
  };

  const handleDownload = () => {
    if (!validationResult) return;
    
    const content = JSON.stringify(validationResult, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validation-result.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What is JSON Schema validation?",
      answer: "JSON Schema validation is the process of checking whether a JSON document conforms to a given schema. It verifies data types, required properties, constraints, and structure rules defined in the schema."
    },
    {
      question: "How do I validate JSON against a schema?",
      answer: "Provide your JSON data in the input editor and your schema in the settings panel. Validation will happen automatically as you type."
    },
    {
      question: "What validation errors might I encounter?",
      answer: "Common validation errors include type mismatches, missing required properties, additional properties not allowed by the schema, string length violations, and number range violations."
    },
    {
      question: "Can I use custom JSON schemas?",
      answer: "Yes! You can import or paste any valid JSON Schema (Draft 4, 6, 7, or 2019-09) to validate your JSON data against specific business rules and constraints."
    }
  ];

  const outputData = validationResult ? JSON.stringify(validationResult, null, 2) : "";

  const settingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">JSON Schema</label>
          <button
            onClick={() => openImportDialog('schema')}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            <Upload className="w-3 h-3" />
            <span>Import</span>
          </button>
        </div>
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <Editor
            height="200px"
            defaultLanguage="json"
            value={schemaJson}
            onChange={handleSchemaChange}
            theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              wordWrap: "on",
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>
      <button
        onClick={() => validateWithSchema()}
        disabled={!inputJson || !inputJson.trim() || !schemaJson || !schemaJson.trim()}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors w-full justify-center"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Validate Against Schema</span>
      </button>
    </div>
  );

  // 空状态内容
  const emptyStateContent = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center max-w-md">
        {validationResult?.valid ? (
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
        ) : validationResult?.valid === false ? (
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        ) : (
          <FileJson2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        )}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {validationResult?.valid ? 'Validation Passed' : validationResult?.valid === false ? 'Validation Failed' : 'Validate JSON Data'}
        </h3>
        <p className="text-sm mb-4">
          {validationResult?.valid 
            ? 'Your JSON data is valid according to the schema'
            : validationResult?.valid === false 
            ? 'Your JSON data does not conform to the schema'
            : 'Enter JSON data and schema to validate data structure and constraints'
          }
        </p>
        {!validationResult && (
          <div className="text-xs text-slate-400 dark:text-slate-500">
            <p>• Validates data types and structure</p>
            <p>• Checks required properties</p>
            <p>• Verifies constraints and formats</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ConverterLayout
      title="JSON Schema Validator"
      description="Validate JSON data against JSON schemas to ensure data integrity and compliance"
      faqItems={faqItems}
      inputData={inputJson}
      outputData={outputData}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="json"
      inputLanguageDisplayName="JSON Data"
      outputLanguageDisplayName="Validation Results"
      inputIcon={<FileJson2 className="w-4 h-4 text-blue-500" />}
      outputIcon={validationResult?.valid ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : validationResult?.valid === false ? <AlertCircle className="w-4 h-4 text-red-500" /> : <FileJson2 className="w-4 h-4 text-purple-500" />}
      onInputChange={handleInputChange}
      onCopy={handleCopyOutput}
      onDownload={handleDownload}
      onToggleInputMaximize={handleToggleInputMaximize}
      onToggleOutputMaximize={handleToggleOutputMaximize}
      onToggleSettings={handleToggleSettings}
      onToggleImportDialog={() => openImportDialog('data')}
      settingsPanel={settingsPanel}
      onImport={handleImport}
      emptyStateContent={emptyStateContent}
    />
  );
}