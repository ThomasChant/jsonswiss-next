
"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { SQLGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function SqlGeneratorPage() {
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'SQL code copied to clipboard' });
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: true,
    useOptional: true,
    rootName: 'DataTable',
    exportType: 'none',
    nullHandling: 'union',
    sqlDialect: 'mysql',
    tableName: 'data_table',
    generateConstraints: false
  });
  
  const generator = new SQLGenerator();

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    generateSql(jsonValue);
  };

  const generateSql = (jsonInput: string) => {
    if (!jsonInput.trim()) {
      setGeneratedCode("");
      setError(null);
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      const result = generator.generate(data, options);
      setGeneratedCode(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SQL');
      setGeneratedCode("");
    }
  };

  const handleImport = (json: string, source: ImportSource, metadata?: ImportMetadata) => {
    setInputJson(json);
    generateSql(json);
    setImportDialogOpen(false);
  };

  const handleCopyCode = () => {
    copy(generatedCode);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "application/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.tableName || 'data_table'}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    if (inputJson) {
      generateSql(inputJson);
    }
  };

  const faqItems = [
    {
      question: "What SQL dialects are supported?",
      answer: "The generator supports MySQL, PostgreSQL, SQLite, and SQL Server dialects with appropriate data type mappings and syntax variations for each database system."
    },
    {
      question: "How are JSON data types mapped to SQL?",
      answer: "Numbers become INTEGER/DECIMAL, strings become VARCHAR/TEXT, booleans become BOOLEAN/INTEGER, arrays and objects are stored as JSON/TEXT depending on database support."
    },
    {
      question: "Can I generate CREATE TABLE statements?",
      answer: "Yes! The generator creates both CREATE TABLE statements based on your JSON structure and INSERT statements with your actual data values."
    },
    {
      question: "How does constraint generation work?",
      answer: "When enabled, the generator adds primary key constraints and NOT NULL constraints where appropriate based on your data structure and the selected SQL dialect."
    }
  ];

  const settingsContent = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">SQL Generation Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Table Name
            </label>
            <input
              type="text"
              value={options.tableName || ''}
              onChange={(e) => handleOptionsChange({ tableName: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
              placeholder="data_table"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              SQL Dialect
            </label>
            <select
              value={options.sqlDialect}
              onChange={(e) => handleOptionsChange({ sqlDialect: e.target.value as any })}
              className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlite">SQLite</option>
              <option value="sqlserver">SQL Server</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.generateConstraints}
                onChange={(e) => handleOptionsChange({ generateConstraints: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Generate Constraints</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add primary key and NOT NULL constraints where appropriate
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="sql"
      languageDisplayName="SQL"
      icon={<Database className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Add JSON data to generate SQL statements"
      features="CREATE TABLE statements with data types and constraints"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="JSON To SQL Generator"
      description="Generate SQL CREATE TABLE statements from JSON data"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      onInputChange={handleInputChange}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      onCopyCode={() => copy(generatedCode)}
      onDownload={handleDownload}
      onImport={handleImport}
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
      outputLanguage="sql"
      outputLanguageDisplayName="SQL"
    />
  );
}