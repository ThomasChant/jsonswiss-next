
"use client";

import { useState } from "react";
import { FileCode, FileText } from "lucide-react";
import { xmlToJson } from "@/lib/converters";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { getReverseConverterInfo } from "@/lib/converter-mappings";
// 移除了多格式导入对话框的导入

export default function XmlToJsonPage() {
  const [inputXml, setInputXml] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // 移除了多格式导入对话框状态
  const { copy } = useClipboard({ successMessage: 'JSON copied to clipboard' });

  const handleInputChange = (value: string | undefined) => {
    const xmlValue = value || "";
    setInputXml(xmlValue);
    convertXmlToJson(xmlValue);
  };

  const convertXmlToJson = (xmlInput: string) => {
    if (!xmlInput.trim()) {
      setOutputJson("");
      setError(null);
      return;
    }

    try {
      const result = xmlToJson(xmlInput);
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
    input.accept = ".xml";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInputXml(content);
          handleInputChange(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleCopy = async () => {
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
      question: "What XML features are supported in the conversion?",
      answer: "The converter supports standard XML elements, attributes, text content, and CDATA sections. It handles nested structures and converts them to appropriate JSON objects and arrays."
    },
    {
      question: "How are XML attributes handled in the JSON output?",
      answer: "XML attributes are typically converted to JSON properties with a special prefix (like '@') to distinguish them from element content, or they may be merged into the element's JSON representation depending on the conversion logic."
    },
    {
      question: "Can I convert large XML files?",
      answer: "Yes, the converter can handle large XML files, but performance may vary based on file size and complexity. For very large files, consider breaking them into smaller chunks if possible."
    },
    {
      question: "What happens to XML namespaces during conversion?",
      answer: "XML namespaces are preserved in the JSON output, typically as part of the element names or as separate properties. The exact handling depends on the conversion implementation."
    }
  ];

  // Get reverse converter info
  const reverseConverter = getReverseConverterInfo('/converter/xml-to-json') || undefined;

  return (
    <ConverterLayout
      title="XML to JSON Converter"
      description="Convert XML data to JSON format with real-time preview"
      faqItems={faqItems}
      inputData={inputXml}
      outputData={outputJson}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="xml"
      outputLanguage="json"
      inputLanguageDisplayName="XML"
      outputLanguageDisplayName="JSON"
      inputIcon={<FileCode className="w-4 h-4" />}
      outputIcon={<FileText className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onFileImport={handleFileImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      reverseConverter={reverseConverter}
    />
  );
}