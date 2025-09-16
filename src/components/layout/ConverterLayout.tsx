"use client";

import { ReactNode } from "react";
import { useTheme } from "next-themes";
import { Editor } from "@monaco-editor/react";
import {
  Download,
  Copy,
  Upload,
  Maximize2,
  Minimize2,
  Settings,
  FileText,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportJsonDialog, ImportSource, ImportMetadata } from "@/components/import/ImportJsonDialog";
import { ToolPageLayoutServer } from "./ToolPageLayoutServer";

interface ConverterLayoutProps {
  // 页面基本信息
  title: string;
  description: string;
  faqItems: Array<{ question: string; answer: string }>;
  
  // 编辑器状态
  inputData: string;
  outputData: string;
  error: string | null;
  
  // 布局状态
  isInputMaximized: boolean;
  isOutputMaximized: boolean;
  showSettings: boolean;
  importDialogOpen?: boolean;
  
  // 验证状态
  inputValidationStatus?: ReactNode;
  
  // 语言配置
  inputLanguage: string;
  outputLanguage: string;
  inputLanguageDisplayName: string;
  outputLanguageDisplayName: string;
  inputIcon?: ReactNode;
  outputIcon?: ReactNode;
  
  // 事件处理
  onInputChange: (value: string | undefined) => void;
  onCopy: () => void;
  onDownload: () => void;
  onImport?: (data: any, source: ImportSource, metadata?: ImportMetadata) => void;
  onFileImport?: () => void;
  onToggleInputMaximize: () => void;
  onToggleOutputMaximize: () => void;
  onToggleSettings: () => void;
  onToggleImportDialog?: (open: boolean) => void;
  
  // 设置面板内容
  settingsPanel?: ReactNode;
  
  // 空状态内容
  emptyStateContent?: ReactNode;
  
  // 自定义输入面板内容
  customInputContent?: ReactNode;
  
  // 自定义输出面板内容
  customOutputContent?: ReactNode;
  
  // 额外的操作按钮
  extraActions?: ReactNode;
  
  // 统计信息
  stats?: ReactNode;
}

export function ConverterLayout({
  title,
  description,
  faqItems,
  inputData,
  outputData,
  error,
  isInputMaximized,
  isOutputMaximized,
  showSettings,
  importDialogOpen = false,
  inputValidationStatus,
  inputLanguage,
  outputLanguage,
  inputLanguageDisplayName,
  outputLanguageDisplayName,
  inputIcon,
  outputIcon,
  onInputChange,
  onCopy,
  onDownload,
  onImport,
  onFileImport,
  onToggleInputMaximize,
  onToggleOutputMaximize,
  onToggleSettings,
  onToggleImportDialog,
  settingsPanel,
  emptyStateContent,
  customInputContent,
  customOutputContent,
  extraActions,
  stats
}: ConverterLayoutProps) {
  const { resolvedTheme } = useTheme();


  const defaultEmptyState = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center">
        {outputIcon || <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />}
        <p>Enter {inputLanguageDisplayName} data to convert to {outputLanguageDisplayName}</p>
        <p className="text-sm mt-2">Your converted data will appear here</p>
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
                    {inputIcon || <FileText className="w-4 h-4" />}
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{inputLanguageDisplayName} Input</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Validation Status in Header */}
                    {inputValidationStatus && (
                      <div className="mr-2">
                        {inputValidationStatus}
                      </div>
                    )}
                    {onFileImport && (
                      <button
                        onClick={onFileImport}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title={`Import ${inputLanguageDisplayName} file`}
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                    {onToggleImportDialog && (
                      <button
                        onClick={() => onToggleImportDialog(true)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Import JSON"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
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
                  {customInputContent ? (
                    customInputContent
                  ) : (
                    <Editor
                      height="100%"
                      defaultLanguage={inputLanguage}
                      value={inputData}
                      onChange={onInputChange}
                      theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
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
                  )}
                </div>
              </div>
            )}

            {/* Output Editor */}
            {!isInputMaximized && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    {outputIcon || <ArrowRightLeft className="w-4 h-4" />}
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{outputLanguageDisplayName} Output</h3>
                    {stats && <div className="ml-4">{stats}</div>}
                  </div>
                  <div className="flex items-center gap-1">
                    {extraActions}
                    <button
                      onClick={onCopy}
                      disabled={!outputData}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Copy ${outputLanguageDisplayName}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onDownload}
                      disabled={!outputData}
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
                        title="Conversion settings"
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
                  {customOutputContent ? (
                    customOutputContent
                  ) : error ? (
                    <div className="h-full flex items-center justify-center p-6">
                      <div className="text-center max-w-md">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          Conversion Error
                        </h3>
                        <p className="text-red-600 dark:text-red-400 text-sm">
                          {error}
                        </p>
                      </div>
                    </div>
                  ) : outputData ? (
                    <Editor
                      height="100%"
                      defaultLanguage={outputLanguage}
                      value={outputData}
                      theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
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
      
      {onToggleImportDialog && (
        <ImportJsonDialog
          open={importDialogOpen}
          onOpenChange={onToggleImportDialog}
          onImport={onImport!}
        />
      )}
    </ToolPageLayoutServer>
  );
}