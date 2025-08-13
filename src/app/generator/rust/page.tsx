
"use client";

import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";
import { useClipboard } from "@/hooks/useClipboard";
import { CodeGenOptions, RustGenerator } from "@/lib/code-generators";
import { Code2, Wrench } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

export default function RustGeneratorPage() {
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
    nullHandling: 'optional',
    framework: 'plain'
  });
  
  const generator = useMemo(() => new RustGenerator(), []);
  const { copy } = useClipboard({ 
    successMessage: 'Rust code copied to clipboard',
    errorMessage: 'Failed to copy Rust code to clipboard'
  });

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

  const handleImport = (data: any) => {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    setInputJson(jsonString);
    handleInputChange(jsonString);
  };

  const handleCopyCode = async () => {
    await copy(generatedCode);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/x-rust" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName.toLowerCase()}.rs`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Rust features are supported?",
      answer: "The generator creates Rust structs with proper ownership, supports Serde serialization/deserialization, and follows Rust naming conventions with memory safety guarantees."
    },
    {
      question: "Can I generate Serde-compatible structs?",
      answer: "Yes! Select 'Serde' as the framework to generate structs with #[derive(Serialize, Deserialize)] attributes for automatic JSON serialization with the serde crate."
    },
    {
      question: "How does Option handling work?",
      answer: "Rust generator uses Option<T> for nullable fields by default, ensuring memory safety and explicit null handling following Rust's ownership model."
    },
    {
      question: "What about borrowing and lifetimes?",
      answer: "Generated Rust structs use owned types (String instead of &str) to avoid lifetime complexity, making them easier to use while maintaining Rust's safety guarantees."
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
          <option value="plain">Plain Rust</option>
          <option value="serde">Serde</option>
          <option value="tokio">Tokio + Serde</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Null Handling
        </label>
        <select
           value={options.nullHandling}
           onChange={(e) => handleOptionsChange({ nullHandling: e.target.value as 'optional' | 'union' | 'ignore' })}
           className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
         >
           <option value="optional">Option&lt;T&gt;</option>
           <option value="union">Union Types</option>
         </select>
      </div>

    </div>
  );

  const emptyStateContent = (
    <CodeGeneratorEmptyState
      language="rust"
      languageDisplayName="Rust"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Rust structs"
      features="Memory-safe structs with ownership"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="Rust Generator"
      description="Generate Rust structs from JSON data structures"
      faqItems={faqItems}
      inputJson={inputJson}
      generatedCode={generatedCode}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      outputLanguage="rust"
      outputLanguageDisplayName="Rust"
      outputIcon={<Wrench className="w-4 h-4" />}
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