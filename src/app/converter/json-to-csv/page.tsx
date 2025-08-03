
"use client";

import { useState, useEffect } from "react";
import { FileSpreadsheet, FileText, BookOpen } from "lucide-react";
import Papa from "papaparse";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useSampleData } from "@/hooks/useSampleData";
import { useClipboard } from "@/hooks/useClipboard";
import { ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

export default function JsonToCsvPage() {
  const [inputJson, setInputJson] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [options, setOptions] = useState({
    includeHeaders: true,
    flattenObjects: true,
    delimiter: ",",
    quoteChar: '"',
    useQuotes: false,
  });
  const { copy } = useClipboard({ successMessage: 'CSV copied to clipboard' });

  // Load sample data
  const { loadDemo } = useSampleData({
    toolType: 'jsonToCsv',
    setInput: (data) => {
      setInputJson(data);
      convertToCSV(data); // Convert immediately after setting input
    },
    autoLoad: false
  });

  const handleInputChange = (value: string | undefined) => {
    setInputJson(value || "");
    convertToCSV(value || "");
  };

  // Flatten nested objects for CSV conversion
  const flattenObject = (obj: any, prefix = ""): any => {
    return Object.keys(obj).reduce((acc: any, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (obj[key] === null || obj[key] === undefined) {
        acc[newKey] = "";
      } else if (typeof obj[key] === "object" && !Array.isArray(obj[key]) && obj[key] !== null) {
        if (options.flattenObjects) {
          // Flatten nested objects with dot notation
          Object.assign(acc, flattenObject(obj[key], newKey));
        } else {
          // Convert nested objects to JSON string
          acc[newKey] = JSON.stringify(obj[key]);
        }
      } else if (Array.isArray(obj[key])) {
        acc[newKey] = JSON.stringify(obj[key]);
      } else {
        acc[newKey] = obj[key];
      }
      
      return acc;
    }, {});
  };

  // Convert JSON to CSV
  const convertToCSV = (jsonInput?: string) => {
    const input = jsonInput !== undefined ? jsonInput : inputJson;
    if (!input.trim()) {
      setCsvOutput("");
      setError(null);
      return;
    }

    try {
      const data = JSON.parse(input);
      let processedData: any[];

      if (Array.isArray(data)) {
        // Process array of objects
        processedData = data.map(item => {
          if (typeof item === "object" && item !== null) {
            return flattenObject(item);
          }
          return { value: item };
        });
      } else if (typeof data === "object" && data !== null) {
        // Convert single object to array
        processedData = [flattenObject(data)];
      } else {
        // Handle primitive values
        processedData = [{ value: data }];
      }

      // Use PapaParse to generate CSV
      let csv = Papa.unparse(processedData, {
        header: options.includeHeaders,
        delimiter: options.delimiter,
        quotes: options.useQuotes,
        quoteChar: options.quoteChar,
        skipEmptyLines: false,
      });

      // If user doesn't want quotes, perform post-processing to remove them
      if (!options.useQuotes) {
        // Split by lines to process each row
        const lines = csv.split('\n');
        const processedLines = lines.map(line => {
          if (!line.trim()) return line;
          
          // Parse the line to identify quoted fields and remove quotes
          const delimiter = options.delimiter;
          const parts: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && !inQuotes) {
              inQuotes = true;
            } else if (char === '"' && inQuotes) {
              // Check if this is an escaped quote
              if (i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // Skip the next quote
              } else {
                inQuotes = false;
              }
            } else if (char === delimiter && !inQuotes) {
              parts.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          
          if (current !== '' || line.endsWith(delimiter)) {
            parts.push(current);
          }
          
          return parts.join(delimiter);
        });
        
        csv = processedLines.join('\n');
      }

      setCsvOutput(csv);
      setError(null);
    } catch (error) {
      console.error("CSV conversion error:", error);
      setError(error instanceof Error ? error.message : "Error converting to CSV");
      setCsvOutput("");
    }
  };

  // Update CSV output when options change
  useEffect(() => {
    if (inputJson.trim()) {
      convertToCSV();
    }
  }, [options]);

  const handleCopy = async () => {
    if (csvOutput) {
      await copy(csvOutput);
    }
  };

  const handleDownload = () => {
    if (!csvOutput) return;
    
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (json: any, source: ImportSource, metadata?: ImportMetadata) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    convertToCSV(jsonString);
    setImportDialogOpen(false);
  };

  const faqItems = [
    {
      question: "How does the JSON to CSV conversion handle nested objects?",
      answer: "When 'Flatten Nested Objects' is enabled, nested objects are flattened using dot notation (e.g., 'user.name', 'user.email'). When disabled, nested objects are preserved as JSON strings within CSV cells, maintaining their original structure."
    },
    {
      question: "What happens to arrays in JSON during CSV conversion?",
      answer: "Arrays are typically converted to JSON string format within CSV cells. For arrays of objects, each object becomes a separate row if the JSON structure allows it."
    },
    {
      question: "Can I customize the CSV delimiter?",
      answer: "Yes, you can choose from different delimiters including comma, semicolon, tab, and pipe characters. This helps with compatibility across different systems and regions."
    },
    {
      question: "What does the 'Use Quotes' option do?",
      answer: "When 'Use Quotes' is enabled, CSV fields are wrapped in double quotes, which is standard for proper CSV format. When disabled, all quotes are removed from the output for cleaner appearance. Note that disabling quotes may cause parsing issues if your data contains commas, newlines, or other special characters."
    },
  ];

  const settingsContent = (
    <div>
      <h3 className="text-sm font-medium mb-3">Conversion Options</h3>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={options.includeHeaders}
            onChange={(e) => setOptions({ ...options, includeHeaders: e.target.checked })}
            className="rounded border-gray-300"
          />
          Include Headers
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={options.flattenObjects}
            onChange={(e) => setOptions({ ...options, flattenObjects: e.target.checked })}
            className="rounded border-gray-300"
          />
          Flatten Nested Objects
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={options.useQuotes}
            onChange={(e) => setOptions({ ...options, useQuotes: e.target.checked })}
            className="rounded border-gray-300"
          />
          Use Quotes
        </label>
        <div className="flex items-center gap-2 text-sm">
          <label>Delimiter:</label>
          <select
            value={options.delimiter}
            onChange={(e) => setOptions({ ...options, delimiter: e.target.value })}
            className="px-2 py-1 border rounded text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const extraActions = (
    <button
      onClick={loadDemo}
      className="p-1.5 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-100 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
      title="Load Demo Data"
    >
      <BookOpen className="w-4 h-4" />
    </button>
  );

  return (
    <ConverterLayout
      title="JSON to CSV Converter"
      description="Convert JSON data to CSV format with customizable options"
      faqItems={faqItems}
      inputData={inputJson}
      outputData={csvOutput}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      importDialogOpen={importDialogOpen}
      inputLanguage="json"
      outputLanguage="text"
      inputLanguageDisplayName="JSON"
      outputLanguageDisplayName="CSV"
      inputIcon={<FileText className="w-4 h-4" />}
      outputIcon={<FileSpreadsheet className="w-4 h-4" />}
      onInputChange={handleInputChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onImport={handleImport}
      onToggleInputMaximize={() => setIsInputMaximized(!isInputMaximized)}
      onToggleOutputMaximize={() => setIsOutputMaximized(!isOutputMaximized)}
      onToggleSettings={() => setShowSettings(!showSettings)}
      onToggleImportDialog={setImportDialogOpen}
      settingsPanel={settingsContent}
      extraActions={extraActions}
    />
  );
}