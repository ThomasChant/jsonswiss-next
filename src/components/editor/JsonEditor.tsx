"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { useJsonStore } from "@/store/jsonStore";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { JsonEditorEmptyState } from "@/components/ui/EmptyState";

interface JsonEditorProps {
  className?: string;
}

export function JsonEditor({ className }: JsonEditorProps) {
  const { jsonData, setJsonData } = useJsonStore();
  const { resolvedTheme } = useTheme();
  const [editorValue, setEditorValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const isUpdatingFromStore = useRef(false);

  // Update editor when jsonData changes (from external sources)
  useEffect(() => {
    if (jsonData && !isUpdatingFromStore.current) {
      const formatted = JSON.stringify(jsonData, null, 2);
      setEditorValue(formatted);
      setValidationError(null);
    } else if (!jsonData && !isUpdatingFromStore.current) {
      // If no jsonData, show empty editor
      setEditorValue("");
    }
  }, [jsonData]);

  // Initialize with default content only when user interacts
  const loadDefaultData = () => {
    const defaultData = {
      name: "John Doe",
      age: 30,
      city: "New York",
      address: {
        street: "123 Main St",
        zipCode: "10001"
      },
      active: true,
      score: 95.5
    };
    const formatted = JSON.stringify(defaultData, null, 2);
    setEditorValue(formatted);
    setJsonData(defaultData, "Default data loaded");
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    
    setEditorValue(value);
    
    // Validate JSON in real-time
    try {
      const parsed = JSON.parse(value);
      setValidationError(null);
      
      // Update store
      isUpdatingFromStore.current = true;
      setJsonData(parsed, "Editor change");
      setTimeout(() => {
        isUpdatingFromStore.current = false;
      }, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid JSON";
      setValidationError(errorMessage);
    }
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

    // Add custom JSON formatting action
    editor.addAction({
      id: 'format-json',
      label: 'Format JSON',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      run: () => {
        try {
          const value = editor.getValue();
          const parsed = JSON.parse(value);
          const formatted = JSON.stringify(parsed, null, 2);
          editor.setValue(formatted);
        } catch (error) {
          // JSON is invalid, let Monaco's built-in formatter handle it
          editor.trigger('editor', 'editor.action.formatDocument');
        }
      },
    });

    // Add search action
    editor.addAction({
      id: 'search-json',
      label: 'Search',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      run: () => {
        editor.trigger('editor', 'actions.find');
      },
    });
  };

  // 检查是否应该显示空状态
  const shouldShowEmptyState = !jsonData && editorValue.trim() === "";

  return (
    <div className={cn("relative h-full min-h-0", className)}>
      {/* 空状态覆盖层 */}
      {shouldShowEmptyState && (
        <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg">
          <JsonEditorEmptyState 
             onImport={() => {
               // 触发文件导入
               const input = document.createElement('input');
               input.type = 'file';
               input.accept = '.json';
               input.onchange = (e) => {
                 const file = (e.target as HTMLInputElement).files?.[0];
                 if (file) {
                   const reader = new FileReader();
                   reader.onload = (e) => {
                     try {
                       const content = e.target?.result as string;
                       const parsed = JSON.parse(content);
                       setJsonData(parsed, `Imported from ${file.name}`);
                       setEditorValue(JSON.stringify(parsed, null, 2));
                     } catch (error) {
                       setValidationError('Invalid JSON file');
                     }
                   };
                   reader.readAsText(file);
                 }
               };
               input.click();
             }}
             onPaste={async () => {
               // 从剪贴板粘贴内容
               try {
                 const text = await navigator.clipboard.readText();
                 if (text.trim()) {
                   setEditorValue(text);
                   // 触发编辑器变化处理
                   handleEditorChange(text);
                 }
               } catch (error) {
                 // 如果无法访问剪贴板，聚焦到编辑器
                 if (editorRef.current) {
                   editorRef.current.focus();
                 }
               }
             }}
             onCreateExample={() => {
               // 创建示例数据
               loadDefaultData();
             }}
           />
        </div>
      )}
      
      {/* Editor */}
      <div className="h-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={editorValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
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
          }}
        />
      </div>

      {/* Validation Status */}
      <div className="absolute top-2 right-2">
        {validationError ? (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-sm border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Invalid JSON</span>
          </div>
        ) : jsonData ? (
          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Valid JSON</span>
          </div>
        ) : null}
      </div>

      {/* Error Details */}
      {validationError && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-red-800 dark:text-red-200">JSON Syntax Error</div>
              <div className="text-sm text-red-600 dark:text-red-400 mt-1 font-mono">
                {validationError}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}