
"use client";

import { useState } from "react";
import { FileCode,Code2 } from "lucide-react";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { GoGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function GoGeneratorPage() {
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'Go code copied to clipboard' });
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: true,
    useOptional: true,
    rootName: 'Data',
    exportType: 'none',
    nullHandling: 'union',
    packageName: 'main',
    framework: 'json'
  });
  
  const generator = new GoGenerator();

  const handleInputChange = (value: string | undefined) => {
    setInputJson(value || "");
    if (value) {
      generateCode(value);
    } else {
      setGeneratedCode("");
      setError("");
    }
  };

  const generateCode = async (jsonInput: string) => {
    try {
      setError("");
      
      if (!jsonInput.trim()) {
        setGeneratedCode("");
        return;
      }

      const parsedData = JSON.parse(jsonInput);
      const generator = new GoGenerator();
      const result = generator.generate(parsedData, options);
      setGeneratedCode(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate Go code");
      setGeneratedCode("");
    }
  };

  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
    if (inputJson) {
      generateCode(inputJson);
    }
  };

  const handleImport = (data: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = JSON.stringify(data, null, 2);
    setInputJson(jsonString);
    generateCode(jsonString);
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await copy(generatedCode);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName.toLowerCase()}.go`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Go features are supported?",
      answer: "The generator creates Go structs with proper field names, JSON tags for marshaling/unmarshaling, and appropriate Go data types following Go naming conventions."
    },
    {
      question: "How are JSON tags handled?",
      answer: "The generator automatically adds JSON tags to struct fields for proper serialization. You can also enable YAML or XML tags if needed for multi-format support."
    },
    {
      question: "Can I customize the package name?",
      answer: "Yes! You can specify any package name in the options. The default is 'main' but you can use your own package names like 'models', 'types', etc."
    },
    {
      question: "How are Go naming conventions handled?",
      answer: "The generator automatically converts JSON field names to proper Go field names (PascalCase for exported fields) while preserving the original names in JSON tags."
    }
  ];

  const settingsContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Struct Name
        </label>
        <input
          type="text"
          value={options.rootName}
          onChange={(e) => handleOptionsChange({ rootName: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
          placeholder="Data"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Package Name
        </label>
        <input
          type="text"
          value={options.packageName || ''}
          onChange={(e) => handleOptionsChange({ packageName: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
          placeholder="main"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Struct Tags
        </label>
        <select
          value={options.framework}
          onChange={(e) => handleOptionsChange({ framework: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
        >
          <option value="json">JSON tags</option>
          <option value="json,yaml">JSON + YAML tags</option>
          <option value="json,xml">JSON + XML tags</option>
          <option value="none">No tags</option>
        </select>
      </div>
    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="go"
      languageDisplayName="Go"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Go structs"
      features="Structs with proper field names and JSON tags"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="Go Generator"
      description="Generate Go structs from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="go"
      outputLanguageDisplayName="Go"
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
  )
}