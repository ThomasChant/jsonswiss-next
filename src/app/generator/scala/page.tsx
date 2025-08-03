
"use client";

import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { ImportMetadata, ImportSource } from "@/components/import/ImportJsonDialog";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { useClipboard } from "@/hooks/useClipboard";
import { CodeGenOptions, ScalaGenerator } from "@/lib/code-generators";
import { Code2, Layers } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ScalaGeneratorPage() {
  const { resolvedTheme } = useTheme();
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
    packageName: 'com.example',
    framework: 'plain'
  });
  
  const generator = useMemo(() => new ScalaGenerator(), []);
  const { copy } = useClipboard({ 
    successMessage: 'Scala code copied to clipboard',
    errorMessage: 'Failed to copy Scala code to clipboard'
  });

  // Generate Scala
  const generateScala = useCallback(() => {
    const data = inputJson;
    if (!data) return "";

    try {
      return generator.generate(data, options);
    } catch (err) {
      console.error('Scala generation error:', err);
      return "";
    }
  }, [generator, options]);

  // Update generated code when data or options change
  useEffect(() => {
    const newCode = generateScala();
    setGeneratedCode(newCode);
    setError(null);
  }, [generateScala]);

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
    
    const blob = new Blob([generatedCode], { type: "text/x-scala" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName}.scala`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Scala features are supported?",
      answer: "The generator creates Scala case classes with immutable fields, supports Circe and Play JSON frameworks for serialization, and follows Scala naming conventions with proper package structure."
    },
    {
      question: "Can I generate Circe-compatible classes?",
      answer: "Yes! Select 'Circe' as the framework to generate case classes with automatic JSON codec derivation using Circe's generic semi-automatic derivation."
    },
    {
      question: "How does Play JSON integration work?",
      answer: "When Play JSON framework is selected, the generator adds implicit Format instances for automatic JSON serialization/deserialization with Play Framework."
    },
    {
      question: "What about immutability and functional programming?",
      answer: "Generated Scala case classes are immutable by default, support pattern matching, and include automatic equals/hashCode/toString methods following functional programming principles."
    }
  ];

  const settingsContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Case Class Name
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
          Package Name
        </label>
        <input
          type="text"
          value={options.packageName || ''}
          onChange={(e) => handleOptionsChange({ packageName: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
          placeholder="com.example"
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
          <option value="plain">Plain Scala</option>
          <option value="circe">Circe JSON</option>
          <option value="play">Play JSON</option>
        </select>
      </div>

    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="scala"
      languageDisplayName="Scala"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Scala case classes"
      features="Immutable case classes with framework support"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="Scala Generator"
      description="Generate Scala case classes from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="scala"
      outputLanguageDisplayName="Scala"
      outputIcon={<Layers className="w-4 h-4" />}
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