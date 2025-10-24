
"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { CSharpGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function CSharpGeneratorPage() {
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'C# code copied to clipboard' });
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: true,
    useOptional: true,
    rootName: 'DataModel',
    exportType: 'none',
    nullHandling: 'union',
    packageName: 'MyNamespace',
    framework: 'plain'
  });
  
  const generator = new CSharpGenerator();

  // Handle input change
  const handleInputChange = (value: string | undefined) => {
    const newValue = value || "";
    setInputJson(newValue);
    generateCode(newValue);
  };

  // Generate C# code
  const generateCode = (jsonInput?: string) => {
    const input = jsonInput !== undefined ? jsonInput : inputJson;
    if (!input.trim()) {
      setGeneratedCode("");
      setError(null);
      return;
    }

    try {
      const data = JSON.parse(input);
      const result = generator.generate(data, options);
      setGeneratedCode(result);
      setError(null);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format");
      } else {
        setError(err instanceof Error ? err.message : "Failed to generate C# code");
      }
      setGeneratedCode("");
    }
  };

  // Handle options change
  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    setOptions(prev => {
      const updated = { ...prev, ...newOptions };
      // Regenerate code with new options
      if (inputJson.trim()) {
        try {
          const data = JSON.parse(inputJson);
          const result = generator.generate(data, updated);
          setGeneratedCode(result);
          setError(null);
        } catch (err) {
          // Keep existing error state
        }
      }
      return updated;
    });
  };

  // Handle import
  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
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
    
    const blob = new Blob([generatedCode], { type: "text/x-csharp" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName}.cs`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What C# features are supported?",
      answer: "The generator creates C# classes with properties, supports JSON.NET and System.Text.Json attributes, records (C# 9+), and follows .NET naming conventions with proper namespaces."
    },
    {
      question: "Can I generate C# records instead of classes?",
      answer: "Yes! Select 'Record' as the framework to generate modern C# records with immutable properties, perfect for data transfer objects and value types."
    },
    {
      question: "How does JSON serialization work?",
      answer: "The generator supports both Newtonsoft.Json and System.Text.Json attributes for proper JSON serialization/deserialization with custom property names and null handling."
    },
    {
      question: "What about nullable reference types?",
      answer: "The generator includes nullable annotations (object?) for properties that can be null, following modern C# nullable reference types conventions."
    }
  ];

  const settingsContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Class Name</label>
        <input
          type="text"
          value={options.rootName}
          onChange={(e) => handleOptionsChange({ rootName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="DataModel"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Namespace</label>
        <input
          type="text"
          value={options.packageName}
          onChange={(e) => handleOptionsChange({ packageName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="MyApp.Models"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Framework</label>
        <select
          value={options.framework}
          onChange={(e) => handleOptionsChange({ framework: e.target.value as 'plain' | 'newtonsoft' | 'systemtext' | 'record' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="plain">Plain C# Classes</option>
          <option value="newtonsoft">Newtonsoft.Json</option>
          <option value="systemtext">System.Text.Json</option>
          <option value="record">C# Records</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Null Handling</label>
        <select
          value={options.nullHandling}
          onChange={(e) => handleOptionsChange({ nullHandling: e.target.value as 'union' | 'optional' | 'ignore' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="union">Union Types</option>
          <option value="optional">Optional</option>
          <option value="ignore">Ignore</option>
        </select>
      </div>
      

      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useInterfaces"
          checked={options.useInterfaces}
          onChange={(e) => handleOptionsChange({ useInterfaces: e.target.checked })}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        <label htmlFor="useInterfaces" className="text-sm">Generate Interfaces</label>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useOptional"
          checked={options.useOptional}
          onChange={(e) => handleOptionsChange({ useOptional: e.target.checked })}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        <label htmlFor="useOptional" className="text-sm">Use Nullable Types</label>
      </div>
    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="csharp"
      languageDisplayName="C#"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate C# classes and records"
      features="Classes, records, and properties with nullable types"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="JSON To C# Generator"
      description="Generate C# classes and records from JSON data structures"
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
      outputLanguage="csharp"
      outputLanguageDisplayName="C#"
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
    />
  );
}