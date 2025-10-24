"use client";

import { useState } from "react";
import { FileArchive, FileText, Package, Info, AlertCircle, CheckCircle2, Clock, Files, Database, Settings, Layers, Copy, Download } from "lucide-react";
import { jarToJson, JarAnalysis } from "@/lib/converters";
import { ToolPageLayoutServer } from "@/components/layout/ToolPageLayoutServer";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";
import { Editor } from "@monaco-editor/react";

interface AnalysisStats {
  totalFiles: number;
  totalClasses: number;
  totalResources: number;
  packages: number;
  dependencies: number;
  jarType: string;
  fileSize: number;
}

export default function JarToJsonPage() {
  const [jarFile, setJarFile] = useState<File | null>(null);
  const [outputJson, setOutputJson] = useState("");
  const [analysis, setAnalysis] = useState<JarAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { copy } = useClipboard({ successMessage: 'JSON copied to clipboard' });

  const [analysisOptions, setAnalysisOptions] = useState({
    includeManifest: true,
    includeClasses: true,
    includeResources: true,
    includeStructure: true,
    includeMetadata: true,
    extractContent: false, // For security, don't extract file content by default
    simplifiedOutput: false,
  });

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setJarFile(null);
      setOutputJson("");
      setAnalysis(null);
      setError(null);
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.jar') && !file.name.toLowerCase().endsWith('.war') && !file.name.toLowerCase().endsWith('.ear')) {
      setError("Please select a valid JAR, WAR, or EAR file");
      return;
    }

    setJarFile(file);
    await convertJarToJson(file);
  };

  const convertJarToJson = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const jarAnalysis = await jarToJson(file);
      setAnalysis(jarAnalysis);

      // Generate filtered JSON based on options
      const filteredAnalysis = filterAnalysis(jarAnalysis, analysisOptions);
      const jsonOutput = JSON.stringify(filteredAnalysis, null, 2);
      setOutputJson(jsonOutput);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze JAR file";
      setError(errorMessage);
      setOutputJson("");
      setAnalysis(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const filterAnalysis = (analysis: JarAnalysis, options: typeof analysisOptions): Partial<JarAnalysis> => {
    const filtered: Partial<JarAnalysis> = {};

    if (options.includeManifest && analysis.manifest) {
      filtered.manifest = analysis.manifest;
    }

    if (options.includeClasses) {
      if (options.simplifiedOutput) {
        // Simplified class information
        filtered.classes = analysis.classes.map(cls => ({
          packageName: cls.packageName,
          className: cls.className,
          superClass: cls.superClass,
          interfaces: cls.interfaces,
          fields: [], // Empty in simplified mode
          methods: [], // Empty in simplified mode
          annotations: [], // Empty in simplified mode
          isPublic: cls.isPublic,
          isAbstract: cls.isAbstract,
          isFinal: cls.isFinal
        }));
      } else {
        filtered.classes = analysis.classes;
      }
    }

    if (options.includeResources) {
      if (options.extractContent) {
        filtered.resources = analysis.resources;
      } else {
        // Remove content for security
        filtered.resources = analysis.resources.map(resource => ({
          name: resource.name,
          isDirectory: resource.isDirectory,
          size: resource.size,
          type: resource.type
        }));
      }
    }

    if (options.includeStructure) {
      filtered.structure = analysis.structure;
    }

    if (options.includeMetadata) {
      filtered.metadata = analysis.metadata;
    }

    return filtered;
  };

  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jar,.war,.ear";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileChange(file);
      }
    };
    input.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const getAnalysisStats = (analysis: JarAnalysis): AnalysisStats => {
    return {
      totalFiles: analysis.structure.totalFiles,
      totalClasses: analysis.structure.totalClasses,
      totalResources: analysis.structure.totalResources,
      packages: analysis.structure.packages.length,
      dependencies: analysis.structure.dependencies.length,
      jarType: analysis.metadata.jarType,
      fileSize: analysis.metadata.fileSize
    };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderInputPanel = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <FileArchive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="font-medium text-slate-800 dark:text-slate-200">JAR File Input</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 rounded-md transition-colors",
                showSettings
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
              title="Analysis Options"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleFileImport}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              Select JAR File
            </button>
          </div>
        </div>

        {/* Analysis Options */}
        {showSettings && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Analysis Options</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={analysisOptions.includeManifest}
                  onChange={(e) => setAnalysisOptions(prev => ({ ...prev, includeManifest: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span>Include Manifest</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={analysisOptions.includeClasses}
                  onChange={(e) => setAnalysisOptions(prev => ({ ...prev, includeClasses: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span>Include Classes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={analysisOptions.includeResources}
                  onChange={(e) => setAnalysisOptions(prev => ({ ...prev, includeResources: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span>Include Resources</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={analysisOptions.includeStructure}
                  onChange={(e) => setAnalysisOptions(prev => ({ ...prev, includeStructure: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span>Include Structure</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={analysisOptions.includeMetadata}
                  onChange={(e) => setAnalysisOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span>Include Metadata</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={analysisOptions.simplifiedOutput}
                  onChange={(e) => setAnalysisOptions(prev => ({ ...prev, simplifiedOutput: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span>Simplified Output</span>
              </label>
            </div>
            <button
              onClick={() => jarFile && convertJarToJson(jarFile)}
              disabled={!jarFile || isProcessing}
              className="mt-3 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white rounded-md text-sm font-medium transition-colors"
            >
              Re-analyze with Options
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          {!jarFile ? (
            <div
              className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg m-4 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleFileImport}
            >
              <div className="text-center">
                <FileArchive className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Drop JAR file here or click to browse
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Supports .jar, .war, and .ear files
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                {/* File Info */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Package className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium text-slate-800 dark:text-slate-200">File Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Name:</span>
                      <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">{jarFile.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Size:</span>
                      <span className="ml-2 text-slate-800 dark:text-slate-200">{formatFileSize(jarFile.size)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Type:</span>
                      <span className="ml-2 text-slate-800 dark:text-slate-200">{jarFile.type || 'application/java-archive'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Status:</span>
                      {isProcessing ? (
                        <span className="ml-2 flex items-center text-blue-600">
                          <Clock className="w-4 h-4 mr-1 animate-spin" />
                          Processing...
                        </span>
                      ) : analysis ? (
                        <span className="ml-2 flex items-center text-green-600">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Analyzed
                        </span>
                      ) : error ? (
                        <span className="ml-2 flex items-center text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Error
                        </span>
                      ) : (
                        <span className="ml-2 text-slate-500">Ready</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Analysis Stats */}
                {analysis && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Layers className="w-5 h-5 text-green-500" />
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">Analysis Summary</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {(() => {
                        const stats = getAnalysisStats(analysis);
                        return (
                          <>
                            <div className="flex items-center space-x-2">
                              <Files className="w-4 h-4 text-blue-500" />
                              <span className="text-slate-500 dark:text-slate-400">Total Files:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.totalFiles}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Database className="w-4 h-4 text-purple-500" />
                              <span className="text-slate-500 dark:text-slate-400">Classes:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.totalClasses}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-orange-500" />
                              <span className="text-slate-500 dark:text-slate-400">Resources:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.totalResources}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-teal-500" />
                              <span className="text-slate-500 dark:text-slate-400">Packages:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.packages}</span>
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Info className="w-4 h-4 text-indigo-500" />
                                <span className="text-slate-500 dark:text-slate-400">JAR Type:</span>
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium uppercase",
                                  stats.jarType === 'executable' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                  stats.jarType === 'library' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                                  stats.jarType === 'web-app' ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                                  "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400"
                                )}>
                                  {stats.jarType}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-red-700 dark:text-red-300">Analysis Error</span>
                    </div>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const faqItems = [
    {
      question: "What can the JAR to JSON converter analyze?",
      answer: "The converter can extract and analyze JAR file structure, including class files, resources, manifest information, package structure, dependencies, and metadata. It supports JAR, WAR, and EAR files."
    },
    {
      question: "What information is included in the JSON output?",
      answer: "The JSON output includes manifest data (main class, version, build info), class structure (packages, classes, methods, fields), resource files, overall structure statistics, and metadata about the JAR type and size."
    },
    {
      question: "Is the content of files extracted?",
      answer: "By default, file content is not extracted for security reasons. You can enable content extraction in the analysis options, but this should only be done with trusted JAR files."
    },
    {
      question: "What types of JAR files are supported?",
      answer: "The tool supports standard JAR files, WAR (Web Application Archive) files, and EAR (Enterprise Application Archive) files. It can identify executable JARs, libraries, and web applications."
    },
    {
      question: "How accurate is the class analysis?",
      answer: "The current implementation provides basic class structure analysis including package names, class names, and file organization. For detailed bytecode analysis including methods and fields, a more advanced Java bytecode parser would be needed."
    },
    {
      question: "Can I use this for security analysis?",
      answer: "Yes, this tool can help with security analysis by revealing the structure of JAR files, identifying dependencies, and showing resource files. However, it should be used alongside other security tools for comprehensive analysis."
    }
  ];

  // Handle download JSON
  const handleDownloadJson = () => {
    if (!outputJson) return;
    
    const blob = new Blob([outputJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${jarFile?.name || 'jar-analysis'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageLayoutServer
      title="JAR to JSON File Converter"
      description="Analyze JAR file structure and convert to JSON format for dependency analysis and visualization"
      faqItems={faqItems}
      showSidebar={false}
    >
      <div className="p-4 h-full flex flex-col min-h-0 min-h-core-min max-h-core-max h-core-default">
        <div className="grid grid-cols-2 gap-2 h-full min-h-0">
          {/* Input Panel */}
          <div className="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            {renderInputPanel()}
          </div>

          {/* Output Panel */}
          <div className="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="font-medium text-slate-800 dark:text-slate-200">JSON Output</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copy(outputJson)}
                  disabled={!outputJson}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    outputJson
                      ? "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  )}
                  title="Copy JSON"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadJson}
                  disabled={!outputJson}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    outputJson
                      ? "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  )}
                  title="Download JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {outputJson ? (
                <Editor
                  height="100%"
                  language="json"
                  value={outputJson}
                  theme="vs"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "var(--font-mono)",
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'none',
                    cursorBlinking: 'smooth',
                    contextmenu: false,
                    lineNumbers: 'on'
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">JAR Analysis Result</p>
                    <p className="text-sm">Upload a JAR file to see the analysis</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayoutServer>
  );
}
