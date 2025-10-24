
"use client";

import { useState } from "react";
import { 
  FileText, 
  Code
} from "lucide-react";
import { yamlToJson } from "@/lib/converters";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { getReverseConverterInfo } from "@/lib/converter-mappings";

export default function YamlToJsonPage() {
  const [inputYaml, setInputYaml] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { copy } = useClipboard({ successMessage: 'JSON copied to clipboard' });

  const handleInputChange = (value: string | undefined) => {
    const yamlValue = value || "";
    setInputYaml(yamlValue);
    convertYamlToJson(yamlValue);
  };

  const convertYamlToJson = (yamlInput: string) => {
    if (!yamlInput.trim()) {
      setOutputJson("");
      setError(null);
      return;
    }

    try {
      const result = yamlToJson(yamlInput);
      setOutputJson(JSON.stringify(result, null, 2));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion error");
      setOutputJson("");
    }
  };

  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".yaml,.yml,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInputYaml(content);
          handleInputChange(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleCopyJson = async () => {
    if (outputJson) {
      await copy(outputJson);
    }
  };

  const handleDownload = () => {
    if (!outputJson) return;
    
    const blob = new Blob([outputJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What YAML features are supported in the conversion?",
      answer: "The converter supports standard YAML features including scalars, sequences (arrays), mappings (objects), multi-line strings, and basic YAML syntax. Complex YAML features like anchors and references may have limited support."
    },
    {
      question: "How are YAML comments handled during conversion?",
      answer: "YAML comments are typically stripped during conversion to JSON since JSON doesn't support comments. The conversion focuses on the data structure rather than preserving comments."
    },
    {
      question: "Can I convert complex nested YAML structures?",
      answer: "Yes, the converter can handle deeply nested YAML structures with multiple levels of objects and arrays. The resulting JSON will maintain the same hierarchical structure."
    },
    {
      question: "What happens to YAML data types during conversion?",
      answer: "YAML data types are converted to their JSON equivalents: strings remain strings, numbers become JSON numbers, booleans stay as booleans, and null values are preserved. YAML's additional data types are converted to their closest JSON representation."
    }
  ];

  // Get reverse converter info
  const reverseConverter = getReverseConverterInfo('/converter/yaml-to-json') || undefined;

  return (
    <ConverterLayout
      title="YAML to JSON Converter"
      description="Convert YAML data to JSON format with real-time preview"
      faqItems={faqItems}
      inputData={inputYaml}
      outputData={outputJson}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="yaml"
      outputLanguage="json"
      inputLanguageDisplayName="YAML"
      outputLanguageDisplayName="JSON"
      inputIcon={<Code className="w-4 h-4" />}
      outputIcon={<FileText className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopyJson}
      onDownload={handleDownload}
      onFileImport={handleFileImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      reverseConverter={reverseConverter}
    />
  );
}