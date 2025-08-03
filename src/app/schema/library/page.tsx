
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Download, Copy, Eye, Tag, BookOpen, Database, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolPageLayoutServer } from "@/components/layout/ToolPageLayoutServer";
import { schemaTemplates, SchemaTemplate, getAllCategories, getAllTags, searchSchemas, getSchemasByCategory, getSchemasByComplexity } from "@/sample-data/schemas";
import { analyzeSchema, generateSchemaSummary } from "@/lib/schema-utils";
import { useClipboard } from "@/hooks/useClipboard";

type SortOption = 'name' | 'category' | 'complexity' | 'newest';
type ViewMode = 'grid' | 'table';

export default function SchemaLibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedComplexity, setSelectedComplexity] = useState<string>("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { copy } = useClipboard({
    successMessage: 'Schema copied to clipboard',
    errorMessage: 'Failed to copy schema'
  });

  const categories = useMemo(() => getAllCategories(), []);
  const allTags = useMemo(() => getAllTags(), []);

  // Filter and sort schemas
  const filteredSchemas = useMemo(() => {
    let filtered = schemaTemplates;

    // Apply search query
    if (searchQuery.trim()) {
      filtered = searchSchemas(searchQuery);
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(schema => schema.category === selectedCategory);
    }

    // Apply complexity filter
    if (selectedComplexity && selectedComplexity !== "All") {
      filtered = filtered.filter(schema => schema.complexity === selectedComplexity);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(schema => 
        selectedTags.some(tag => schema.tags.includes(tag))
      );
    }

    // Sort schemas
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'complexity':
          const complexityOrder = { simple: 1, medium: 2, complex: 3 };
          return complexityOrder[a.complexity] - complexityOrder[b.complexity];
        case 'newest':
          return a.id.localeCompare(b.id); // Simple ordering by ID
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedComplexity, selectedTags, sortBy]);

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedComplexity("All");
    setSelectedTags([]);
  };

  // Handle schema actions
  const viewSchema = (schema: SchemaTemplate) => {
    router.push(`/schema/mock-generator?schema=${schema.id}`);
  };

  const copySchema = async (schema: SchemaTemplate) => {
    await copy(JSON.stringify(schema.schema, null, 2));
  };

  const downloadSchema = (schema: SchemaTemplate) => {
    const blob = new Blob([JSON.stringify(schema.schema, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${schema.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'complex': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const faqItems = [
    {
      question: "What are JSON Schema templates?",
      answer: "JSON Schema templates are pre-defined schema structures for common data types like user profiles, products, API responses, and more. They serve as starting points for your own schemas or for generating mock data."
    },
    {
      question: "How can I use these schemas?",
      answer: "You can view any schema in detail, copy it to your clipboard, download it as a JSON file, or use it directly in the Mock Data Generator to create sample data that matches the schema structure."
    },
    {
      question: "What do the complexity levels mean?",
      answer: "Simple schemas have basic properties and shallow nesting. Medium schemas include nested objects and arrays. Complex schemas have deep nesting, multiple relationships, and advanced constraints."
    },
    {
      question: "Can I modify these templates?",
      answer: "These are read-only templates, but you can copy them and modify the JSON Schema as needed for your specific use case. The templates serve as excellent starting points for custom schemas."
    },
    {
      question: "How do I search for specific schemas?",
      answer: "Use the search bar to find schemas by name, description, tags, or use case. You can also filter by category, complexity level, or specific tags to narrow down the results."
    },
    {
      question: "What categories are available?",
      answer: "The library includes schemas for User Management, E-commerce, API responses, Configuration, Financial transactions, Social media, and more. Each category contains schemas relevant to that domain."
    }
  ];

  return (
    <ToolPageLayoutServer
      title="Schema Library"
      description="Browse and explore a comprehensive collection of JSON Schema templates for common data structures"
      faqItems={faqItems}
      showSidebar={false}
    >
      <div className="p-4 h-full flex flex-col min-h-0 min-h-core-min max-h-core-max h-core-default">
        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Search Row */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search schemas by name, description, tags, or use case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                showFilters
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'grid'
                    ? "bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                )}
              >
                <Database className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'table'
                    ? "bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                )}
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Complexity Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Complexity
                  </label>
                  <select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="All">All Levels</option>
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="complexity">Complexity</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Tag Filters */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm transition-colors",
                        selectedTags.includes(tag)
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredSchemas.length} of {schemaTemplates.length} schemas
          </div>
        </div>

        {/* Schema Grid/Table */}
        <div className="flex-1 min-h-0 overflow-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemas.map(schema => {
                const analysis = analyzeSchema(schema.schema);
                const summary = generateSchemaSummary(schema.schema);
                
                return (
                  <div
                    key={schema.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {schema.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded dark:bg-slate-700 dark:text-slate-400">
                            {schema.category}
                          </span>
                          <span className={cn("text-xs px-2 py-1 rounded", getComplexityColor(schema.complexity))}>
                            {schema.complexity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {schema.description}
                    </p>

                    {/* Stats */}
                    <div className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                      {analysis.propertyCount} properties • {analysis.depth} levels deep
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {schema.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded dark:bg-blue-900 dark:text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {schema.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded dark:bg-slate-700 dark:text-slate-400">
                          +{schema.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => viewSchema(schema)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Generate</span>
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => copySchema(schema)}
                          className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                          title="Copy schema"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadSchema(schema)}
                          className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                          title="Download schema"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 tracking-wider dark:text-slate-400">
                        Schema
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 tracking-wider dark:text-slate-400">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 tracking-wider dark:text-slate-400">
                        Complexity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 tracking-wider dark:text-slate-400">
                        Properties
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 tracking-wider dark:text-slate-400">
                        Tags
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 tracking-wider dark:text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredSchemas.map(schema => {
                      const analysis = analyzeSchema(schema.schema);
                      
                      return (
                        <tr key={schema.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {schema.name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                {schema.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {schema.category}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn("text-xs px-2 py-1 rounded", getComplexityColor(schema.complexity))}>
                              {schema.complexity}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {analysis.propertyCount}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {schema.tags.slice(0, 2).map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded dark:bg-blue-900 dark:text-blue-300"
                                >
                                  {tag}
                                </span>
                              ))}
                              {schema.tags.length > 2 && (
                                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded dark:bg-slate-700 dark:text-slate-400">
                                  +{schema.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => viewSchema(schema)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                              >
                                <Zap className="w-3 h-3" />
                                <span>Generate</span>
                              </button>
                              <button
                                onClick={() => copySchema(schema)}
                                className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                                title="Copy schema"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => downloadSchema(schema)}
                                className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                                title="Download schema"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredSchemas.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No schemas found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No schemas match your current search and filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </ToolPageLayoutServer>
  );
}