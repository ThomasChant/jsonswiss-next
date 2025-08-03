
"use client";

import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { ImportMetadata, ImportSource } from "@/components/import/ImportJsonDialog";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { useClipboard } from "@/hooks/useClipboard";
import { CodeGenOptions, DartGenerator } from "@/lib/code-generators";
import {
    FileCode,
    Zap
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DartGeneratorPage() {
  const { resolvedTheme } = useTheme();
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: true,
    useOptional: true,
    rootName: 'DataModel',
    exportType: 'none',
    nullHandling: 'union',
    framework: 'plain'
  });
  
  const generator = new DartGenerator();
  const { copy } = useClipboard({ 
    successMessage: 'Dart code copied to clipboard',
    errorMessage: 'Failed to copy Dart code to clipboard'
  });

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    generateCode(jsonValue);
  };

  const generateCode = (jsonInput: string) => {
    if (!jsonInput.trim()) {
      setGeneratedCode("");
      setError("");
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      const result = generator.generate(data, options);
      setGeneratedCode(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGeneratedCode("");
    }
  };

  useEffect(() => {
    if (inputJson) {
      generateCode(inputJson);
    }
  }, [options]);

  const handleImport = (data: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    setInputJson(jsonString);
    generateCode(jsonString);
  };

  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
    if (inputJson) {
      generateCode(inputJson);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await copy(generatedCode);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/x-dart" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName.toLowerCase()}.dart`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Dart features are supported?",
      answer: "The generator creates Dart classes with proper type safety, supports both manual JSON serialization and json_annotation package, uses nullable types for null values, and follows Dart naming conventions."
    },
    {
      question: "How does json_annotation work?",
      answer: "When json_annotation framework is selected, generated classes use @JsonSerializable() annotation and generate fromJson/toJson methods automatically with build_runner. This provides type-safe JSON serialization."
    },
    {
      question: "How are nullable values handled?",
      answer: "Null values in JSON are mapped to nullable types (?) in Dart, providing null safety. Required fields use 'required' keyword in constructors, following Dart's null safety principles."
    },
    {
      question: "What about Dart's type system?",
      answer: "Generated Dart code leverages Dart's strong type system with appropriate types (int, double, String, bool, List, Map) and follows Dart conventions like camelCase for field names."
    }
  ];

  const settingsContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Class Name
        </label>
        <input
          type="text"
          value={options.rootName}
          onChange={(e) => handleOptionsChange({ rootName: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
          placeholder="DataModel"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Framework
        </label>
        <select
          value={options.framework}
          onChange={(e) => handleOptionsChange({ framework: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
        >
          <option value="plain">Plain Dart</option>
          <option value="json_annotation">json_annotation (Recommended)</option>
        </select>
      </div>
      {options.framework === 'json_annotation' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> When using json_annotation, you need to:
          </p>
          <ul className="mt-2 text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
            <li>Add dependencies: json_annotation, json_serializable, build_runner</li>
            <li>Run: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">dart pub run build_runner build</code></li>
          </ul>
        </div>
      )}
    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="dart"
      languageDisplayName="Dart"
      icon={<Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Dart classes"
      features="Classes with null safety and JSON serialization"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="Dart Generator"
      description="Generate Dart classes with null safety and JSON serialization from JSON data"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="dart"
      outputLanguageDisplayName="Dart"
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