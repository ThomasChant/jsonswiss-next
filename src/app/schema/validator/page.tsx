
"use client";

import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { 
  FileJson2, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Maximize2,
  Minimize2,
  Copy,
  Download,
  Trash2,
  Settings
} from "lucide-react";
import { validateJsonSchema } from "@/lib/json-utils";
import { getInitialCachedJson, setCachedRawJson, clearCachedJson } from "@/lib/json-cache";
import { ToolPageLayoutServer } from "@/components/layout/ToolPageLayoutServer";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";
import { ImportJsonDialog } from "@/components/import";
import { cn } from "@/lib/utils";

export default function SchemaValidatorPage() {
  // 提供默认的示例内容
  const defaultJsonData = '{\n  "name": "John Doe",\n  "age": 30,\n  "email": "john@example.com",\n  "address": {\n    "street": "123 Main St",\n    "city": "New York",\n    "zipCode": "10001"\n  }\n}';
  
  const defaultSchema = '{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" },\n    "age": { "type": "number", "minimum": 0 },\n    "email": { "type": "string", "format": "email" },\n    "address": {\n      "type": "object",\n      "properties": {\n        "street": { "type": "string" },\n        "city": { "type": "string" },\n        "zipCode": { "type": "string", "pattern": "^\\\\d{5}$" }\n      },\n      "required": ["street", "city", "zipCode"]\n    }\n  },\n  "required": ["name", "age", "email", "address"]\n}';

  const [inputJson, setInputJson] = useState(defaultJsonData);
  const [schemaJson, setSchemaJson] = useState(defaultSchema);
  const [validationResult, setValidationResult] = useState<{valid: boolean; errors: string[]} | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 三栏布局状态管理
  const [isJsonMaximized, setIsJsonMaximized] = useState(false);
  const [isSchemaMaximized, setIsSchemaMaximized] = useState(false);
  const [isResultMaximized, setIsResultMaximized] = useState(false);
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<'data' | 'schema'>('data');
  const { copy } = useClipboard({ successMessage: 'Validation result copied to clipboard' });

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    setError(null);
    setValidationResult(null);
    setCachedRawJson(jsonValue);
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

  // 三栏布局的最大化/最小化逻辑
  const handleToggleJsonMaximize = () => {
    setIsJsonMaximized(!isJsonMaximized);
    if (isSchemaMaximized) setIsSchemaMaximized(false);
    if (isResultMaximized) setIsResultMaximized(false);
  };

  const handleToggleSchemaMaximize = () => {
    setIsSchemaMaximized(!isSchemaMaximized);
    if (isJsonMaximized) setIsJsonMaximized(false);
    if (isResultMaximized) setIsResultMaximized(false);
  };

  const handleToggleResultMaximize = () => {
    setIsResultMaximized(!isResultMaximized);
    if (isJsonMaximized) setIsJsonMaximized(false);
    if (isSchemaMaximized) setIsSchemaMaximized(false);
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

  // Prefill JSON data from cache
  useEffect(() => {
    if (!inputJson || inputJson === defaultJsonData) {
      const cached = getInitialCachedJson();
      if (cached) {
        setInputJson(cached);
        // Auto-validate if schema is available
        if (schemaJson.trim()) {
          setTimeout(() => validateWithSchema(cached, schemaJson), 100);
        }
      }
    }
  }, []);

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

  // 确定布局网格类
  const getGridClasses = () => {
    if (isJsonMaximized) return "grid-cols-1";
    if (isSchemaMaximized) return "grid-cols-1";
    if (isResultMaximized) return "grid-cols-1";
    return "grid-cols-3";
  };

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
    <ToolPageLayoutServer
      title="JSON Schema Validator"
      description="Validate JSON data against JSON schemas to ensure data integrity and compliance"
      faqItems={faqItems}
      showSidebar={false}
    >
      <div className="h-full flex flex-col min-h-0">
        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex-shrink-0">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Three Column Layout */}
        <div className="p-2 min-h-0 min-h-core-min max-h-core-max h-core-default">
          <div className={cn("grid gap-2 h-full min-h-0", getGridClasses())}>
            
            {/* JSON Data Input */}
            {!isSchemaMaximized && !isResultMaximized && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <FileJson2 className="w-4 h-4 text-blue-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">JSON Data</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openImportDialog('data')}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Import JSON Data"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        clearCachedJson();
                        setInputJson("");
                        setError(null);
                        setValidationResult(null);
                      }}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Clear JSON data"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setInputJson(defaultJsonData);
                        setError(null);
                        setValidationResult(null);
                        // Auto-validate with current schema
                        if (schemaJson.trim()) {
                          setTimeout(() => validateWithSchema(defaultJsonData, schemaJson), 100);
                        }
                      }}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Reset to default JSON data"
                    >
                      <FileJson2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleToggleJsonMaximize}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title={isJsonMaximized ? "Minimize" : "Maximize"}
                    >
                      {isJsonMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0" style={{ minHeight: '300px' }}>
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={inputJson}
                    onChange={(val) => {
                      setCachedRawJson(val || '');
                      handleInputChange(val);
                    }}
                    theme="vs"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "var(--font-mono)",
                      wordWrap: "on",
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      renderLineHighlight: 'none',
                      cursorBlinking: 'smooth',
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Schema Input */}
            {!isJsonMaximized && !isResultMaximized && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">JSON Schema</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openImportDialog('schema')}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Import JSON Schema"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSchemaJson("");
                        setError(null);
                        setValidationResult(null);
                      }}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Clear JSON schema"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSchemaJson(defaultSchema);
                        setError(null);
                        setValidationResult(null);
                        // Auto-validate with current JSON data
                        if (inputJson.trim()) {
                          setTimeout(() => validateWithSchema(inputJson, defaultSchema), 100);
                        }
                      }}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Reset to default JSON schema"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleToggleSchemaMaximize}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title={isSchemaMaximized ? "Minimize" : "Maximize"}
                    >
                      {isSchemaMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0" style={{ minHeight: '300px' }}>
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={schemaJson}
                    onChange={handleSchemaChange}
                    theme="vs"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "var(--font-mono)",
                      wordWrap: "on",
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      renderLineHighlight: 'none',
                      cursorBlinking: 'smooth',
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Validation Results */}
            {!isJsonMaximized && !isSchemaMaximized && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    {validationResult?.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : validationResult?.valid === false ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <FileJson2 className="w-4 h-4 text-purple-500" />
                    )}
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Validation Results</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCopyOutput}
                      disabled={!outputData}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copy validation results"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={!outputData}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download validation results"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleToggleResultMaximize}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title={isResultMaximized ? "Minimize" : "Maximize"}
                    >
                      {isResultMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0" style={{ minHeight: '300px' }}>
                  {outputData ? (
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      value={outputData}
                      theme="vs"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "var(--font-mono)",
                        wordWrap: "on",
                        readOnly: true,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        renderLineHighlight: 'none',
                        cursorBlinking: 'smooth',
                      }}
                    />
                  ) : (
                    emptyStateContent
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ImportJsonDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
        title={`Import JSON ${importTarget === 'data' ? 'Data' : 'Schema'}`}
        description={`Import JSON ${importTarget === 'data' ? 'data' : 'schema'} for validation`}
      />
    </ToolPageLayoutServer>
  );
}
