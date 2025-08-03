
"use client";

import { useState, useEffect } from "react";
import { FileCode } from "lucide-react";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { GroovyGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function GroovyGeneratorPage() {
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
    rootName: 'DataModel',
    exportType: 'none',
    nullHandling: 'union',
    packageName: 'com.example',
    framework: 'plain'
  });
  
  const generator = new GroovyGenerator();
  const { copy } = useClipboard({ 
    successMessage: 'Groovy code copied to clipboard',
    errorMessage: 'Failed to copy Groovy code to clipboard'
  });

  const handleInputChange = (value: string | undefined) => {
    setInputJson(value || "");
    generateCode(value);
  };

  const generateCode = (jsonInput?: string) => {
    try {
      setError(null);
      const input = jsonInput || inputJson;
      
      if (!input.trim()) {
        setGeneratedCode("");
        return;
      }

      const parsedData = JSON.parse(input);
      const code = generator.generate(parsedData, options);
      setGeneratedCode(code);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON: ' + err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to generate Groovy code');
      }
      setGeneratedCode("");
    }
  };

  useEffect(() => {
    generateCode();
  }, [options]);

  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    setOptions(prev => {
      const updated = { ...prev, ...newOptions };
      // 重新生成代码
      setTimeout(() => generateCode(), 0);
      return updated;
    });
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await copy(generatedCode);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/x-groovy" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName}.groovy`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    generateCode(jsonString);
    setImportDialogOpen(false);
  };

  const faqItems = [
    {
      question: "What Groovy features are supported?",
      answer: "The generator creates Groovy classes with dynamic properties, supports @Canonical transform for automatic equals/hashCode/toString, and follows Groovy's flexible typing conventions."
    },
    {
      question: "Can I generate classes with @Canonical transform?",
      answer: "Yes! Select 'Canonical' as the framework to generate classes with @Canonical annotation, which automatically provides equals, hashCode, toString, and constructor methods."
    },
    {
      question: "How does dynamic typing work?",
      answer: "Groovy supports both dynamic and static typing. You can choose to generate classes with explicit type declarations or use Groovy's dynamic 'def' keyword for flexible runtime typing."
    },
    {
      question: "What about Groovy's concise syntax?",
      answer: "Generated Groovy code leverages Groovy's concise syntax with automatic property generation, optional parentheses, and simplified class definitions for readable, maintainable code."
    }
  ];

  const settingsContent = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <option value="plain">Plain Groovy</option>
          <option value="canonical">@Canonical</option>
          <option value="typed">Static Typing</option>
        </select>
      </div>


    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="groovy"
      languageDisplayName="Groovy"
      icon={<FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Groovy code"
      features="Dynamic and flexible classes"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="Groovy Generator"
      description="Generate Groovy classes from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="groovy"
      outputLanguageDisplayName="Groovy"
      onInputChange={handleInputChange}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      onCopyCode={handleCopyCode}
      onDownload={handleDownload}
      onImport={handleImport}
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
    />
  );
}