"use client";

import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFileImport } from '@/hooks/useFileImport';
import { useJsonStore } from '@/store/jsonStore';
import { toast } from '@/lib/toast';
import { fetchJsonFromUrl, isValidUrl, normalizeUrl } from '@/lib/url-import';
import { SAMPLE_JSON, SAMPLE_MINIFIED_JSON, compareSamples } from '@/sample-data';
import type { ComparisonSamplePair } from '@/sample-data';
import { getSampleById } from '@/sample-data/table-editor-samples';
import { Upload, Link, FileText, Database, Check, AlertCircle, Loader2 } from 'lucide-react';

export type ImportSource = 'paste' | 'file' | 'url' | 'sample';

export interface ImportMetadata {
  source: ImportSource;
  fileName?: string;
  url?: string;
  sampleKey?: string;
  fileSize?: number;
  contentType?: string;
}

export interface ImportJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (json: any, source: ImportSource, metadata: ImportMetadata) => void;
  initialTab?: ImportSource;
  title?: string;
  description?: string;
  showComparisonSamples?: boolean;
  // When true, allow importing invalid JSON (pass raw content string)
  allowInvalidJson?: boolean;
  // For JSON Compare dialog: which side is being imported
  comparisonSide?: 'A' | 'B';
  // Auto-import comparison sample immediately after selection
  autoImportComparisonSelection?: boolean;
  // Control whether the Sample Data tab is shown
  showSampleTab?: boolean;
}

type TabId = ImportSource;

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'paste', label: 'Paste JSON', icon: <FileText className="w-4 h-4" /> },
  { id: 'file', label: 'Upload File', icon: <Upload className="w-4 h-4" /> },
  { id: 'url', label: 'From URL', icon: <Link className="w-4 h-4" /> },
  { id: 'sample', label: 'Sample Data', icon: <Database className="w-4 h-4" /> },
];

const SAMPLE_CATEGORIES = {
  basic: { 
    label: 'Basic Examples', 
    items: [
      { key: 'simple_object', name: 'Simple Object', data: { name: "John Doe", age: 30, city: "New York" } },
      { key: 'simple_array', name: 'Simple Array', data: ["apple", "banana", "cherry", "date"] },
      { key: 'nested_data', name: 'Nested Structure', data: { users: [{ id: 1, name: "Alice", profile: { email: "alice@example.com", active: true } }, { id: 2, name: "Bob", profile: { email: "bob@example.com", active: false } }] } }
    ]
  },
  complex: { 
    label: 'Complex Examples', 
    items: [
      { key: 'company_data', name: 'Company Data', data: SAMPLE_JSON },
      { key: 'minified_json', name: 'Minified JSON', data: SAMPLE_MINIFIED_JSON },
      { key: 'employee_directory', name: 'Employee Directory (50 Records)', data: getSampleById('employee_directory')?.data || [] }
    ]
  }
};

