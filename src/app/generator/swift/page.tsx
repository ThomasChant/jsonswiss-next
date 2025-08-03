
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Editor } from "@monaco-editor/react";
import { 
  Download, 
  Copy, 
  FileCode,
  Upload,
  Maximize2,
  Minimize2,
  Settings,
  FileText,
  Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { SwiftGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function SwiftGeneratorPage() {
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
    framework: 'codable'
  });
  
  const generator = new SwiftGenerator();
  const { copy } = useClipboard({ 
    successMessage: 'Swift code copied to clipboard',
    errorMessage: 'Failed to copy Swift code to clipboard'
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
    
    const blob = new Blob([generatedCode], { type: "text/x-swift" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName}.swift`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Swift features are supported?",
      answer: "The generator creates Swift structs with proper type safety, supports Codable protocol for JSON serialization/deserialization, uses optional types for null values, and follows Swift naming conventions."
    },
    {
      question: "How does Codable protocol work?",
      answer: "When Codable framework is selected, generated structs automatically conform to Codable protocol, enabling seamless JSON encoding/decoding with JSONEncoder and JSONDecoder."
    },
    {
      question: "How are optional values handled?",
      answer: "Null values in JSON are mapped to optional types (?) in Swift, providing type safety and requiring explicit unwrapping, following Swift's approach to null safety."
    },
    {
      question: "What about Swift's type system?",
      answer: "Generated Swift code leverages Swift's strong type system with appropriate types (Int, Double, String, Bool, [Any], [String: Any]) and value semantics using structs for immutable data models."
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
          <option value="codable">Codable (Recommended)</option>
          <option value="plain">Plain Swift</option>
        </select>
      </div>

    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="swift"
      languageDisplayName="Swift"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Swift structs"
      features="Structs with Codable support and type safety"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="Swift Generator"
      description="Generate Swift structs with Codable support from JSON data"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="swift"
      outputLanguageDisplayName="Swift"
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