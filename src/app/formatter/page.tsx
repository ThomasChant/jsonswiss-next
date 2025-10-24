
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { FileText, FoldVertical, UnfoldVertical } from "lucide-react";

import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { ImportJsonDialog } from "@/components/import/ImportJsonDialog";
import { useClipboard } from "@/hooks/useClipboard";
import { getInitialCachedJson, setCachedRawJson, clearCachedJson } from "@/lib/json-cache";

export default function FormatterPage() {
  const { theme } = useTheme();
  const resolvedTheme = theme === "system" ? "light" : theme;
  const { copy } = useClipboard();
  const [inputJson, setInputJson] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [lastIndentSize, setLastIndentSize] = useState(2); // 记录上一次非0缩进
  const [sortKeys, setSortKeys] = useState(false);
  const [minify, setMinify] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isMinified, setIsMinified] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);

  const formatJson = useCallback((input: string) => {
    if (!input.trim()) {
      setFormattedJson("");
      setError(null);
      setIsValid(false);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      let formatted;
      
      const dataToFormat = sortKeys ? sortObjectKeys(parsed) : parsed;
      
      if (indentSize === 0) {
        // Minified mode
        formatted = JSON.stringify(dataToFormat);
      } else {
        // Formatted mode with specified indentation
        formatted = JSON.stringify(dataToFormat, null, indentSize);
      }
      
      setFormattedJson(formatted);
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setFormattedJson("");
      setIsValid(false);
    }
  }, [sortKeys, indentSize]);

  const sortObjectKeys = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    
    const sorted: Record<string, any> = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObjectKeys(obj[key]);
    });
    return sorted;
  };

  const handleInputChange = useCallback((value: string | undefined) => {
    const jsonValue = value || "";
    setCachedRawJson(jsonValue);
    setInputJson(jsonValue);
    formatJson(jsonValue);
  }, [formatJson]);



  // Auto-format when input changes
  useEffect(() => {
    if (inputJson) {
      formatJson(inputJson);
    }
  }, [inputJson, formatJson]);

  // Prefill from local cache on mount
  useEffect(() => {
    if (!inputJson) {
      const cached = getInitialCachedJson();
      if (cached) {
        setInputJson(cached);
        formatJson(cached);
      }
    }
  }, []);

  const toggleMinify = useCallback(() => {
    if (!isValid) return;
    try {
      const parsed = JSON.parse(inputJson);
      const dataToFormat = sortKeys ? sortObjectKeys(parsed) : parsed;
      if (indentSize === 0) {
        // 恢复缩进
        const indent = lastIndentSize || 2;
        setFormattedJson(JSON.stringify(dataToFormat, null, indent));
        setIndentSize(indent);
      } else {
        // 压缩
        setLastIndentSize(indentSize || 2);
        setFormattedJson(JSON.stringify(dataToFormat));
        setIndentSize(0);
      }
    } catch (err) {
      // ignore; 仅在有效 JSON 才会触发
    }
  }, [isValid, inputJson, sortKeys, indentSize, lastIndentSize]);

  const handleCopyFormatted = useCallback(async () => {
    if (formattedJson) {
      await copy(formattedJson);
    }
  }, [formattedJson, copy]);

  const handleDownload = useCallback(() => {
    if (!formattedJson) return;
    
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [formattedJson]);

  const handleFormat = useCallback(() => {
    if (inputJson) {
      formatJson(inputJson);
    }
  }, [inputJson, formatJson]);

  const handleImport = useCallback((json: any) => {
    const jsonString = JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    formatJson(jsonString);
    setShowImportDialog(false);
  }, [formatJson]);

  const handleToggleInputMaximize = () => {
    setIsInputMaximized((prev) => {
      const next = !prev;
      if (next) setIsOutputMaximized(false);
      return next;
    });
  };

  const handleToggleOutputMaximize = () => {
    setIsOutputMaximized((prev) => {
      const next = !prev;
      if (next) setIsInputMaximized(false);
      return next;
    });
  };

  const faqItems = [
    {
      question: "What does JSON formatting do?",
      answer: "JSON formatting beautifies your JSON data by adding proper indentation, line breaks, and spacing to make it more readable and easier to understand."
    },
    {
      question: "Can I customize the indentation?",
      answer: "Yes! You can choose between 2 spaces, 4 spaces, or tab indentation. You can also compact the JSON to remove all unnecessary whitespace."
    },
    {
      question: "Will formatting change my data?",
      answer: "No, formatting only changes the visual presentation of your JSON. The actual data structure and values remain exactly the same."
    },
    {
      question: "Can I format large JSON files?",
      answer: "Yes, the formatter can handle large JSON files efficiently. For very large files, you might notice a slight delay as the data is processed."
    }
  ];

  return (
    <>      <ConverterLayout 
        title="JSON Formatter" 
        description="Format and beautify JSON data"
        faqItems={faqItems}
        inputData={inputJson}
        outputData={formattedJson}
        error={error}
        isInputMaximized={isInputMaximized}
        isOutputMaximized={isOutputMaximized}
        showSettings={showSettings}
        importDialogOpen={showImportDialog}
        inputLanguage="json"
        outputLanguage="json"
        inputLanguageDisplayName="JSON"
        outputLanguageDisplayName="Formatted JSON"
        onInputChange={handleInputChange}
        onCopy={handleCopyFormatted}
        onDownload={handleDownload}
        onImport={handleImport}
        onToggleInputMaximize={handleToggleInputMaximize}
        onToggleOutputMaximize={handleToggleOutputMaximize}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onToggleImportDialog={setShowImportDialog}
        settingsPanel={
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Indent Size</label>
              <select 
                value={indentSize} 
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={0}>Minified</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sortKeys"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sortKeys" className="text-sm font-medium">
                Sort Keys
              </label>
            </div>
          </div>
        }
        emptyStateContent={
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Start Formatting JSON</p>
            <p className="text-sm">
              Enter JSON data on the left, or click import to load from file
            </p>
          </div>
        }
        stats={
          isValid && formattedJson && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Characters: {formattedJson.length}</span>
              <span>Lines: {formattedJson.split('\n').length}</span>
              <span>Status: {error ? 'Invalid' : 'Valid'}</span>
            </div>
          )
        }
        extraActions={
          <button
            onClick={toggleMinify}
            disabled={!isValid}
            className={`p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              indentSize === 0
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={indentSize === 0 ? 'Pretty-print JSON' : 'Minify JSON'}
          >
            {indentSize === 0 ? (
              <UnfoldVertical className="w-4 h-4" />
            ) : (
              <FoldVertical className="w-4 h-4" />
            )}
          </button>
        }
      />
      
      <ImportJsonDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImport}
      />
    </>
  );
}
