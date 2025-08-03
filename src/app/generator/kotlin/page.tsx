"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { KotlinGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function KotlinGeneratorPage() {
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'Kotlin code copied to clipboard' });
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: true,
    useOptional: true,
    rootName: 'DataModel',
    exportType: 'none',
    nullHandling: 'optional',
    packageName: 'com.example',
    framework: 'kotlinx'
  });
  
  const generator = new KotlinGenerator();

  // 处理输入变化
  const handleInputChange = (value: string | undefined) => {
    const newValue = value || "";
    setInputJson(newValue);
    generateCode(newValue);
  };

  // 生成Kotlin代码
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
        setError(err instanceof Error ? err.message : "Failed to generate Kotlin code");
      }
      setGeneratedCode("");
    }
  };

  // 处理选项变化
  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    setOptions(prev => {
      const updated = { ...prev, ...newOptions };
      // 使用新选项重新生成代码
      if (inputJson.trim()) {
        try {
          const data = JSON.parse(inputJson);
          const result = generator.generate(data, updated);
          setGeneratedCode(result);
          setError(null);
        } catch (err) {
          // 保持现有错误状态
        }
      }
      return updated;
    });
  };

  // 处理导入
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
    
    const blob = new Blob([generatedCode], { type: "text/x-kotlin-source" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName}.kt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Kotlin features are supported?",
      answer: "The generator creates Kotlin data classes with support for kotlinx.serialization, Gson, and Jackson annotations for JSON serialization, plus modern Kotlin language features like null safety and data classes."
    },
    {
      question: "Can I generate kotlinx.serialization compatible classes?",
      answer: "Yes! Choose 'kotlinx' as the framework to generate classes with @Serializable and @SerialName annotations for type-safe JSON serialization support."
    },
    {
      question: "How does Gson and Jackson integration work?",
      answer: "When selecting Gson or Jackson frameworks, the generator adds appropriate annotations (@SerializedName or @JsonProperty) to fields for proper JSON serialization/deserialization."
    },
    {
      question: "How is package structure handled?",
      answer: "You can specify a custom package name in the options. The generator will add the appropriate package declaration at the top of the generated Kotlin file."
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
        <label className="block text-sm font-medium mb-2">Package Name</label>
        <input
          type="text"
          value={options.packageName}
          onChange={(e) => handleOptionsChange({ packageName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="com.example"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Serialization Framework</label>
        <select
          value={options.framework}
          onChange={(e) => handleOptionsChange({ framework: e.target.value as 'kotlinx' | 'gson' | 'jackson' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="kotlinx">kotlinx.serialization</option>
          <option value="gson">Gson</option>
          <option value="jackson">Jackson</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Null Handling</label>
        <select
          value={options.nullHandling}
          onChange={(e) => handleOptionsChange({ nullHandling: e.target.value as 'union' | 'optional' | 'ignore' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="optional">Optional Types</option>
          <option value="union">Union Types</option>
          <option value="ignore">Ignore</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useOptional"
          checked={options.useOptional}
          onChange={(e) => handleOptionsChange({ useOptional: e.target.checked })}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        <label htmlFor="useOptional" className="text-sm">Use Optional Types</label>
      </div>
    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="kotlin"
      languageDisplayName="Kotlin"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Kotlin data classes"
      codeExample={{
        comment: "// Example output for empty JSON:",
        lines: [
          { content: "@Serializable", type: "keyword" },
          { content: "data class DataModel(", type: "keyword" },
          { content: "    // Empty class, add properties as needed", type: "comment" },
          { content: ")", type: "keyword" }
        ]
      }}
      features="Supports data classes, kotlinx.serialization and null safety"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="Kotlin Generator"
      description="Generate Kotlin data classes and models from JSON data structures"
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
      outputLanguage="kotlin"
      outputLanguageDisplayName="Kotlin"
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
    />
  );
}