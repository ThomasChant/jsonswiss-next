
"use client";

import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { AIRepairService, AI_MAX_INPUT_CHARS } from "@/lib/ai-utils";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Wrench,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { getInitialCachedJson, setCachedRawJson, clearCachedJson } from "@/lib/json-cache";

export default function RepairPage() {
  const [inputJson, setInputJson] = useState("");
  const [repairedJson, setRepairedJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProvider, setRepairProvider] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const { copy } = useClipboard({ successMessage: 'JSON repaired and copied to clipboard' });
  
  const [aiService] = useState(() => new AIRepairService());

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setCachedRawJson(jsonValue);
    setInputJson(jsonValue);
    setError(null);
    setRepairedJson("");
    setRepairProvider(null);
  };

  // Prefill from local cache on mount
  useEffect(() => {
    if (!inputJson) {
      const cached = getInitialCachedJson();
      if (cached) {
        setInputJson(cached);
      }
    }
  }, []);

  const repairJson = async () => {
    if (!inputJson || !inputJson.trim()) {
      setError("Please enter JSON to repair");
      return;
    }

    setIsRepairing(true);
    setError(null);
    setRepairedJson("");
    setRepairProvider(null);

    try {
      const result = await aiService.repairJson(inputJson);
      
      if (result.success) {
        setRepairedJson(result.repairedJson || "");
        setRepairProvider(result.provider || null);
      } else {
        setError(result.error || "Could not repair JSON");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while repairing JSON");
    } finally {
      setIsRepairing(false);
    }
  };

  const handleImport = (json: any) => {
    // Accept either parsed JSON or raw invalid JSON string
    if (typeof json === 'string') {
      setInputJson(json);
      handleInputChange(json);
    } else {
      const jsonString = JSON.stringify(json, null, 2);
      setInputJson(jsonString);
      handleInputChange(jsonString);
    }
  };

  const handleCopyRepaired = async () => {
    if (repairedJson) {
      await copy(repairedJson);
    }
  };

  const handleDownload = () => {
    if (!repairedJson) return;
    
    const blob = new Blob([repairedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "repaired.json";
    a.click();
    URL.revokeObjectURL(url);
  };

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


  const isValidJson = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const faqItems = [
    {
      question: "How does JSON repair work?",
      answer: "Our repair system uses a multi-layered approach: first the JSONRepair library for fast, reliable fixes, then basic pattern matching, and finally AI providers (DeepSeek, OpenRouter, Groq) for complex issues."
    },
    {
      question: "What repair methods are used?",
      answer: "1) JSONRepair library - Fast, accurate repair for most common issues. 2) Basic repair - Pattern-based fixes for simple syntax errors. 3) AI repair - DeepSeek and other AI providers for complex structural problems."
    },
    {
      question: "Is there a size limit for AI repair?",
      answer: `Yes. For reliability, AI repair supports inputs up to about (~${Math.round(AI_MAX_INPUT_CHARS / 1024)} KB) per request. Larger JSON can usually be fixed by the local JSONRepair/basic methods, or you can split it into smaller chunks before using AI repair.`
    },
    {
      question: "Do I need API keys?",
      answer: "No. You don't need any API keys. For complex cases, we enhance results using our DeepSeek API integration (managed by us) on top of local JSONRepair and built-in fixes—so it works out of the box. When AI is used, your JSON is sent to DeepSeek to complete the repair. On the free plan, you can use up to 10 AI repairs (DeepSeek) per day."
    },
    {
      question: "How accurate is the repair process?",
      answer: "Very high accuracy for common issues using the JSONRepair library. Basic pattern matching handles simple syntax errors. AI providers provide intelligent analysis for complex structural problems when needed."
    }
  ];

  return (
    <>
      <ConverterLayout 
        title="JSON Repair" 
        description="Intelligent JSON repair with JSONRepair library and AI-powered fallback. No configuration required."
        faqItems={faqItems}
        inputData={inputJson}
        outputData={repairedJson}
        error={error}
        isInputMaximized={isInputMaximized}
        isOutputMaximized={isOutputMaximized}
        showSettings={showSettings}
        importDialogOpen={importDialogOpen}
        inputValidationStatus={
          inputJson ? (
            isValidJson(inputJson) ? (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Valid JSON</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Invalid JSON</span>
                </div>
                <button
                  onClick={repairJson}
                  disabled={isRepairing}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs rounded transition-colors"
                >
                  {isRepairing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  <span>{isRepairing ? "Repairing..." : "Repair"}</span>
                </button>
              </div>
            )
          ) : null
        }
        inputLanguage="json"
        outputLanguage="json"
        inputLanguageDisplayName="Broken JSON"
        outputLanguageDisplayName="Repaired JSON"
        onInputChange={handleInputChange}
        onCopy={handleCopyRepaired}
        onDownload={handleDownload}
        onImport={handleImport}
        onToggleInputMaximize={handleToggleInputMaximize}
        onToggleOutputMaximize={handleToggleOutputMaximize}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onToggleImportDialog={setImportDialogOpen}
        allowInvalidJsonImport
        settingsPanel={
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">How JSON Repair Works</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              When you enter invalid JSON, our system automatically tries these methods in order:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">1</div>
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">JSONRepair Library</div>
                  <div className="text-sm text-green-600 dark:text-green-300">Fast, accurate repair for most common issues</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">2</div>
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Basic Pattern Matching</div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">Handles simple syntax errors</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full">3</div>
                <div>
                  <div className="font-medium text-purple-800 dark:text-purple-200">AI Providers</div>
                  <div className="text-sm text-purple-600 dark:text-purple-300">DeepSeek & others for complex cases</div>
                </div>
              </div>
            </div>

          </div>
        }
        emptyStateContent={
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Start Repairing JSON</p>
            <p className="text-sm">
              Enter broken JSON data, or click import to load from file
            </p>
          </div>
        }
        stats={
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            
            {repairedJson && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Repaired</span>
                </div>
              </>
            )}
            {repairProvider && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <Sparkles className="w-4 h-4" />
                  <span>via {repairProvider}</span>
                </div>
              </>
            )}
          </div>
        }
      />
      
      {/* Import dialog is provided by ConverterLayout with allowInvalidJsonImport */}
    </>
  );
}
