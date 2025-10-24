
"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { TypeScriptGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function TypeScriptGeneratorPage() {
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'TypeScript code copied to clipboard' });
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: true,
    useOptional: true,
    rootName: 'RootType',
    exportType: 'export',
    nullHandling: 'union'
  });
  
  const generator = new TypeScriptGenerator();

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    generateCode(jsonValue);
  };

  const generateCode = (jsonInput: string) => {
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
      setError(err instanceof Error ? err.message : 'Failed to generate TypeScript code');
      setGeneratedCode("");
    }
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    generateCode(jsonString);
  };

  const handleCopyCode = () => {
    copy(generatedCode);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName.toLowerCase()}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    if (inputJson) {
      generateCode(inputJson);
    }
  };

  const faqItems = [
    {
      question: "What TypeScript features are supported in the generated code?",
      answer: "The generator creates TypeScript interfaces, types, and classes with full type safety. It supports optional properties, union types, nested interfaces, array types, and proper null handling. The generated code is compatible with the latest TypeScript standards."
    },
    {
      question: "How does the generator handle complex nested JSON structures?",
      answer: "Complex nested objects are converted to separate TypeScript interfaces with proper type relationships. Arrays are typed correctly, and the generator creates a hierarchy of types that matches your JSON structure while maintaining type safety."
    },
    {
      question: "Can I customize null and undefined handling in the generated types?",
      answer: "Yes, you can choose between different null handling strategies: optional properties with '?', union types with '| null', or ignoring null values entirely. This gives you flexibility in how strict you want your types to be."
    },
    {
      question: "Is the generated TypeScript code ready for production use?",
      answer: "Absolutely! The generated code follows TypeScript best practices, includes proper exports, and can be directly imported into your TypeScript projects. The interfaces are designed to be maintainable and follow standard naming conventions."
    }
  ];

  const settingsContent = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">TypeScript Generation Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Root Type Name
            </label>
            <input
              type="text"
              value={options.rootName}
              onChange={(e) => handleOptionsChange({ rootName: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
              placeholder="RootType"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Export Type
            </label>
            <select
              value={options.exportType}
              onChange={(e) => handleOptionsChange({ exportType: e.target.value as any })}
              className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
            >
              <option value="export">Export</option>
              <option value="declare">Declare</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Null Handling
            </label>
            <select
              value={options.nullHandling}
              onChange={(e) => handleOptionsChange({ nullHandling: e.target.value as any })}
              className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
            >
              <option value="optional">Optional (?)</option>
              <option value="union">Union (| null)</option>
              <option value="ignore">Ignore</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.useInterfaces}
                onChange={(e) => handleOptionsChange({ useInterfaces: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Use Interfaces</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
              Generate interfaces instead of type aliases
            </p>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.useOptional}
                onChange={(e) => handleOptionsChange({ useOptional: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Use Optional Properties</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
              Mark properties as optional when they might be undefined
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="typescript"
      languageDisplayName="TypeScript"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Add JSON data to generate TypeScript types"
      codeExample={{
        comment: "// Example output for empty JSON:",
        lines: [
          { content: "export interface RootType {", type: "keyword" },
          { content: "  // 空对象，可以根据需要添加属性", type: "comment" },
          { content: "}", type: "keyword" },
          { content: "", type: "normal" },
          { content: "export const roottype: RootType = {};", type: "normal" }
        ]
      }}
      features="Generates interfaces, types, and strongly-typed objects"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="JSON To TypeScript Generator"
      description="Generate TypeScript interfaces and types from JSON data structures"
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
      onCopyCode={handleCopyCode}
      onDownload={handleDownload}
      onImport={handleImport}
      outputLanguage="typescript"
      outputLanguageDisplayName="TypeScript"
      outputIcon={<Code2 className="w-4 h-4" />}
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
    />
  );
}