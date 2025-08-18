"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { useJsonStore } from "@/store/jsonStore";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Copy, 
  RotateCcw, 
  Trash2,
  FileText
} from "lucide-react";
import { toast } from "@/lib/toast";
import { useClipboard } from "@/hooks/useClipboard";

interface SidebarJsonEditorProps {
  className?: string;
}

export function SidebarJsonEditor({ className }: SidebarJsonEditorProps) {
  const { 
    sidebarEditorContent, 
    setSidebarEditorContent,
    jsonData,
    setJsonData 
  } = useJsonStore();
  const { resolvedTheme } = useTheme();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidJson, setIsValidJson] = useState(false);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingFromStore = useRef(false);
  const { copy } = useClipboard({ successMessage: 'JSON copied to clipboard' });

  // Initialize editor content
  useEffect(() => {
    if (!sidebarEditorContent && jsonData) {
      try {
        const formatted = JSON.stringify(jsonData, null, 2);
        setSidebarEditorContent(formatted);
      } catch (error) {
        console.error("Failed to format initial JSON:", error);
      }
    }
  }, [jsonData, sidebarEditorContent, setSidebarEditorContent]);

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setValidationError(null);
      setIsValidJson(false);
      return null;
    }

    try {
      const parsed = JSON.parse(value);
      setValidationError(null);
      setIsValidJson(true);
      return parsed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid JSON";
      setValidationError(errorMessage);
      setIsValidJson(false);
      return null;
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    
    isUpdatingFromStore.current = true;
    setSidebarEditorContent(value);
    validateJson(value);
    
    setTimeout(() => {
      isUpdatingFromStore.current = false;
    }, 100);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure JSON language features
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
      schemaRequest: 'warning',
      schemaValidation: 'error',
      comments: 'error',
      trailingCommas: 'error',
    });

    // Handle paste events for auto-formatting
    editor.onDidPaste(() => {
      setTimeout(() => {
        const value = editor.getValue();
        const parsed = validateJson(value);
        if (parsed) {
          try {
            const formatted = JSON.stringify(parsed, null, 2);
            if (formatted !== value) {
              editor.setValue(formatted);
              toast.success("JSON formatted automatically");
            }
          } catch (error) {
            // Ignore formatting errors
          }
        }
      }, 100);
    });
  };

  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['.json', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast.error("Please select a JSON or TXT file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          toast.error("File is empty");
          return;
        }

        // Try to parse and format JSON
        try {
          const parsed = JSON.parse(content);
          const formatted = JSON.stringify(parsed, null, 2);
          setSidebarEditorContent(formatted);
          toast.success(`File "${file.name}" imported successfully`);
        } catch (parseError) {
          // If not valid JSON, just set the content as-is
          setSidebarEditorContent(content);
          toast.warning(`File imported but content is not valid JSON`);
        }
      } catch (error) {
        toast.error("Failed to read file");
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
    };

    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleCopy = async () => {
    try {
      await copy(sidebarEditorContent);
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const handleFormat = () => {
    if (!sidebarEditorContent.trim()) {
      toast.warning("No content to format");
      return;
    }

    try {
      const parsed = JSON.parse(sidebarEditorContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setSidebarEditorContent(formatted);
      toast.success("JSON formatted successfully");
    } catch (error) {
      toast.error("Cannot format invalid JSON");
    }
  };

  const handleClear = () => {
    setSidebarEditorContent("");
    setJsonData(null, "Clear data"); // 同时清空主JSON数据
    setValidationError(null);
    setIsValidJson(false);
    toast.success("Editor cleared");
  };

  return (
    <div className={cn("editor-flex-container h-full", className)}>
      {/* Compact Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleFileImport}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            title="Import File"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Import</span>
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            title="Copy Content"
          >
            <Copy className="w-3 h-3" />
            <span className="hidden sm:inline">Copy</span>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleFormat}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!sidebarEditorContent.trim()}
            title="Format JSON"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Format</span>
          </button>
          
          <button
            onClick={handleClear}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Clear Content"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="editor-content-area relative">
        <div className="monaco-editor-container border-l border-r border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={sidebarEditorContent}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: "on",
              lineNumbersMinChars: 3,
              renderWhitespace: "selection",
              tabSize: 2,
              insertSpaces: true,
              wordWrap: "on",
              wrappingStrategy: "advanced",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              renderLineHighlight: "line",
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: "line",
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              autoIndent: "full",
              colorDecorators: true,
              contextmenu: true,
              copyWithSyntaxHighlighting: true,
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
              find: {
                autoFindInSelection: "never",
                seedSearchStringFromSelection: "always",
                addExtraSpaceOnTop: false,
              },
              suggest: {
                showKeywords: true,
                showSnippets: true,
                showColors: false,
                showFiles: false,
                showReferences: false,
                showFolders: false,
                showTypeParameters: false,
                showIssues: true,
                showUsers: false,
                showWords: true,
              },
              quickSuggestions: {
                other: true,
                comments: false,
                strings: true,
              },
              bracketPairColorization: {
                enabled: true,
              },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
            }}
          />
        </div>

        {/* Validation Status - Compact */}
        <div className="absolute top-1 right-1">
          {validationError ? (
            <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs border border-red-200 dark:border-red-800">
              <AlertCircle className="w-3 h-3" />
              <span className="font-medium">Invalid</span>
            </div>
          ) : isValidJson ? (
            <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-3 h-3" />
              <span className="font-medium">Valid</span>
            </div>
          )  : null}
        </div>

        {/* Error Details - Compact */}
        {validationError && (
          <div className="absolute bottom-1 left-1 right-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
            <div className="flex items-start space-x-1">
              <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-red-800 dark:text-red-200">Syntax Error</div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-0.5 font-mono break-words">
                  {validationError}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}