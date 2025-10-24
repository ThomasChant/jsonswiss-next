"use client";

import { ReactNode, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { setCachedRawJson, clearCachedJson, getInitialCachedJson } from "@/lib/json-cache";
import {
  Download,
  Copy,
  Upload,
  Maximize2,
  Minimize2,
  Settings,
  FileText,
  Code2,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolPageLayoutServer } from "@/components/layout/ToolPageLayoutServer";
import { ImportJsonDialog, ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";

interface CodeGeneratorLayoutProps {
  // 页面基本信息
  title: string;
  description: string;
  faqItems: Array<{ question: string; answer: string }>;
  
  // 编辑器状态
  inputJson: string;
  generatedCode: string;
  error: string | null;
  
  // 布局状态
  isInputMaximized: boolean;
  isOutputMaximized: boolean;
  showSettings: boolean;
  importDialogOpen: boolean;
  
  // 语言配置
  outputLanguage: string;
  outputLanguageDisplayName: string;
  outputIcon?: ReactNode;
  
  // 事件处理
  onInputChange: (value: string | undefined) => void;
  onCopyCode: () => void;
  onDownload: () => void;
  onImport: (json: string, source: ImportSource, metadata?: ImportMetadata) => void;
  onToggleInputMaximize: () => void;
  onToggleOutputMaximize: () => void;
  onToggleSettings: () => void;
  onToggleImportDialog: (open: boolean) => void;
  
  // 设置面板内容
  settingsPanel?: ReactNode;
  
  // 空状态内容
  emptyStateContent?: ReactNode;
}

export function CodeGeneratorLayout({
  title,
  description,
  faqItems,
  inputJson,
  generatedCode,
  error,
  isInputMaximized,
  isOutputMaximized,
  showSettings,
  importDialogOpen,
  outputLanguage,
  outputLanguageDisplayName,
  outputIcon,
  onInputChange,
  onCopyCode,
  onDownload,
  onImport,
  onToggleInputMaximize,
  onToggleOutputMaximize,
  onToggleSettings,
  onToggleImportDialog,
  settingsPanel,
  emptyStateContent
}: CodeGeneratorLayoutProps) {
  // Prefill input from local cache if page-level state is empty
  useEffect(() => {
    if (!inputJson || !inputJson.trim()) {
      const cached = getInitialCachedJson();
      if (cached) onInputChange(cached);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultEmptyState = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center">
        {outputIcon || <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
        <p>Enter JSON data to generate {outputLanguageDisplayName} code</p>
        <p className="text-sm mt-2">Analyze JSON structure and create corresponding code</p>
      </div>
    </div>
  );

  return (
    <ToolPageLayoutServer
      title={title}
      description={description}
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
          <div className={cn(
            "grid gap-2 h-full min-h-0",
            isInputMaximized ? "grid-cols-1" : isOutputMaximized ? "grid-cols-1" : "grid-cols-2"
          )}>
            {/* Input Editor */}
            {!isOutputMaximized && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">JSON Input</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleImportDialog(true)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Import JSON"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { clearCachedJson(); onInputChange(''); }}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Clear input and local cache"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onToggleInputMaximize}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title={isInputMaximized ? "Minimize" : "Maximize"}
                    >
                      {isInputMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0" style={{ minHeight: '300px' }}>
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={inputJson}
                    onChange={(val) => { setCachedRawJson(val || ''); onInputChange(val); }}
                    theme="vs"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "var(--font-mono)",
                      wordWrap: "on",
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      renderLineHighlight: 'none',
                      cursorBlinking: 'smooth',
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Output Editor */}
            {!isInputMaximized && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    {outputIcon || <Code2 className="w-4 h-4" />}
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Generated {outputLanguageDisplayName}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onCopyCode}
                      disabled={!generatedCode}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Copy ${outputLanguageDisplayName} code`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onDownload}
                      disabled={!generatedCode}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Download ${outputLanguageDisplayName} file`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {settingsPanel && (
                      <button
                        onClick={onToggleSettings}
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          showSettings
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                        title={`${outputLanguageDisplayName} generation settings`}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={onToggleOutputMaximize}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title={isOutputMaximized ? "Minimize" : "Maximize"}
                    >
                      {isOutputMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Settings Panel */}
                {showSettings && settingsPanel && (
                  <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                    {settingsPanel}
                  </div>
                )}
                
                <div className="flex-1 min-h-0" style={{ minHeight: '300px' }}>
                  {generatedCode ? (
                    <Editor
                      height="100%"
                      defaultLanguage={outputLanguage}
                      value={generatedCode}
                      theme="vs"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "var(--font-mono)",
                        wordWrap: "on",
                        readOnly: true,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        renderLineHighlight: 'none',
                        cursorBlinking: 'smooth',
                      }}
                    />
                  ) : (
                    emptyStateContent || defaultEmptyState
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ImportJsonDialog
        open={importDialogOpen}
        onOpenChange={onToggleImportDialog}
        onImport={onImport}
      />
    </ToolPageLayoutServer>
  );
}
