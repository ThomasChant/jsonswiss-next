
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Editor } from "@monaco-editor/react";
import { 
  Wrench, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Settings,
  Maximize2,
  Minimize2,
  FileText,
  Zap,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIRepairService, AIProvider, defaultAIProviders } from "@/lib/ai-utils";
import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useJsonStore } from "@/store/jsonStore";
import { ImportJsonDialog } from "@/components/import/ImportJsonDialog";
import { useClipboard } from "@/hooks/useClipboard";

export default function RepairPage() {
  const { resolvedTheme } = useTheme();
  const { jsonData } = useJsonStore();
  const [inputJson, setInputJson] = useState("");
  const [repairedJson, setRepairedJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProvider, setRepairProvider] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { copy } = useClipboard({ successMessage: 'JSON repaired and copied to clipboard' });
  
  const [aiService] = useState(() => new AIRepairService());
  const [providers, setProviders] = useState<AIProvider[]>(() => aiService.getProviders());

  const handleInputChange = (value: string | undefined) => {
    const jsonValue = value || "";
    setInputJson(jsonValue);
    setError(null);
    setRepairedJson("");
    setRepairProvider(null);
  };

  const handleNodeSelect = (path: string[], data: any) => {
    setSelectedNodeData(data);
    // 如果选中的节点数据是破损的JSON，自动设置为输入
    if (data !== null && data !== undefined) {
      const jsonString = JSON.stringify(data, null, 2);
      setInputJson(jsonString);
      setError(null);
      setRepairedJson("");
      setRepairProvider(null);
    }
  };

  // 初始化时使用全局JSON数据
  useEffect(() => {
    if (jsonData && !inputJson) {
      const jsonString = JSON.stringify(jsonData, null, 2);
      setInputJson(jsonString);
    }
  }, [jsonData, inputJson]);

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
    const jsonString = JSON.stringify(json, null, 2);
    setInputJson(jsonString);
    handleInputChange(jsonString);
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

  const updateProvider = (index: number, updatedProvider: AIProvider) => {
    const newProviders = [...providers];
    newProviders[index] = updatedProvider;
    setProviders(newProviders);
    aiService.updateProvider(index, updatedProvider);
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
      question: "How does AI JSON repair work?",
      answer: "Our AI repair service uses multiple AI providers to analyze broken JSON and intelligently fix common issues like missing commas, unclosed brackets, malformed strings, and structural problems."
    },
    {
      question: "Which AI providers are supported?",
      answer: "We support multiple AI providers including OpenRouter, Groq, and HuggingFace. You can configure API keys for each provider in the settings panel for best results."
    },
    {
      question: "What if the repair fails?",
      answer: "If one AI provider fails, the system automatically tries other enabled providers. If all providers fail, you'll see a detailed error message explaining what went wrong."
    },
    {
      question: "How accurate is the repair process?",
      answer: "The accuracy depends on the complexity of the issues. Simple syntax errors are fixed with high accuracy, while complex structural issues may require manual review of the repaired result."
    }
  ];

  return (
    <>
      <ConverterLayout 
        title="JSON Repair" 
        description="AI-powered JSON repair service"
        faqItems={faqItems}
        inputData={inputJson}
        outputData={repairedJson}
        error={error}
        isInputMaximized={false}
        isOutputMaximized={false}
        showSettings={showSettings}
        importDialogOpen={importDialogOpen}
        inputLanguage="json"
        outputLanguage="json"
        inputLanguageDisplayName="Broken JSON"
        outputLanguageDisplayName="Repaired JSON"
        onInputChange={handleInputChange}
        onCopy={handleCopyRepaired}
        onDownload={handleDownload}
        onImport={handleImport}
        onToggleInputMaximize={() => {}}
        onToggleOutputMaximize={() => {}}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onToggleImportDialog={setImportDialogOpen}
        settingsPanel={
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">AI Provider Settings</h3>
            <div className="grid gap-4">
              {providers.map((provider, index) => (
                <div key={provider.name} className="flex items-center space-x-4 p-3 bg-white dark:bg-slate-900 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={provider.enabled}
                      onChange={(e) => updateProvider(index, { ...provider, enabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label className="font-medium text-slate-700 dark:text-slate-300">{provider.name}</label>
                  </div>
                  <input
                    type="password"
                    placeholder="API Key"
                    value={provider.apiKey || ""}
                    onChange={(e) => updateProvider(index, { ...provider, apiKey: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{provider.model}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={repairJson}
                disabled={!inputJson || !inputJson.trim() || isRepairing}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isRepairing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{isRepairing ? "Repairing..." : "Repair JSON"}</span>
              </button>
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
            {inputJson && (
              <>
                <span>Characters: {inputJson.length}</span>
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
              </>
            )}
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
      
      <ImportJsonDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
    </>
  );
}