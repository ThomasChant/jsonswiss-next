
"use client";

import { useState, useEffect } from "react";
import { Code2 } from "lucide-react";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { PythonGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function PythonGeneratorPage() {
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
    framework: 'dataclass'
  });
  
  const generator = new PythonGenerator();
  const { copy } = useClipboard({ 
    successMessage: 'Python code copied to clipboard',
    errorMessage: 'Failed to copy Python code to clipboard'
  });

  const handleInputChange = (value: string | undefined) => {
    setInputJson(value || "");
    generateCode(value);
  };

  const generateCode = (jsonInput?: string) => {
    try {
      setError(null);
      const input = (jsonInput !== undefined) ? jsonInput : inputJson;
      
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
        setError(err instanceof Error ? err.message : 'Failed to generate Python code');
      }
      setGeneratedCode("");
    }
  };

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
    
    const blob = new Blob([generatedCode], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName.toLowerCase()}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = () => {
    setImportDialogOpen(true);
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    generateCode(jsonString);
    setImportDialogOpen(false);
  };

  const faqItems = [
    {
      question: "What Python code structures can be generated from JSON?",
      answer: "The Python generator creates dataclasses, plain Python classes, or Pydantic models based on your JSON input. It analyzes the JSON structure and generates corresponding Python code with proper type hints and validation."
    },
    {
      question: "Does the generator support modern Python features like type hints?",
      answer: "Yes! The Python generator uses modern Python features including type hints from the typing module, dataclasses, and optional typing. It's compatible with Python 3.8+ and follows current Python best practices."
    },
    {
      question: "Can I choose between different Python class styles?",
      answer: "Absolutely! You can generate dataclasses (recommended), plain Python classes, or Pydantic models depending on your project needs. Each style has different benefits for validation, serialization, and performance."
    },
    {
      question: "How are Python naming conventions handled?",
      answer: "The generator automatically converts camelCase JSON field names to snake_case Python field names while preserving the original structure. Type hints are properly applied based on the JSON data types."
    }
  ];

  // 设置面板内容
  const settingsPanel = (
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
          Style
        </label>
        <select
          value={options.framework}
          onChange={(e) => handleOptionsChange({ framework: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
        >
          <option value="dataclass">Dataclass</option>
          <option value="plain">Plain Class</option>
          <option value="pydantic">Pydantic Model</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Null Handling
        </label>
        <select
          value={options.nullHandling}
          onChange={(e) => handleOptionsChange({ nullHandling: e.target.value as any })}
          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
        >
          <option value="optional">Optional Types</option>
          <option value="union">Union with None</option>
          <option value="ignore">Ignore Nulls</option>
        </select>
      </div>


    </div>
  );

  // 空状态内容 - 使用新的组件
  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="python"
      languageDisplayName="Python"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Python classes"
      codeExample={{
        comment: "# Example output for empty JSON:",
        lines: [
          { content: "from dataclasses import dataclass", type: "keyword" },
          { content: "from typing import Optional, List, Dict, Any", type: "keyword" },
          { content: "", type: "normal" },
          { content: "@dataclass", type: "normal" },
          { content: "class DataModel:", type: "class" },
          { content: "    # 空类，可以根据需要添加属性", type: "comment" },
          { content: "    pass", type: "normal" }
        ]
      }}
      features="Supports dataclasses, Pydantic models, and plain classes"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="JSON To Python Generator"
      description="Generate Python dataclasses and classes from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="python"
      outputLanguageDisplayName="Python"
      outputIcon={<Code2 className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopyCode={handleCopyCode}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      settingsPanel={settingsPanel}
      emptyStateContent={emptyStateContent}
    />
  );
}
