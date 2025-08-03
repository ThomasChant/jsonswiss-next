"use client";

import { ReactNode, useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useJsonStore } from "@/store/jsonStore";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  answer: string;
}

interface ToolPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  onNodeSelect?: (path: string[], data: any) => void;
  faqItems?: FAQ[];
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'center';
  rightPanel?: ReactNode;
  useFullScreenHeight?: boolean;
}

export function ToolPageLayoutServer({ 
  children, 
  title, 
  description, 
  icon,
  onNodeSelect,
  faqItems = [],
  showSidebar = true,
  sidebarPosition = 'left',
  rightPanel,
  useFullScreenHeight = false
}: ToolPageLayoutProps) {
  const { selectedPath, jsonData, getNodeAtPath } = useJsonStore();
  const [expandedFaqIndexes, setExpandedFaqIndexes] = useState<Set<number>>(new Set());
  
  // Setup height management
  const titleRef = useRef<HTMLDivElement>(null);
  
  // Debug log the height system
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ToolPageLayoutServer] Height system initialized', {
        useFullScreenHeight,
        title,
        hasJsonData: !!jsonData
      });
    }
  }, [useFullScreenHeight, title, jsonData]);
  

  // Initialize all FAQ items as expanded when faqItems change
  useEffect(() => {
    if (faqItems.length > 0) {
      const allIndexes = new Set(Array.from({ length: faqItems.length }, (_, i) => i));
      setExpandedFaqIndexes(allIndexes);
    }
  }, [faqItems]);

  
  // 获取选中节点的数据
  const selectedNodeData = useMemo(() => {
    if (!jsonData || selectedPath.length === 0) return jsonData;
    return getNodeAtPath(selectedPath);
  }, [jsonData, selectedPath, getNodeAtPath]);
  
  // 当节点选择改变时的处理
  const handleNodeSelect = (path: string[], data: any) => {
    if (onNodeSelect) {
      onNodeSelect(path, data);
    }
  };

  // Toggle FAQ item
  const toggleFaq = (index: number) => {
    setExpandedFaqIndexes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Development-mode validation for height management consistency
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // This validation helps ensure pages properly utilize the core-area height system
      // Pages should either rely on the flex-1 container provided by ToolPageLayoutServer 
      // OR explicitly apply min-h-core-min max-h-core-max h-core-default classes
      console.log('[ToolPageLayoutServer] Height Management Validation', {
        pageTitle: title,
        useFullScreenHeight,
        expectedHeightClass: useFullScreenHeight ? 'h-json-table-editor' : 'h-core-default',
        note: useFullScreenHeight 
          ? 'Table pages should use full screen height (100vh - header only)'
          : 'Functional pages should use core area height (100vh - header - title)'
      });
    }
  }, [title, useFullScreenHeight]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Page Title */}
      <div className="px-6 py-8 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-4 text-center">
            {icon}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h1>
              {description && (
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "p-2 flex flex-col",
        useFullScreenHeight 
          ? "min-h-json-table-editor max-h-json-table-editor h-json-table-editor"
          : "min-h-core-min max-h-core-max h-core-default flex-1"
      )}>
        {showSidebar ? (
          <div className={cn(
            "overflow-auto grid gap-2 flex-1 min-w-0",
            sidebarPosition === 'center' ? 'grid-cols-three-panel' : 'grid-cols-sidebar'
          )}>
            {sidebarPosition === 'center' ? (
              /* Three Column Layout: Content | Sidebar | Content */
              <>
                {/* Left Content Area */}
                <div className="h-full">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                    <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>

                {/* Center Sidebar with Tree Navigation */}
                <div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">JSON Navigator</h3>
                    </div>
                    
                    {/* Selected Node Info */}
                    {selectedPath.length > 0 && (
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/30">
                        <div className="text-center">
                          <h4 className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
                            Selected: {selectedPath.join(" → ")}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {Array.isArray(selectedNodeData) ? `Array (${selectedNodeData.length} items)` : 
                             selectedNodeData && typeof selectedNodeData === 'object' ? `Object (${Object.keys(selectedNodeData).length} keys)` :
                             typeof selectedNodeData}
                          </p>
                          <button 
                            onClick={() => useJsonStore.getState().setSelectedPath([])}
                            className="mt-1 text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Tree Navigation */}
                    <div className="flex-1 overflow-auto">
                      <Sidebar onNodeSelect={handleNodeSelect} />
                    </div>
                  </div>
                </div>

                {/* Right Content Area */}
                <div className="h-full">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                    {rightPanel || (
                      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                          <div className="text-sm">Output Area</div>
                          <div className="text-xs mt-1">Content will be displayed here</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Two Column Layout: Sidebar | Content */
              <>
                {/* Left Sidebar with Tree Navigation */}
                <div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                    {/* Tree Navigation */}
                    <div className="flex-1 overflow-auto min-h-0">
                      <Sidebar onNodeSelect={handleNodeSelect} />
                    </div>
                  </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col min-w-0">
                    
                    
                    {/* Main Content */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Single Column Layout */
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col">
              {/* Main Content */}
              <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      {faqItems.length > 0 && (
        <div className="px-6 py-8 bg-white/50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <div className="mt-6 flex items-center justify-center space-x-2 mb-6 text-center">
              <HelpCircle className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {faq.question}
                    </span>
                    {expandedFaqIndexes.has(index) ? (
                      <Minus className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Plus className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  
                  {expandedFaqIndexes.has(index) && (
                    <div className="px-4 pb-4 text-slate-600 dark:text-slate-400">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}