
"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Copy, Code } from "lucide-react";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

// Simple JSON to YAML converter
function jsonToYaml(obj: any, indent = 0): string {
  const spaces = "  ".repeat(indent);
  
  if (obj === null) return "null";
  if (typeof obj === "boolean") return obj.toString();
  if (typeof obj === "number") return obj.toString();
  if (typeof obj === "string") {
    // Check if string needs quotes
    if (obj.includes('\n') || obj.includes('"') || obj.includes("'") || obj.match(/^\d+$/) || obj === 'true' || obj === 'false' || obj === 'null') {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map(item => `${spaces}- ${jsonToYaml(item, indent + 1).replace(/^\s+/, '')}`).join('\n');
  }
  
  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    
    return keys.map(key => {
      const value = obj[key];
      const yamlValue = jsonToYaml(value, indent + 1);
      
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return `${spaces}${key}:\n${yamlValue}`;
      } else if (Array.isArray(value) && value.length > 0) {
        return `${spaces}${key}:\n${yamlValue}`;
      } else {
        return `${spaces}${key}: ${yamlValue}`;
      }
    }).join('\n');
  }
  
  return String(obj);
}

export default function JsonToYamlPage() {
  const [inputJson, setInputJson] = useState("");
  const [yamlOutput, setYamlOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [options, setOptions] = useState({
    includeComments: false,
    sortKeys: false,
  });
  const { copy } = useClipboard({ successMessage: 'YAML copied to clipboard' });

  const handleInputChange = (value: string | undefined) => {
    setInputJson(value || "");
    convertToYaml(value || "");
  };

  const convertToYaml = (jsonInput?: string) => {
    const input = jsonInput !== undefined ? jsonInput : inputJson;
    if (!input.trim()) {
      setYamlOutput("");
      setError(null);
      return;
    }

    try {
      const data = JSON.parse(input);
      let processedData = data;
      
      if (options.sortKeys && typeof data === 'object' && data !== null) {
        const sortObject = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map(sortObject);
          } else if (typeof obj === 'object' && obj !== null) {
            const sorted: any = {};
            Object.keys(obj).sort().forEach(key => {
              sorted[key] = sortObject(obj[key]);
            });
            return sorted;
          }
          return obj;
        };
        processedData = sortObject(data);
      }

      let yaml = jsonToYaml(processedData);
      
      if (options.includeComments) {
        yaml = `# Generated YAML from JSON\n# Timestamp: ${new Date().toISOString()}\n\n${yaml}`;
      }
      
      setYamlOutput(yaml);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error converting JSON to YAML');
      setYamlOutput("");
    }
  };

  useEffect(() => {
    if (inputJson.trim()) {
      convertToYaml();
    }
  }, [options]);

  const handleCopy = async () => {
    if (yamlOutput) {
      await copy(yamlOutput);
    }
  };

  const handleDownload = () => {
    if (!yamlOutput) return;
    
    const blob = new Blob([yamlOutput], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    convertToYaml(jsonString);
    setImportDialogOpen(false);
  };

  const faqItems = [
    {
      question: "How does JSON to YAML conversion handle data types?",
      answer: "JSON data types are converted to their YAML equivalents: strings, numbers, booleans, arrays (sequences), and objects (mappings) are all preserved. YAML's more flexible syntax allows for cleaner representation of these types."
    },
    {
      question: "What's the difference between including comments and not?",
      answer: "When 'Include comments' is enabled, the converter adds a header comment with generation timestamp. Comments help document the YAML file's origin but aren't part of the actual data structure."
    },
    {
      question: "Why would I want to sort keys alphabetically?",
      answer: "Sorting keys alphabetically makes the YAML output more predictable and easier to compare between different versions. This is useful for version control and when you need consistent output formatting."
    },
    {
      question: "How are nested JSON objects represented in YAML?",
      answer: "Nested JSON objects become nested YAML mappings with proper indentation. YAML uses indentation (typically 2 spaces) to show the hierarchical structure, making it more readable than JSON for complex data."
    }
  ];

  const settingsContent = (
    <div>
      <h3 className="text-sm font-medium mb-3">Conversion Options</h3>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeComments"
            checked={options.includeComments}
            onChange={(e) => setOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <label htmlFor="includeComments" className="text-sm">
            Include comments
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sortKeys"
            checked={options.sortKeys}
            onChange={(e) => setOptions(prev => ({ ...prev, sortKeys: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <label htmlFor="sortKeys" className="text-sm">
            Sort keys alphabetically
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <ConverterLayout
      title="JSON to YAML Converter"
      description="Convert JSON data to YAML format with proper indentation and formatting"
      faqItems={faqItems}
      inputData={inputJson}
      outputData={yamlOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="yaml"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="YAML"
      inputIcon={<FileText className="w-4 h-4" />}
      outputIcon={<Code className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      settingsPanel={settingsContent}
    />
  );
}