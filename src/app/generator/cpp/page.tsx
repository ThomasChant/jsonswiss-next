"use client";

import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { useClipboard } from "@/hooks/useClipboard";
import { CodeGenOptions, CppGenerator } from "@/lib/code-generators";
import { Code2, FileCode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function CppGeneratorPage() {
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
    rootName: 'DataClass',
    exportType: 'none',
    nullHandling: 'optional',
    framework: 'plain'
  });
  
  const generator = useMemo(() => new CppGenerator(), []);
  const { copy } = useClipboard({ 
    successMessage: 'C++ code copied to clipboard',
    errorMessage: 'Failed to copy C++ code to clipboard'
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
    
    const blob = new Blob([generatedCode], { type: "text/x-c++src" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName}.hpp`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What C++ features are supported?",
      answer: "The generator creates modern C++ classes with constructors, getter/setter methods, JSON serialization/deserialization functionality, and supports STL containers and smart pointers."
    },
    {
      question: "How is JSON serialization handled?",
      answer: "Generated classes include toJson() and fromJson() methods that work with nlohmann/json library for JSON data serialization and deserialization."
    },
    {
      question: "Which C++ standards are supported?",
      answer: "Generated code is compatible with C++11 and above, uses std::string, std::vector and other STL containers, with optional smart pointer support."
    },
    {
      question: "How are nested objects handled?",
      answer: "Nested objects generate corresponding class definitions, arrays are mapped to std::vector, supporting complex nested data structures."
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
          placeholder="DataClass"
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
          <option value="plain">Plain C++</option>
          <option value="nlohmann">nlohmann/json</option>
          <option value="boost">Boost.PropertyTree</option>
        </select>
      </div>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.useOptional}
            onChange={(e) => handleOptionsChange({ useOptional: e.target.checked })}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Use Smart Pointers</span>
        </label>
      </div>
    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="cpp"
      languageDisplayName="C++"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate C++ classes"
      features="Modern C++ classes with JSON serialization support"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="C++ Generator"
      description="Generate C++ classes from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="cpp"
      outputLanguageDisplayName="C++"
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