
"use client";

import { useEffect, useState } from "react";
import { Code2 } from "lucide-react";
import { CodeGeneratorLayoutServer } from "@/components/layout/CodeGeneratorLayoutServer";  
import { CodeGeneratorEmptyState } from "@/components/generator/CodeGeneratorEmptyState";
import { JavaGenerator, CodeGenOptions } from "@/lib/code-generators";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";
import { getInitialCachedJson, setCachedRawJson } from "@/lib/json-cache";

export default function JavaGeneratorPage() {
  const [inputJson, setInputJson] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'Java code copied to clipboard' });
  
  const [options, setOptions] = useState<CodeGenOptions>({
    useInterfaces: true,
    useOptional: true,
    rootName: 'DataModel',
    exportType: 'none',
    nullHandling: 'union',
    packageName: 'com.example',
    framework: 'plain'
  });
  
  const generator = new JavaGenerator();

  // Handle input change
  const handleInputChange = (value: string | undefined) => {
    const newValue = value || "";
    setCachedRawJson(newValue);
    setInputJson(newValue);
    generateCode(newValue);
  };

  // Generate Java code
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
        setError(err instanceof Error ? err.message : "Failed to generate Java code");
      }
      setGeneratedCode("");
    }
  };

  // Handle options change
  const handleOptionsChange = (newOptions: Partial<CodeGenOptions>) => {
    setOptions(prev => {
      const updated = { ...prev, ...newOptions };
      // Regenerate code with new options
      if (inputJson.trim()) {
        try {
          const data = JSON.parse(inputJson);
          const result = generator.generate(data, updated);
          setGeneratedCode(result);
          setError(null);
        } catch (err) {
          // Keep existing error state
        }
      }
      return updated;
    });
  };

  // Handle import
  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    generateCode(jsonString);
    setCachedRawJson(jsonString);
  };

  // Prefill from local cache on mount
  useEffect(() => {
    if (!inputJson) {
      const cached = getInitialCachedJson();
      if (cached) {
        setInputJson(cached);
        generateCode(cached);
      }
    }
  }, []);

  const handleCopyCode = async () => {
    if (generatedCode) {
      await copy(generatedCode);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: "text/x-java-source" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.rootName}.java`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What Java features are supported?",
      answer: "The generator creates Java classes with proper constructors, getters/setters, and supports Jackson annotations for JSON serialization, Lombok for boilerplate reduction, and standard Java conventions."
    },
    {
      question: "Can I generate Lombok-compatible classes?",
      answer: "Yes! Select 'Lombok' as the framework to generate classes with @Data, @AllArgsConstructor, and @NoArgsConstructor annotations, eliminating boilerplate code."
    },
    {
      question: "How does Jackson integration work?",
      answer: "When Jackson framework is selected, the generator adds @JsonProperty annotations to fields for proper JSON serialization/deserialization with custom property names."
    },
    {
      question: "What about package structure?",
      answer: "You can specify custom package names in the options. The generator will add the appropriate package declaration at the top of the generated Java file."
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
        <label className="block text-sm font-medium mb-2">Framework</label>
        <select
          value={options.framework}
          onChange={(e) => handleOptionsChange({ framework: e.target.value as 'plain' | 'jackson' | 'lombok' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="plain">Plain Java</option>
          <option value="jackson">Jackson</option>
          <option value="lombok">Lombok</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Null Handling</label>
        <select
          value={options.nullHandling}
          onChange={(e) => handleOptionsChange({ nullHandling: e.target.value as 'union' | 'optional' | 'ignore' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="union">Union Types</option>
          <option value="optional">Optional</option>
          <option value="ignore">Ignore</option>
        </select>
      </div>
      

      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useInterfaces"
          checked={options.useInterfaces}
          onChange={(e) => handleOptionsChange({ useInterfaces: e.target.checked })}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        <label htmlFor="useInterfaces" className="text-sm">Generate Interfaces</label>
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
      language="java"
      languageDisplayName="Java"
      icon={<Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      description="Enter JSON data to generate Java classes"
      codeExample={{
        comment: "// Example output for empty JSON:",
        lines: [
          { content: "public class DataModel {", type: "keyword" },
          { content: "  // 空类，可以根据需要添加字段", type: "comment" },
          { content: "", type: "normal" },
          { content: "  public DataModel() {}", type: "keyword" },
          { content: "}", type: "keyword" }
        ]
      }}
      features="Supports POJOs, Lombok, and Jackson annotations"
    />
  );

  return (
    <CodeGeneratorLayoutServer
      title="JSON To Java Generator"
      description="Generate Java POJOs and classes from JSON data structures"
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
      outputLanguage="java"
      outputLanguageDisplayName="Java"
      settingsPanel={settingsContent}
      emptyStateContent={emptyStateContent}
    />
  );
}