export function ImportJsonDialog({
  open,
  onOpenChange,
  onImport,
  initialTab = 'paste',
  title = 'Import JSON Data',
  description = 'Choose how you want to import your JSON data',
  showComparisonSamples = false,
  allowInvalidJson = false,
  comparisonSide,
  autoImportComparisonSelection = true,
  showSampleTab = true,
}: ImportJsonDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [selectedSample, setSelectedSample] = useState('');
  const [selectedComparisonSample, setSelectedComparisonSample] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  // In repair mode (allowInvalidJson), skip strict JSON validation in the hook
  const { importFile, isLoading: fileLoading } = useFileImport({ autoDetectFormat: !allowInvalidJson });
  const { setJsonData } = useJsonStore();

  // Validate JSON paste content
  const validatePasteContent = useCallback((content: string) => {
    if (!content.trim()) {
      setPasteError(null);
      return false;
    }

    try {
      JSON.parse(content);
      setPasteError(null);
      return true;
    } catch (error) {
      setPasteError(error instanceof Error ? error.message : 'Invalid JSON');
      return false;
    }
  }, []);

  // Handle paste content change
  const handlePasteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setPasteContent(content);
    validatePasteContent(content);
  }, [validatePasteContent]);

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importFile(file);
      if (result) {
        const metadata: ImportMetadata = {
          source: 'file',
          fileName: result.fileName,
          fileSize: result.fileSize,
          contentType: result.fileType,
        };

        if (allowInvalidJson) {
          // Pass raw content string for repair workflows
          onImport?.(result.content, 'file', metadata);
        } else {
          const parsedJson = JSON.parse(result.content);
          setJsonData(parsedJson, `Import file: ${result.fileName}`);
          onImport?.(parsedJson, 'file', metadata);
        }
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import file');
    }
  }, [importFile, setJsonData, onImport, onOpenChange, allowInvalidJson]);

  // Handle drag and drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    try {
      const result = await importFile(file);
      if (result) {
        const metadata: ImportMetadata = {
          source: 'file',
          fileName: result.fileName,
          fileSize: result.fileSize,
          contentType: result.fileType,
        };

        if (allowInvalidJson) {
          onImport?.(result.content, 'file', metadata);
        } else {
          const parsedJson = JSON.parse(result.content);
          setJsonData(parsedJson, `Import file: ${result.fileName}`);
          onImport?.(parsedJson, 'file', metadata);
        }
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import file');
    }
  }, [importFile, setJsonData, onImport, onOpenChange, allowInvalidJson]);

  // Handle URL import
  const handleUrlImport = useCallback(async () => {
    const normalizedUrl = normalizeUrl(urlInput.trim());
    
    if (!isValidUrl(normalizedUrl)) {
      toast.error('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    setUrlLoading(true);
    try {
      const result = await fetchJsonFromUrl(normalizedUrl);
      const metadata: ImportMetadata = {
        source: 'url',
        url: result.url,
        contentType: result.contentType,
      };

      setJsonData(result.json, `Import URL: ${result.url}`);
      onImport?.(result.json, 'url', metadata);
      onOpenChange(false);
      toast.success('JSON imported successfully from URL');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import from URL');
    } finally {
      setUrlLoading(false);
    }
  }, [urlInput, setJsonData, onImport, onOpenChange]);

  // Handle sample data import
  const handleSampleImport = useCallback(() => {
    if (!selectedSample) {
      toast.error('Please select a sample to import');
      return;
    }

    try {
      // Find the sample data
      let sampleData: any = null;
      let sampleName = '';
      
      for (const category of Object.values(SAMPLE_CATEGORIES)) {
        const item = category.items.find(item => item.key === selectedSample);
        if (item) {
          sampleData = item.data;
          sampleName = item.name;
          break;
        }
      }

      if (!sampleData) {
        toast.error('Sample data not found');
        return;
      }

      let parsedJson: any;
      if (typeof sampleData === 'string') {
        parsedJson = JSON.parse(sampleData);
      } else {
        parsedJson = sampleData;
      }

      const metadata: ImportMetadata = {
        source: 'sample',
        sampleKey: selectedSample,
      };

      setJsonData(parsedJson, `Import sample: ${sampleName}`);
      onImport?.(parsedJson, 'sample', metadata);
      onOpenChange(false);
      toast.success(`Sample data "${sampleName}" imported successfully`);
    } catch (error) {
      toast.error('Failed to import sample data');
    }
  }, [selectedSample, setJsonData, onImport, onOpenChange]);

  // Handle comparison sample import
  const importComparisonSample = useCallback((sampleKey: string, side: 'A' | 'B') => {
    if (!sampleKey) {
      toast.error('Please select a comparison sample');
      return;
    }

    try {
      const sample = compareSamples[sampleKey as keyof typeof compareSamples];
      const jsonData = side === 'A' ? sample.jsonA : sample.jsonB;
      const parsedJson = JSON.parse(jsonData);

      const metadata: ImportMetadata = {
        source: 'sample',
        sampleKey: `${sampleKey}-${side}`,
      };

      setJsonData(parsedJson, `Import comparison sample: ${sample.name} (${side})`);
      onImport?.(parsedJson, 'sample', metadata);
      onOpenChange(false);
      toast.success(`Comparison sample "${sample.name}" (Side ${side}) imported successfully`);
    } catch (error) {
      toast.error('Failed to import comparison sample');
    }
  }, [setJsonData, onImport, onOpenChange]);

  const handleComparisonSampleImport = useCallback((side: 'A' | 'B') => {
    importComparisonSample(selectedComparisonSample, side);
  }, [selectedComparisonSample, importComparisonSample]);

  // Handle paste import
  const handlePasteImport = useCallback(() => {
    if (!pasteContent.trim()) {
      toast.error('Please paste some JSON content');
      return;
    }

    // In repair mode, allow importing raw invalid JSON text
    if (allowInvalidJson) {
      const metadata: ImportMetadata = { source: 'paste' };
      onImport?.(pasteContent, 'paste', metadata);
      onOpenChange(false);
      toast.success('Content imported for repair');
      return;
    }

    if (pasteError) {
      toast.error('Please fix the JSON syntax errors before importing');
      return;
    }

    try {
      const parsedJson = JSON.parse(pasteContent);
      const metadata: ImportMetadata = {
        source: 'paste',
      };

      setJsonData(parsedJson, 'Import pasted JSON');
      onImport?.(parsedJson, 'paste', metadata);
      onOpenChange(false);
      toast.success('JSON imported successfully');
    } catch (error) {
      toast.error('Failed to parse JSON content');
    }
  }, [pasteContent, pasteError, setJsonData, onImport, onOpenChange, allowInvalidJson]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setPasteContent('');
      setPasteError(null);
      setUrlInput('');
      setSelectedSample('');
      setSelectedComparisonSample('');
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // If Sample tab is hidden while active, switch to paste tab
  React.useEffect(() => {
    if (!showSampleTab && activeTab === 'sample') {
      setActiveTab('paste');
    }
  }, [showSampleTab, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'paste':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="paste-content">JSON Content</Label>
              <div className="relative">
                <textarea
                  id="paste-content"
                  className={`w-full h-64 p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    pasteError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-800 dark:text-white`}
                  placeholder="Paste your JSON content here..."
                  value={pasteContent}
                  onChange={handlePasteChange}
                />
                {pasteContent && (
                  <div className="absolute top-2 right-2">
                    {pasteError ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {pasteError && (
                <p className="text-sm text-red-500 mt-1">{pasteError}</p>
              )}
            </div>
            <Button 
              onClick={handlePasteImport}
              disabled={!pasteContent.trim() || (!allowInvalidJson && !!pasteError)}
              className="w-full"
            >
              {allowInvalidJson ? 'Import JSON' : 'Import JSON'}
            </Button>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Drop JSON file here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
              <Button variant="outline" disabled={fileLoading}>
                {fileLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Select File'
                )}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 text-center">
              Supported formats: JSON (.json), Text (.txt)
            </p>
          </div>
        );

      case 'url':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url-input">JSON URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://api.example.com/data.json"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={urlLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a URL that returns JSON data. CORS must be enabled on the server.
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <Label className="text-sm font-medium">Try Example URL:</Label>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <a 
                      href="https://fake-json-api.mock.beeceptor.com/users"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-mono break-all"
                    >
                      https://fake-json-api.mock.beeceptor.com/users
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Mock API returning user data array
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUrlInput('https://fake-json-api.mock.beeceptor.com/users')}
                    className="ml-2 flex-shrink-0"
                  >
                    Use
                  </Button>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleUrlImport}
              disabled={!urlInput.trim() || urlLoading}
              className="w-full"
            >
              {urlLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                'Import from URL'
              )}
            </Button>
          </div>
        );

      case 'sample':
        return (
          <div className="space-y-4">
            {showComparisonSamples ? (
              <div>
                <Label htmlFor="comparison-sample-select">Comparison Samples</Label>
                <div className="mt-2">
                  <Select 
                    value={selectedComparisonSample} 
                    onValueChange={(value) => {
                      setSelectedComparisonSample(value);
                      if (showComparisonSamples && autoImportComparisonSelection && comparisonSide) {
                        importComparisonSample(value, comparisonSide);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a comparison sample..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(compareSamples).map(([key, sample]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span className="font-medium">{sample.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{sample.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!autoImportComparisonSelection && selectedComparisonSample && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleComparisonSampleImport('A')}
                      variant="outline"
                      className="flex-1"
                    >
                      Import Side A
                    </Button>
                    <Button 
                      onClick={() => handleComparisonSampleImport('B')}
                      variant="outline"
                      className="flex-1"
                    >
                      Import Side B
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(SAMPLE_CATEGORIES).map(([categoryKey, category]) => (
                  <div key={categoryKey}>
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {category.label}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {category.items.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setSelectedSample(item.key)}
                          className={`p-3 text-sm border rounded text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            selectedSample === item.key
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono whitespace-pre-wrap">
                            {(() => {
                              let preview: string;
                              if (typeof item.data === 'string') {
                                // For string data (like broken JSON), show first few lines
                                preview = item.data.split('\n').slice(0, 3).join('\n');
                              } else {
                                // For object data, show formatted JSON
                                preview = JSON.stringify(item.data, null, 2);
                              }
                              
                              // Limit to 150 characters but try to keep it readable
                              if (preview.length > 150) {
                                const truncated = preview.substring(0, 150);
                                const lastNewline = truncated.lastIndexOf('\n');
                                return (lastNewline > 100 ? truncated.substring(0, lastNewline) : truncated) + '\n...';
                              }
                              return preview;
                            })()}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={handleSampleImport}
                  disabled={!selectedSample}
                  className="w-full"
                >
                  Import Sample Data
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Tabs to render (optionally hide 'sample')
  const tabsToRender = React.useMemo(() => {
    return showSampleTab ? TABS : TABS.filter(t => t.id !== 'sample');
  }, [showSampleTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] min-h-[50vh] overflow-y-auto"
        onInteractOutside={(e) => {
          const el = e.target as HTMLElement;
          // Allow interacting with portaled select dropdowns without the dialog intercepting
          if (el.closest('[data-select-portal]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabsToRender.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {renderTabContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
