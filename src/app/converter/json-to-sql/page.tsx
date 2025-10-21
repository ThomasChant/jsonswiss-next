
"use client";

import { useState, useEffect } from "react";
import { Database, FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { jsonToSql } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function JsonToSqlPage() {
  const [inputJson, setInputJson] = useState("");
  const [sqlOutput, setSqlOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [options, setOptions] = useState({
    tableName: "data_table",
    includeCreate: false,
    dialect: 'mysql' as 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver' | 'oracle',
  });
  const { copy } = useClipboard({ 
    successMessage: 'SQL copied to clipboard',
    errorMessage: 'Failed to copy SQL to clipboard'
  });

  const handleInputChange = (value: string | undefined) => {
    setInputJson(value || "");
    convertToSql(value || "");
  };

  // Convert JSON to SQL
  const convertToSql = (jsonInput?: string) => {
    const input = jsonInput !== undefined ? jsonInput : inputJson;
    if (!input.trim()) {
      setSqlOutput("");
      setError(null);
      return;
    }

    try {
      const data = JSON.parse(input);
      // Ensure data is an array for SQL conversion
      const arrayData = Array.isArray(data) ? data : [data];
      const result = jsonToSql(arrayData, {
        tableName: options.tableName,
        includeCreate: options.includeCreate,
        dialect: options.dialect,
      });
      setSqlOutput(result);
      setError(null);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(err instanceof Error ? err.message : "Conversion failed");
      setSqlOutput("");
    }
  };

  // Update output when options change
  useEffect(() => {
    if (inputJson.trim()) {
      convertToSql();
    }
  }, [options]);

  // Handle copy
  const handleCopy = async () => {
    if (sqlOutput) {
      await copy(sqlOutput);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!sqlOutput) return;
    
    const blob = new Blob([sqlOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.tableName}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    convertToSql(jsonString);
    setImportDialogOpen(false);
  };

  const faqItems = [
    {
      question: "What JSON structures can be converted to SQL?",
      answer: "Arrays of objects work best as each object becomes a table row. Single objects are converted to single INSERT statements. Nested objects are serialized as JSON strings."
    },
    {
      question: "How are JSON data types handled?",
      answer: "Strings are quoted and escaped, numbers remain as-is, booleans become TRUE/FALSE, null becomes NULL, and complex objects/arrays are JSON-encoded as strings."
    },
    {
      question: "Can I customize the table structure?",
      answer: "Yes! You can set custom table names, include CREATE TABLE statements with TEXT columns, and control which part of your JSON to convert."
    },
    {
      question: "What about table relationships?",
      answer: "If your JSON objects have a '_table' field, that value will be used as the table name for that specific record, allowing multi-table INSERT generation."
    }
  ];

  const settingsContent = (
    <div>
      <h3 className="text-sm font-medium mb-3">SQL Generation Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Database Dialect
          </label>
          <select
            value={options.dialect}
            onChange={(e) => setOptions(prev => ({ ...prev, dialect: e.target.value as any }))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm"
          >
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="oracle">Oracle</option>
            <option value="sqlserver">SQL Server</option>
            <option value="sqlite">SQLite</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Table Name
          </label>
          <input
            type="text"
            value={options.tableName}
            onChange={(e) => setOptions(prev => ({ ...prev, tableName: e.target.value }))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm"
            placeholder="data_table"
          />
        </div>
        
        <div className="flex items-center space-x-3 pt-6">
          <input
            type="checkbox"
            id="includeCreate"
            checked={options.includeCreate}
            onChange={(e) => setOptions(prev => ({ ...prev, includeCreate: e.target.checked }))}
            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
          />
          <label htmlFor="includeCreate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Include CREATE TABLE statement
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <ConverterLayout
      title="JSON to SQL Converter"
      description="Convert JSON to SQL for MySQL, PostgreSQL, Oracle, SQL Server, and SQLite"
      faqItems={faqItems}
      inputData={inputJson}
      outputData={sqlOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="sql"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="SQL"
      inputIcon={<FileText className="w-4 h-4" />}
      outputIcon={<Database className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      settingsPanel={settingsContent}
    />
  );
}
