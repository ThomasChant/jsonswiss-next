
"use client";

import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { ImportMetadata, ImportSource } from "@/components/import/ImportJsonDialog";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { useClipboard } from "@/hooks/useClipboard";
import { CodeGenOptions, RubyGenerator } from "@/lib/code-generators";
import { useJsonStore } from "@/store/jsonStore";
import { Code2, Gem } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function RubyGeneratorPage() {
  const { resolvedTheme } = useTheme();
  const { jsonData, selectedPath, getNodeAtPath } = useJsonStore();
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
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
  
  const generator = useMemo(() => new RubyGenerator(), []);
  const { copy } = useClipboard({ 
    successMessage: 'Ruby code copied to clipboard',
    errorMessage: 'Failed to copy Ruby code to clipboard'
  });

  // Get the data to convert
  const getDataToConvert = useCallback(() => {
    if (selectedPath.length > 0) {
      return getNodeAtPath(selectedPath);
    }
    return jsonData;
  }, [selectedPath, getNodeAtPath, jsonData]);

  // Generate Ruby
  const generateRuby = useCallback(() => {
    const data = getDataToConvert();
    if (!data) return "";

    try {
      return generator.generate(data, options);
    } catch (err) {
      console.error('Ruby generation error:', err);
      return "";
    }
  }, [getDataToConvert, generator, options]);

  // Update generated code when data or options change
  useEffect(() => {
    const newCode = generateRuby();
    setGeneratedCode(newCode);
    setError(null);
  }, [generateRuby]);

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    
    if (!jsonValue.trim()) {
      setGeneratedCode("");
      setError(null);
      return;
    }

    try {
      const parsedData = JSON.parse(jsonValue);
      const result = generator.generate(parsedData, options);
      setGeneratedCode(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGeneratedCode("");
    }
  };

  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  const handleImport = (data: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    setInputJson(jsonString);
    handleInputChange(jsonString);
  };

  const handleCopyCode = async () => {
    await copy(generatedCode);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/x-ruby" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName.toLowerCase()}.rb`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Ruby features are supported?",
      answer: "The generator creates Ruby classes with attr_accessor methods, supports ActiveModel serialization, and follows Ruby naming conventions with proper module structure."
    },
    {
      question: "Can I generate ActiveModel-compatible classes?",
      answer: "Yes! Select 'ActiveModel' as the framework to generate classes with ActiveModel::Serialization support for automatic JSON serialization in Rails applications."
    },
    {
      question: "How does Dry-Struct integration work?",
      answer: "When Dry-Struct framework is selected, the generator creates immutable struct classes with type checking and coercion using the dry-struct gem."
    },
    {
      question: "What about Ruby conventions and style?",
      answer: "Generated Ruby code follows standard conventions: snake_case for methods and variables, CamelCase for classes, and proper indentation with 2 spaces by default."
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
          <option value="plain">Plain Ruby</option>
          <option value="activemodel">ActiveModel</option>
          <option value="dry-struct">Dry-Struct</option>
        </select>
      </div>

    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="ruby"
      languageDisplayName="Ruby"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Ruby classes"
      features="Elegant Ruby classes with framework support"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="Ruby Generator"
      description="Generate Ruby classes from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="ruby"
      outputLanguageDisplayName="Ruby"
      outputIcon={<Gem className="w-4 h-4" />}
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