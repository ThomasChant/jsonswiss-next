
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { Editor } from "@monaco-editor/react";
import { 
  Shield, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Maximize2,
  Minimize2,
  FileText,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JsonValidator, ValidationResult } from "@/lib/json-utils";
import { ToolPageLayoutServer } from "@/components/layout/ToolPageLayoutServer";
import { ImportJsonDialog } from "@/components/import/ImportJsonDialog";
import { useClipboard } from "@/hooks/useClipboard";

export default function ValidatorPage() {
  const { theme } = useTheme();
  const { copy } = useClipboard();
  const [inputJson, setInputJson] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const validator = useMemo(() => new JsonValidator(), []);

  const validateJson = useCallback((jsonString?: string) => {
    const jsonToValidate = jsonString || inputJson;
    if (jsonToValidate && typeof jsonToValidate === 'string' && jsonToValidate.trim()) {
      const result = validator.validate(jsonToValidate);
      setValidationResult(result);
      setError(result.isValid ? null : result.errors?.[0]?.message || null);
    } else {
      setValidationResult(null);
      setError(null);
    }
  }, [validator, inputJson]);

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    validateJson(jsonValue);
  };


  // 初始化时使用全局JSON数据
  useEffect(() => {
    if (inputJson) {
      validateJson(inputJson);
    }
  }, [inputJson, validateJson]);

  const handleImport = (json: any) => {
    const jsonString = JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    validateJson(jsonString);
  };

  const isValidJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownloadReport = () => {
    if (!validationResult) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      statistics: validationResult.statistics
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "json-validation-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: "What does JSON validation check?",
      answer: "JSON validation checks syntax correctness, data structure integrity, and provides detailed statistics about your JSON including type counts, nesting depth, and file size."
    },
    {
      question: "What kinds of errors will I see?",
      answer: "Common errors include missing commas, unclosed brackets or braces, invalid escape sequences, trailing commas, and malformed string values."
    },
    {
      question: "What are the warnings about?",
      answer: "Warnings highlight potential issues like very deep nesting, extremely large strings, or unusual data patterns that might indicate problems even if the JSON is syntactically valid."
    },
    {
      question: "Can I get a validation report?",
      answer: "Yes! Click the 'Report' button to download a detailed JSON validation report with all errors, warnings, and statistics for your records."
    }
  ];

  return (
    <>
      <ToolPageLayoutServer
        title="JSON Validator"
        description="Validate JSON syntax and structure"
        faqItems={faqItems}
        showSidebar={false}
      >
        <div className="h-full flex flex-col min-h-0">
          {/* Error Display */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex-shrink-0">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Editor Areas */}
          <div className="p-2 min-h-0 min-h-core-min max-h-core-max h-core-default">
            <div className="grid grid-cols-2 gap-2 h-full min-h-0">
              {/* Left Panel - JSON Input */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">JSON Input</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowImportDialog(true)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Import JSON"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0" style={{ minHeight: '300px' }}>
                  <Editor
                    height="100%"
                    language="json"
                    value={inputJson}
                    onChange={(value) => handleInputChange(value || '')}
                    theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "var(--font-mono)",
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: 'none',
                      cursorBlinking: 'smooth',
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
                
                {/* Input Stats */}
                {inputJson && typeof inputJson === 'string' && (
                  <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                      <span>Characters: {inputJson.length}</span>
                      <span>•</span>
                      <span>Lines: {inputJson.split('\n').length}</span>
                      <span>•</span>
                      {isValidJson(inputJson) ? (
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Valid JSON</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>Invalid JSON</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Panel - Validation Results */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Validation Results</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {validationResult && (
                      <button
                        onClick={handleDownloadReport}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Download validation report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 overflow-auto">
                  <div className="p-4 h-full">
                    {!inputJson || typeof inputJson !== 'string' || !inputJson.trim() ? (
                      <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <div className="text-center">
                          <CheckCircle2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Start Validating JSON</p>
                          <p className="text-sm">
                            Enter JSON data to see validation results
                          </p>
                        </div>
                      </div>
                    ) : validationResult ? (
                      <div className="space-y-4">
                        {/* Validation Status */}
                        <div className={cn(
                          "flex items-center space-x-2 p-3 rounded-lg",
                          validationResult.isValid 
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                        )}>
                          {validationResult.isValid ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <AlertCircle className="w-5 h-5" />
                          )}
                          <span className="font-medium">
                            {validationResult.isValid ? 'Valid JSON' : 'Invalid JSON'}
                          </span>
                        </div>
                        
                        {/* Errors */}
                        {validationResult.errors && validationResult.errors.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4" />
                              <span>Errors ({validationResult.errors.length})</span>
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-auto">
                              {validationResult.errors.map((error, index) => (
                                 <div key={index} className="p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded text-sm">
                                   <div className="font-medium text-red-800 dark:text-red-300">{error.message}</div>
                                   <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                                     Line {error.line}, Column {error.column}
                                   </div>
                                 </div>
                               ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Warnings */}
                        {validationResult.warnings && validationResult.warnings.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 flex items-center space-x-2">
                              <Info className="w-4 h-4" />
                              <span>Warnings ({validationResult.warnings.length})</span>
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-auto">
                              {validationResult.warnings.map((warning, index) => (
                                 <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                                   <div className="font-medium text-yellow-800 dark:text-yellow-300">{warning.message}</div>
                                   <div className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                                     Line {warning.line}, Column {warning.column}
                                   </div>
                                 </div>
                               ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Statistics */}
                        {validationResult.statistics && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4" />
                              <span>Statistics</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <div className="text-slate-600 dark:text-slate-400">Total Lines</div>
                                <div className="font-medium">{validationResult.statistics.totalLines}</div>
                              </div>
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <div className="text-slate-600 dark:text-slate-400">Characters</div>
                                <div className="font-medium">{validationResult.statistics.totalCharacters}</div>
                              </div>
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <div className="text-slate-600 dark:text-slate-400">Objects</div>
                                <div className="font-medium">{validationResult.statistics.objectCount}</div>
                              </div>
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <div className="text-slate-600 dark:text-slate-400">Arrays</div>
                                <div className="font-medium">{validationResult.statistics.arrayCount}</div>
                              </div>
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <div className="text-slate-600 dark:text-slate-400">Max Depth</div>
                                <div className="font-medium">{validationResult.statistics.maxDepth}</div>
                              </div>
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <div className="text-slate-600 dark:text-slate-400">Keys</div>
                                <div className="font-medium">{validationResult.statistics.keyCount}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <div className="text-center">
                          <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Validating...</p>
                          <p className="text-sm">
                            Processing your JSON data
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Validation Controls */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={strictMode}
                      onChange={(e) => setStrictMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Strict Mode</span>
                  </label>
                  
                  <button
                    onClick={() => validateJson()}
                    disabled={!inputJson || typeof inputJson !== 'string' || !inputJson.trim()}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validate JSON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ToolPageLayoutServer>
      
      <ImportJsonDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImport}
      />
    </>
  );
}