
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { DiffEditor } from "@monaco-editor/react";
import { Upload, Copy, Download, ArrowLeftRight, RefreshCw, Settings2, FileText, GitCompare, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolPageLayoutServer } from "@/components/layout/ToolPageLayoutServer";
import { useJsonDiff } from "@/hooks/useJsonDiff";
import { useClipboard } from "@/hooks/useClipboard";
import { compareSamples, ComparisonSamplePair } from "@/sample-data";
import { DiffOptions, formatJsonForComparison } from "@/lib/json-diff";
import { ImportJsonDialog } from "@/components/import";

export default function JsonComparePage() {
  const { resolvedTheme } = useTheme();
  const [jsonA, setJsonA] = useState("");
  const [jsonB, setJsonB] = useState("");
  // Keep values fed into DiffEditor props stable during typing to avoid cursor reset
  const [editorOriginalValue, setEditorOriginalValue] = useState("");
  const [editorModifiedValue, setEditorModifiedValue] = useState("");
  const [fileAName, setFileAName] = useState("");
  const [fileBName, setFileBName] = useState("");
  const [diffOptions, setDiffOptions] = useState<DiffOptions>({
    ignoreWhitespace: false,
    ignoreCase: false,
    ignoreOrder: false,
  });
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<'left' | 'right'>('left');

  const {
    compareJson,
    clearDiff,
    exportDiffReport,
    error,
    jsonAValid,
    jsonBValid,
    hasChanges,
    changeCount,
    diffSummary,
    diffStatistics,
    lastComparisonTime,
  } = useJsonDiff();

  const { copy } = useClipboard({
    successMessage: 'Diff report copied to clipboard',
    errorMessage: 'Failed to copy diff report'
  });

  // Trigger comparison when JSON inputs or options change
  useEffect(() => {
    if (jsonA.trim() && jsonB.trim()) {
      setIsLoading(true);
      const timeoutId = setTimeout(() => {
        compareJson(jsonA, jsonB, diffOptions).finally(() => {
          setIsLoading(false);
        });
      }, 300); // Debounce

      return () => clearTimeout(timeoutId);
    } else {
      clearDiff();
    }
  }, [jsonA, jsonB, diffOptions, compareJson, clearDiff]);

  // Determine whether we show a normalized (preprocessed) view in the diff editor
  const isNormalizedView = Boolean(
    diffOptions.ignoreCase || diffOptions.ignoreOrder || diffOptions.ignoreWhitespace
  );

  // Prepare display strings for the diff editor
  const displayA = useMemo(() => {
    if (!jsonA.trim()) return "";
    if (!isNormalizedView) return editorOriginalValue;
    try {
      return formatJsonForComparison(jsonA, diffOptions);
    } catch {
      return editorOriginalValue; // Fallback to raw on parse error
    }
  }, [jsonA, diffOptions, isNormalizedView, editorOriginalValue]);

  const displayB = useMemo(() => {
    if (!jsonB.trim()) return "";
    if (!isNormalizedView) return editorModifiedValue;
    try {
      return formatJsonForComparison(jsonB, diffOptions);
    } catch {
      return editorModifiedValue;
    }
  }, [jsonB, diffOptions, isNormalizedView, editorModifiedValue]);

  // When leaving normalized preview, refresh the editor props to latest raw content
  useEffect(() => {
    if (!isNormalizedView) {
      setEditorOriginalValue(jsonA);
      setEditorModifiedValue(jsonB);
    }
    // Only run when toggling normalized view state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNormalizedView]);

  // Handle import from dialog
  const handleImport = useCallback((json: any) => {
    const jsonString = JSON.stringify(json, null, 2);
    if (importTarget === 'left') {
      setJsonA(jsonString);
      setEditorOriginalValue(jsonString);
      setFileAName('Imported JSON (A)');
    } else {
      setJsonB(jsonString);
      setEditorModifiedValue(jsonString);
      setFileBName('Imported JSON (B)');
    }
  }, [importTarget]);

  const openImportDialog = useCallback((target: 'left' | 'right') => {
    setImportTarget(target);
    setImportDialogOpen(true);
  }, []);

  // Handle swap sides
  const handleSwapSides = useCallback(() => {
    const tempJson = jsonA;
    const tempName = fileAName;
    setJsonA(jsonB);
    setJsonB(tempJson);
    setFileAName(fileBName);
    setFileBName(tempName);
    setEditorOriginalValue(jsonB);
    setEditorModifiedValue(tempJson);
  }, [jsonA, jsonB, fileAName, fileBName]);

  // Handle clear both sides
  const handleClearBoth = useCallback(() => {
    setJsonA("");
    setJsonB("");
    setFileAName("");
    setFileBName("");
    setEditorOriginalValue("");
    setEditorModifiedValue("");
    clearDiff();
  }, [clearDiff]);

  // Handle copy diff report
  const handleCopyDiff = useCallback(async () => {
    if (!jsonA.trim() || !jsonB.trim()) return;
    
    try {
      const report = await exportDiffReport(jsonA, jsonB, diffOptions);
      await copy(report);
    } catch (err) {
      console.error('Failed to copy diff report:', err);
    }
  }, [jsonA, jsonB, diffOptions, exportDiffReport, copy]);

  // Handle export diff report
  const handleExportDiff = useCallback(async () => {
    if (!jsonA.trim() || !jsonB.trim()) return;
    
    try {
      const report = await exportDiffReport(jsonA, jsonB, diffOptions);
      const blob = new Blob([report], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `json-diff-report-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export diff report:', err);
    }
  }, [jsonA, jsonB, diffOptions, exportDiffReport]);

  // Handle load demo data
  const handleLoadDemo = useCallback((sampleKey: string) => {
    const sample = compareSamples[sampleKey as keyof typeof compareSamples];
    if (sample) {
      setJsonA(sample.jsonA);
      setJsonB(sample.jsonB);
      setEditorOriginalValue(sample.jsonA);
      setEditorModifiedValue(sample.jsonB);
      setFileAName(`${sample.name} (A)`);
      setFileBName(`${sample.name} (B)`);
    }
  }, []);

  const faqItems = [
    {
      question: "How does JSON comparison work?",
      answer: "The tool uses structural comparison to identify differences between two JSON objects. It detects additions, deletions, and modifications at any nesting level, providing a visual side-by-side diff view."
    },
    {
      question: "What comparison options are available?",
      answer: "You can ignore whitespace differences, case sensitivity, and object/array order. These options help focus on meaningful structural changes rather than formatting differences."
    },
    {
      question: "What does 'Ignore whitespace' do?",
      answer: "Ignores differences in whitespace within string values (e.g., 'Hello,  World' vs 'Hello,World'). Whitespace outside of strings is already ignored by JSON parsing."
    },
    {
      question: "What does 'Ignore case' do?",
      answer: "Compares keys and string values case-insensitively by lowercasing them before diffing. For example, 'Status' and 'status', or 'SUCCESS' and 'success', are treated as equal."
    },
    {
      question: "What does 'Ignore order' do?",
      answer: "Sorts object keys and array elements using a stable comparator before diffing, so reordering does not count as a change. This works for arrays of primitives and objects (objects are compared via their JSON representation)."
    },
    {
      question: "Why is the editor sometimes read-only?",
      answer: "When any ignore option is enabled, the view switches to a normalized preview so that visual highlighting matches the ignore rules exactly. Disable all ignore options to return to the editable raw view."
    },
    {
      question: "How do I interpret the diff results?",
      answer: "Green highlights show additions, red shows deletions, and yellow shows modifications. The statistics panel provides a summary of total changes, and the diff can be exported as a detailed report."
    },
    {
      question: "Can I compare large JSON files?",
      answer: "Yes, the tool can handle large JSON files efficiently. For very large files, consider using the 'ignore whitespace' option to improve performance and focus on structural differences."
    },
    {
      question: "What file formats are supported?",
      answer: "You can import .json and .txt files, or paste JSON content directly. The tool validates JSON syntax and provides helpful error messages for invalid JSON."
    },
    {
      question: "How can I export the comparison results?",
      answer: "Use the 'Export Report' button to download a detailed markdown report, or 'Copy Diff' to copy a summary to your clipboard. The report includes statistics and detailed change descriptions."
    }
  ];

  return (
    <ToolPageLayoutServer
      title="JSON Compare Tool"
      description="Compare two JSON objects and visualize the differences with detailed analysis"
      faqItems={faqItems}
      showSidebar={false}
    >
      <div className="p-4 h-full flex flex-col min-h-0 min-h-core-min max-h-core-max h-core-default">
        {/* Options Panel */}
        {showOptions && (
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Comparison Options</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ignoreWhitespace"
                  checked={diffOptions.ignoreWhitespace}
                  onChange={(e) => setDiffOptions(prev => ({ ...prev, ignoreWhitespace: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="ignoreWhitespace" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ignore whitespace
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ignoreCase"
                  checked={diffOptions.ignoreCase}
                  onChange={(e) => setDiffOptions(prev => ({ ...prev, ignoreCase: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="ignoreCase" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ignore case
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ignoreOrder"
                  checked={diffOptions.ignoreOrder}
                  onChange={(e) => setDiffOptions(prev => ({ ...prev, ignoreOrder: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="ignoreOrder" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ignore order
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openImportDialog('left')}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              <span>Import A</span>
            </button>

            <button
              onClick={() => openImportDialog('right')}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              <span>Import B</span>
            </button>

            <button
              onClick={handleSwapSides}
              disabled={!jsonA || !jsonA.trim() || !jsonB || !jsonB.trim()}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                jsonA && jsonA.trim() && jsonB && jsonB.trim()
                  ? "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
              )}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Swap</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  showOptions
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                <Settings2 className="w-4 h-4" />
                <span>Options</span>
              </button>
            </div>

            {/* Demo dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Load Demo</span>
              </button>
              
              <div className="absolute top-full mt-1 left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {Object.entries(compareSamples).map(([key, sample]) => (
                  <button
                    key={key}
                    onClick={() => handleLoadDemo(key)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-medium text-slate-900 dark:text-slate-100">{sample.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{sample.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyDiff}
              disabled={!hasChanges}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                hasChanges
                  ? "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
              )}
            >
              <Copy className="w-4 h-4" />
              <span>Copy Diff</span>
            </button>

            <button
              onClick={handleExportDiff}
              disabled={!hasChanges}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                hasChanges
                  ? "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
              )}
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>

            <button
              onClick={handleClearBoth}
              disabled={(!jsonA || !jsonA.trim()) && (!jsonB || !jsonB.trim())}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                ((jsonA && jsonA.trim()) || (jsonB && jsonB.trim()))
                  ? "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mb-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                jsonA.trim() ? (jsonAValid ? "bg-green-500" : "bg-red-500") : "bg-slate-400"
              )} />
              <span className="text-slate-600 dark:text-slate-400">
                A: {fileAName || "No file"}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                jsonB.trim() ? (jsonBValid ? "bg-green-500" : "bg-red-500") : "bg-slate-400"
              )} />
              <span className="text-slate-600 dark:text-slate-400">
                B: {fileBName || "No file"}
              </span>
            </div>

            {isLoading && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">Comparing...</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm">
            {diffStatistics && (
              <>
                <span className="text-slate-600 dark:text-slate-400">
                  Changes: {changeCount}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {diffSummary}
                </span>
              </>
            )}
            
            {lastComparisonTime && (
              <span className="text-slate-500 dark:text-slate-500 text-xs">
                Last compared: {lastComparisonTime.toLocaleTimeString()}
              </span>
            )}
            {isNormalizedView && (
              <span className="text-slate-500 dark:text-slate-500 text-xs">
                Normalized preview (options applied)
              </span>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Diff Editor */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 min-h-0">
          {jsonA.trim() || jsonB.trim() ? (
            <DiffEditor
              key={isNormalizedView ? 'normalized' : 'raw'}
              height="100%"
              language="json"
              original={displayA}
              modified={displayB}
              theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
              options={{
                readOnly: isNormalizedView,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderSideBySide: true,
                ignoreTrimWhitespace: diffOptions.ignoreWhitespace,
                renderWhitespace: "selection",
                diffWordWrap: "on",
                originalEditable: !isNormalizedView,
              }}
              onMount={(editor) => {
                // Bind editing listeners only in editable mode
                if (!isNormalizedView) {
                  const originalModel = editor.getOriginalEditor().getModel();
                  const modifiedModel = editor.getModifiedEditor().getModel();
                  if (originalModel) {
                    originalModel.onDidChangeContent(() => {
                      setJsonA(originalModel.getValue());
                    });
                  }
                  if (modifiedModel) {
                    modifiedModel.onDidChangeContent(() => {
                      setJsonB(modifiedModel.getValue());
                    });
                  }
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
              <div className="text-center">
                <GitCompare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">JSON Comparison Tool</p>
                <p className="text-sm mb-4">Import or paste JSON content to compare</p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>JSON A (Left)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>JSON B (Right)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ImportJsonDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImport={handleImport}
          title={`Import JSON for Side ${importTarget === 'left' ? 'A' : 'B'}`}
          description={`Import JSON data for the ${importTarget === 'left' ? 'left' : 'right'} side of the comparison`}
          comparisonSide={importTarget === 'left' ? 'A' : 'B'}
          autoImportComparisonSelection={true}
          showSampleTab={false}
        />
      </div>
    </ToolPageLayoutServer>
  );
}
