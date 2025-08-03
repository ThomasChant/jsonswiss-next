
"use client";

import { ConverterLayout } from "@/components/layout/ConverterLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { MockDataOptions, generateMockData, validateSchemaForMockGeneration } from "@/lib/mock-data";
import { analyzeSchema, validateJsonSchema } from "@/lib/schema-utils";
import { cn } from "@/lib/utils";
import { getSchemaById } from "@/sample-data/schemas";
import { useJsonStore } from "@/store/jsonStore";
import { Clock, Database, Dices, FileJson2, FileText, Hash, RefreshCw, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

export default function MockGeneratorPage() {
  const { resolvedTheme } = useTheme();
  const { jsonData, setJsonData } = useJsonStore();
  const [schemaInput, setSchemaInput] = useState("");
  const [mockOutput, setMockOutput] = useState("");
  const [error, setError] = useState("");
  const [schemaValid, setSchemaValid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStats, setGenerationStats] = useState<{
    propertyCount: number;
    generationTime: number;
    dataSize: string;
  } | null>(null);

  const [options, setOptions] = useState<MockDataOptions>({
    arrayCount: 3,
    seed: 12345,
    locale: 'en',
    fillProperties: true,
    optionalsProbability: 0.8,
  });
  const [showOptions, setShowOptions] = useState(false);
  const [isInputMaximized, setIsInputMaximized] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { copy } = useClipboard({
    successMessage: 'Mock data copied to clipboard',
    errorMessage: 'Failed to copy mock data'
  });

  // Validate schema on input change
  useEffect(() => {
    if (!schemaInput.trim()) {
      setSchemaValid(false);
      setError("");
      return;
    }

    try {
      const parsed = JSON.parse(schemaInput);
      const validation = validateJsonSchema(parsed);
      const mockValidation = validateSchemaForMockGeneration(parsed);
      
      if (!validation.isValid) {
        setError(`Invalid JSON Schema: ${validation.errors.join(', ')}`);
        setSchemaValid(false);
      } else if (!mockValidation.isValid) {
        setError(`Schema not suitable for mock generation: ${mockValidation.errors.join(', ')}`);
        setSchemaValid(false);
      } else {
        setError("");
        setSchemaValid(true);
      }
    } catch (err) {
      setError('Invalid JSON format');
      setSchemaValid(false);
    }
  }, [schemaInput]);

  // Generate mock data
  const generateMockDataFromSchema = useCallback(async () => {
    if (!schemaInput.trim() || !schemaValid) return;

    setIsGenerating(true);
    setError("");

    try {
      const schema = JSON.parse(schemaInput);
      const startTime = Date.now();
      
      const mockData = generateMockData(schema, options);
      const generationTime = Date.now() - startTime;
      
      const formattedOutput = JSON.stringify(mockData, null, 2);
      setMockOutput(formattedOutput);
      setJsonData(mockData, "Generated mock data");

      // Calculate stats
      const analysis = analyzeSchema(schema);
      setGenerationStats({
        propertyCount: analysis.propertyCount,
        generationTime,
        dataSize: analysis.estimatedDataSize
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Mock data generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [schemaInput, schemaValid, options, setJsonData]);

  // Auto-generate when schema or options change
  useEffect(() => {
    if (schemaValid) {
      const timeoutId = setTimeout(() => {
        generateMockDataFromSchema();
      }, 500); // Debounce

      return () => clearTimeout(timeoutId);
    } else {
      setMockOutput("");
      setGenerationStats(null);
    }
  }, [schemaValid, options, generateMockDataFromSchema]);

  // Handle schema input change
  const handleSchemaChange = (value: string | undefined) => {
    const newValue = value || "";
    setSchemaInput(newValue);
  };

  // Handle input change for ConverterLayout
  const handleInputChange = (value: string | undefined) => {
    handleSchemaChange(value);
  };

  // Handle maximize/minimize functions
  const handleToggleInputMaximize = () => {
    setIsInputMaximized(!isInputMaximized);
  };

  const handleToggleOutputMaximize = () => {
    setIsOutputMaximized(!isOutputMaximized);
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Handle file import
  const handleImportSchema = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setSchemaInput(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Handle import for ConverterLayout
  const handleImport = (content: string) => {
    setSchemaInput(content);
  };

  // Handle copy output
  const handleCopyOutput = async () => {
    if (mockOutput) {
      await copy(mockOutput);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!mockOutput) return;
    
    const blob = new Blob([mockOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mock-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load demo schema
  const handleLoadDemo = (schemaId: string) => {
    const template = getSchemaById(schemaId);
    if (template) {
      setSchemaInput(JSON.stringify(template.schema, null, 2));
    }
  };

  // Load schema from URL parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const schemaParam = urlParams.get('schema');
    if (schemaParam && !schemaInput) {
      handleLoadDemo(schemaParam);
    }
  }, [schemaInput]);

  // Randomize seed
  const handleRandomizeSeed = () => {
    setOptions(prev => ({ ...prev, seed: Math.floor(Math.random() * 10000) }));
  };

  const faqItems = [
    {
      question: "What is mock data generation?",
      answer: "Mock data generation creates realistic fake data based on JSON Schema definitions. It's useful for testing, development, and prototyping when you need sample data that matches your data structure."
    },
    {
      question: "How does the generator work?",
      answer: "The generator analyzes your JSON Schema and creates data that conforms to the defined types, constraints, and formats. It supports strings, numbers, booleans, arrays, objects, and various string formats like email, date, and UUID."
    },
    {
      question: "What generation options are available?",
      answer: "Access generation options through the settings panel. You can control array sizes, set a randomization seed for reproducible results, adjust the probability of optional properties being included, and choose whether to fill all properties or generate minimal data."
    },
    {
      question: "What schema features are supported?",
      answer: "The generator supports basic types, object properties, arrays, string formats, enums, const values, minimum/maximum constraints, and composition keywords like anyOf and oneOf. Complex features like $ref are not currently supported."
    },
    {
      question: "How can I make generation reproducible?",
      answer: "Use the seed option in the settings panel to generate the same data every time. This is useful for consistent testing scenarios or when you need to recreate specific data sets."
    },
    {
      question: "Can I control the data volume?",
      answer: "Yes, adjust the array count to control how many items are generated in arrays, and use the optionals probability to control how often optional properties are included in generated objects."
    }
  ];

  // Settings panel component
  const settingsPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Generation Options</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Array Count: {options.arrayCount}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={options.arrayCount}
              onChange={(e) => setOptions(prev => ({ ...prev, arrayCount: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
            />
            <div className="text-xs text-slate-500 mt-1">Number of items generated in arrays</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Seed: {options.seed}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={options.seed}
                onChange={(e) => setOptions(prev => ({ ...prev, seed: parseInt(e.target.value) || 0 }))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              <button
                onClick={handleRandomizeSeed}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-500 mt-1">Seed for reproducible results</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Optional Properties: {Math.round(options.optionalsProbability! * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={options.optionalsProbability}
              onChange={(e) => setOptions(prev => ({ ...prev, optionalsProbability: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
            />
            <div className="text-xs text-slate-500 mt-1">Probability of including optional properties</div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="fillProperties"
              checked={options.fillProperties}
              onChange={(e) => setOptions(prev => ({ ...prev, fillProperties: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
            />
            <label htmlFor="fillProperties" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Fill all properties
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Demo Schemas</h3>
        <div className="space-y-2">
          {[
            { id: 'user-profile-basic', name: 'Basic User Profile' },
            { id: 'product-catalog', name: 'Product Catalog' },
            { id: 'api-response-paginated', name: 'API Response' },
            { id: 'app-config', name: 'App Configuration' },
            { id: 'financial-transaction', name: 'Financial Transaction' }
          ].map((demo) => (
            <button
              key={demo.id}
              onClick={() => handleLoadDemo(demo.id)}
              className="w-full text-left px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {demo.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={generateMockDataFromSchema}
          disabled={!schemaValid || isGenerating}
          className={cn(
            "w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
            schemaValid && !isGenerating
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          )}
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>Generate Mock Data</span>
        </button>
      </div>
    </div>
  );

  // Prepare output data with status information
  const outputData = mockOutput || (schemaValid ? "Generating mock data..." : "Enter a valid JSON Schema to generate mock data");

  // Empty state content
  const emptyStateContent = (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center max-w-md">
        <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Generate Mock Data
        </h3>
        <p className="text-sm mb-4">
          Enter a JSON schema to generate realistic mock data for testing and development
        </p>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          <p>• Supports all JSON Schema types</p>
          <p>• Generates realistic fake data</p>
          <p>• Customizable data count and locale</p>
        </div>
      </div>
    </div>
  );

  return (
    <ConverterLayout
      title="JSON Mock Data Generator"
      description="Generate realistic mock JSON data from JSON schemas for testing and development"
      faqItems={faqItems}
      inputData={schemaInput}
      outputData={outputData}
      error={error}
      isInputMaximized={isInputMaximized}
      isOutputMaximized={isOutputMaximized}
      showSettings={showSettings}
      inputLanguage="json"
      outputLanguage="json"
      inputLanguageDisplayName="JSON Schema"
      outputLanguageDisplayName="Generated Mock Data"
      inputIcon={<FileJson2 className="w-4 h-4 text-blue-500" />}
      outputIcon={<Database className="w-4 h-4 text-green-500" />}
      onInputChange={handleInputChange}
      onCopy={handleCopyOutput}
      onDownload={handleDownload}
      onToggleInputMaximize={handleToggleInputMaximize}
      onToggleOutputMaximize={handleToggleOutputMaximize}
      onToggleSettings={handleToggleSettings}
      onToggleImportDialog={handleImportSchema}
      settingsPanel={settingsPanel}
      onImport={handleImport}
      emptyStateContent={emptyStateContent}
      stats={generationStats ? (
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{generationStats.generationTime}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span>{generationStats.propertyCount} properties</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>{generationStats.dataSize}</span>
          </div>
        </div>
      ) : null}
    />
  );
}