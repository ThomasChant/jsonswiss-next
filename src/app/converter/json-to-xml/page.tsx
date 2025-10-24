
"use client";

import { useState, useEffect } from "react";
import { FileCode, FileText } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { jsonToXml } from "@/lib/converters";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";
import { getReverseConverterInfo } from "@/lib/converter-mappings";

export default function JsonToXmlPage() {
  const [inputJson, setInputJson] = useState("");
  const [xmlOutput, setXmlOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [options, setOptions] = useState({
    rootElement: "root",
    attributePrefix: "@",
    addDeclaration: true,
    indentation: "  "
  });
  const { copy } = useClipboard({ 
    successMessage: 'XML copied to clipboard',
    errorMessage: 'Failed to copy XML to clipboard'
  });

  const handleInputChange = (value: string | undefined) => {
    setInputJson(value || "");
    convertToXml(value || "");
  };

  // Convert JSON to XML
  const convertToXml = (jsonInput?: string) => {
    const input = jsonInput !== undefined ? jsonInput : inputJson;
    if (!input.trim()) {
      setXmlOutput("");
      setError(null);
      return;
    }

    try {
      const data = JSON.parse(input);
      const result = jsonToXml(data, {
        rootElement: options.rootElement,
        attributePrefix: options.attributePrefix,
        addDeclaration: options.addDeclaration,
        indentation: options.indentation
      });
      setXmlOutput(result);
      setError(null);
    } catch (error) {
      console.error("XML conversion error:", error);
      setError(error instanceof Error ? error.message : "Error converting to XML");
      setXmlOutput("");
    }
  };

  useEffect(() => {
    if (inputJson.trim()) {
      convertToXml();
    }
  }, [options]);

  const handleCopy = () => {
    if (xmlOutput) {
      copy(xmlOutput);
    }
  };

  const handleDownload = () => {
    if (!xmlOutput) return;
    
    const blob = new Blob([xmlOutput], { type: "application/xml;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    convertToXml(jsonString);
    setImportDialogOpen(false);
  };

  const faqItems = [
    {
      question: "How does JSON to XML conversion work?",
      answer: "JSON objects are converted to XML elements. Array items become multiple elements with the same tag name. Object properties become child elements, and you can configure attributes using the @ prefix."
    },
    {
      question: "What happens to JSON arrays?",
      answer: "Arrays are converted to multiple XML elements. For example, an array named 'items' with 3 objects becomes 3 'item' elements."
    },
    {
      question: "Can I customize the XML structure?",
      answer: "Yes! You can customize the root element name, attribute prefix, indentation, and whether to include the XML declaration."
    },
    {
      question: "How are special characters handled?",
      answer: "Special XML characters (<, >, &, ', \") are automatically escaped to ensure valid XML output."
    }
  ];

  const settingsContent = (
    <div>
      <h3 className="text-sm font-medium mb-3">XML Conversion Options</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Root Element
            </label>
            <input
              type="text"
              value={options.rootElement}
              onChange={(e) => setOptions(prev => ({ ...prev, rootElement: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Attribute Prefix
            </label>
            <input
              type="text"
              value={options.attributePrefix}
              onChange={(e) => setOptions(prev => ({ ...prev, attributePrefix: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="addDeclaration"
            checked={options.addDeclaration}
            onChange={(e) => setOptions(prev => ({ ...prev, addDeclaration: e.target.checked }))}
            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="addDeclaration" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Include XML declaration
          </label>
        </div>
      </div>
    </div>
  );

  // Get reverse converter info
  const reverseConverter = getReverseConverterInfo('/converter/json-to-xml') || undefined;

  return (
    <ConverterLayout
      title="JSON to XML Converter"
      description="Convert JSON data to XML format with customizable options"
      faqItems={faqItems}
      inputData={inputJson}
      outputData={xmlOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="xml"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="XML"
      inputIcon={<FileText className="w-4 h-4" />}
      outputIcon={<FileCode className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      settingsPanel={settingsContent}
      reverseConverter={reverseConverter}
    />
  );
}