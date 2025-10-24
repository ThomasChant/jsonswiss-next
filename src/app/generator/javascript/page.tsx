
"use client";

import { useState } from "react";
import { FileCode } from "lucide-react";
import { JavaScriptGenerator, CodeGenOptions } from "@/lib/code-generators";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function JavaScriptGeneratorPage() {
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'JavaScript code copied to clipboard' });
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: false,
    useOptional: false,
    rootName: 'Data',
    exportType: 'export',
    nullHandling: 'optional'
  });
  
  const generator = new JavaScriptGenerator();

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
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGeneratedCode("");
    }
  };

  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    if (inputJson) {
      generateCode(inputJson);
    }
  };

  const handleImport = (data: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    setInputJson(jsonString);
    generateCode(jsonString);
  };

  const handleCopyCode = async () => {
    await copy(generatedCode);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.rootName.toLowerCase()}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What JavaScript code structures can be generated from JSON?",
      answer: "The generator creates JavaScript classes, objects, and data structures based on your JSON input. It analyzes the JSON structure and generates corresponding ES6 classes, constructor functions, or plain object templates with proper property definitions."
    },
    {
      question: "Can I customize the generated JavaScript code style?",
      answer: "Yes, you can customize indentation size (2, 4, or 8 spaces), export type (ES6 export, declare, or none), root object name, and whether to generate classes or plain objects. The generator adapts to modern JavaScript standards."
    },
    {
      question: "How does the generator handle nested objects and arrays?",
      answer: "Nested objects are converted to nested classes or object properties, while arrays are represented with appropriate type annotations in comments. The generator maintains the hierarchical structure of your original JSON data."
    },
    {
      question: "Can I use the generated code directly in my JavaScript project?",
      answer: "Absolutely! The generated code follows JavaScript best practices and can be directly imported into your project. You can choose between different export formats to match your project's module system (ES6 modules, CommonJS, etc.)."
    }
  ];

  const settingsContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Root Name
        </label>
        <input
          type="text"
          value={options.rootName}
          onChange={(e) => handleOptionsChange({ rootName: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          placeholder="Data"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Export Type
        </label>
        <select
          value={options.exportType}
          onChange={(e) => handleOptionsChange({ exportType: e.target.value as 'export' | 'declare' | 'none' })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="export">ES6 Export</option>
          <option value="declare">Declare</option>
          <option value="none">None</option>
        </select>
      </div>

    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="javascript"
      languageDisplayName="JavaScript"
      icon={<FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Paste your JSON data to generate JavaScript classes and objects"
      codeExample={{
        comment: "// Example output for empty JSON:",
        lines: [
          { content: "class DataModel {", type: "keyword" },
          { content: "  constructor() {", type: "keyword" },
          { content: "    // 空对象，可以根据需要添加属性", type: "comment" },
          { content: "  }", type: "keyword" },
          { content: "}", type: "keyword" },
          { content: "", type: "normal" },
          { content: "export const DataModel = {};", type: "normal" }
        ]
      }}
      features="Generate ES6 classes, objects, and modern JavaScript patterns"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="JSON To JavaScript Generator"
      description="Generate JavaScript code from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="javascript"
      outputLanguageDisplayName="JavaScript"
      outputIcon={<FileCode className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopyCode={handleCopyCode}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
    />
  );
}