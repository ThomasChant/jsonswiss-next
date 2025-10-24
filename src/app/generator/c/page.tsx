"use client";

import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { useClipboard } from "@/hooks/useClipboard";
import { CodeGenOptions, CGenerator } from "@/lib/code-generators";
import { Code2, FileCode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function CGeneratorPage() {
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
    rootName: 'DataStruct',
    exportType: 'none',
    nullHandling: 'optional',
    framework: 'plain'
  });
  
  const generator = useMemo(() => new CGenerator(), []);
  const { copy } = useClipboard({ 
    successMessage: 'C code copied to clipboard',
    errorMessage: 'Failed to copy C code to clipboard'
  });

  // 处理输入变化
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

  // 处理选项变化
  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  // 处理导入
  const handleImport = (data: any) => {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    setInputJson(jsonString);
    handleInputChange(jsonString);
  };

  // 当选项变化时重新生成代码
  useEffect(() => {
    if (!inputJson.trim()) {
      setGeneratedCode("");
      setError(null);
      return;
    }

    try {
      const parsedData = JSON.parse(inputJson);
      const result = generator.generate(parsedData, options);
      setGeneratedCode(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGeneratedCode("");
    }
  }, [inputJson, options, generator]);

  const handleCopyCode = async () => {
    await copy(generatedCode);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/x-csrc" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName.toLowerCase()}.h`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What C features are supported?",
      answer: "The generator creates standard C struct definitions with memory management functions (create and free), supports basic data type mapping, and follows C naming conventions."
    },
    {
      question: "How is memory management handled?",
      answer: "Generated code includes create_ and free_ functions for safe memory allocation and deallocation. String fields require manual memory allocation."
    },
    {
      question: "Does it support JSON-C library?",
      answer: "Select 'JSON-C' framework to generate code compatible with json-c library, including appropriate header file references."
    },
    {
      question: "How are complex data types handled?",
      answer: "Arrays are mapped to void** pointers, nested objects to void* pointers. Type casting and memory management are required based on actual needs."
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
          placeholder="DataStruct"
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
          <option value="plain">Plain C</option>
          <option value="json-c">JSON-C Library</option>
        </select>
      </div>
    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="c"
      languageDisplayName="C"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate C structs"
      features="Memory-safe structs with management functions"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="JSON To C Generator"
      description="Generate C structs from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="c"
      outputLanguageDisplayName="C"
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