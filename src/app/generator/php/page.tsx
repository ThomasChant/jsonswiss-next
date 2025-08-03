
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { Editor } from "@monaco-editor/react";
import { Download, Copy, Settings2, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { ImportJsonDialog, ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";
import { PHPGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";

export default function PhpGeneratorPage() {
  const { resolvedTheme } = useTheme();
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: true,
    useOptional: true,
    rootName: 'DataClass',
    exportType: 'none',
    nullHandling: 'union',
    namespace: '',
    framework: 'plain'
  });
  
  const generator = useMemo(() => new PHPGenerator(), []);
  const { copy } = useClipboard({ 
    successMessage: 'PHP code copied to clipboard',
    errorMessage: 'Failed to copy PHP code to clipboard'
  });

  // Handle input change
  const handleInputChange = (value: string | undefined) => {
    const newValue = value || "";
    setInputJson(newValue);
    generatePhp(newValue);
  };

  // Generate PHP
  const generatePhp = useCallback((jsonInput: string = inputJson) => {
    if (!jsonInput || typeof jsonInput !== 'string' || !jsonInput.trim()) {
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
      setError(err instanceof Error ? err.message : "Generation failed");
      setGeneratedCode("");
    }
  }, [inputJson, generator, options]);

  // Update output when options change
  useEffect(() => {
    if (inputJson && typeof inputJson === 'string' && inputJson.trim()) {
      generatePhp();
    }
  }, [options, generatePhp]);

  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    generatePhp(jsonString);
    setImportDialogOpen(false);
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await copy(generatedCode);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "application/x-php" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName}.php`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const faqItems = [
    {
      question: "What PHP features are supported?",
      answer: "The generator creates PHP classes with type hints (PHP 7.4+), getters/setters, constructors, and supports various frameworks like Laravel Eloquent models and plain PHP classes."
    },
    {
      question: "Can I generate Laravel Eloquent models?",
      answer: "Yes! Select 'Laravel' as the framework to generate Eloquent model classes that extend the base Model class with proper imports and Laravel conventions."
    },
    {
      question: "How are PHP namespaces handled?",
      answer: "You can specify a custom namespace in the options. The generator will add the appropriate namespace declaration at the top of the generated PHP file."
    },
    {
      question: "What about PHP type hints and strict typing?",
      answer: "The generator uses modern PHP type hints for method parameters and return types, supporting bool, int, float, string, and array types based on your JSON data."
    }
  ];

  // Settings content
  const settingsContent = (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">PHP Generation Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Class Name
          </label>
          <input
            type="text"
            value={options.rootName}
            onChange={(e) => handleOptionsChange({ rootName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="DataClass"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Namespace
          </label>
          <input
            type="text"
            value={options.namespace || ''}
            onChange={(e) => handleOptionsChange({ namespace: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="App\\Models"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Framework
          </label>
          <select
            value={options.framework}
            onChange={(e) => handleOptionsChange({ framework: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="plain">Plain PHP</option>
            <option value="laravel">Laravel Eloquent</option>
          </select>
        </div>


      </div>
    </div>
  );

  // Empty state content
  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="php"
      languageDisplayName="PHP"
      icon={<Code className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate PHP code"
      features="Classes with getters and setters"
    />
  );

  return (
    <>
      <CodeGeneratorLayoutServer
        title="PHP Generator"
        description="Generate PHP classes from JSON data structures"
        faqItems={faqItems}
        inputJson={inputJson}
        generatedCode={generatedCode}
        error={error}
        isInputMaximized={isInputMaximized}
        isOutputMaximized={isOutputMaximized}
        showSettings={showSettings}
        importDialogOpen={importDialogOpen}
        outputLanguage="php"
        outputLanguageDisplayName="PHP"
        outputIcon={<Code className="w-4 h-4" />}
        onInputChange={handleInputChange}
        onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
        onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
        onToggleSettings={handleToggleSettings}
        onToggleImportDialog={(open) => setImportDialogOpen(open)}
        onCopyCode={handleCopyCode}
        onDownload={handleDownload}
        onImport={handleImport}
        settingsPanel={settingsContent}
        emptyStateContent={emptyStateContent}
      />
      
      <ImportJsonDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
    </>
  );
}