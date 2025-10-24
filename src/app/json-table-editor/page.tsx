
"use client";

import { ImportJsonDialog } from '@/components/import';
import { ToolPageLayoutServer } from '@/components/layout/ToolPageLayoutServer';
import { EnhancedTableView } from '@/components/table/EnhancedTableView';
import { Button } from '@/components/ui/button';
import { getValueType } from '@/lib/table-utils';
import { useJsonStore } from '@/store/jsonStore';
import { Database, Home, Trash2, Upload, Expand, Minimize } from 'lucide-react';
import { clearCachedJson } from '@/lib/json-cache';
import { useCallback, useMemo, useState } from 'react';

const faqItems = [
  {
    question: "How does the sidebar navigation work with table views?",
    answer: "The sidebar shows your JSON data in a tree structure. Click on any node to select it, and the main table area will display that node's data in the most appropriate table format - objects as key-value tables, arrays as row-based tables, and primitive values with detailed information."
  },
  {
    question: "What types of data can I display in table format?",
    answer: "The table editor supports objects (displayed as key-value pairs), arrays (displayed as rows and columns), and primitive values (strings, numbers, booleans, null). Complex nested structures are supported with expandable rows and inline editing capabilities."
  },
  {
    question: "Can I edit the data directly in the table?",
    answer: "Yes! Click on any cell to edit values inline. For objects and arrays, you can add, delete, and modify entries. Changes are immediately reflected in both the table view and the sidebar navigation. The editor supports type validation and JSON formatting."
  },
  {
    question: "How do I work with large datasets?",
    answer: "The table components include built-in filtering, sorting, and search capabilities. Use the toolbar to filter by specific criteria, sort columns, or search across all data. Tables are virtualized for performance with large datasets."
  },
  {
    question: "Can I load my own JSON data?",
    answer: "Absolutely! Use the 'Load Sample Data' button to choose from pre-built examples, or paste your own JSON data using the JSON input area. The editor will automatically detect the data structure and display it in the most appropriate table format."
  }
];

export default function JsonTableEditorPage() {
  const { selectedPath, jsonData, setJsonData, setSelectedPath, getNodeAtPath, updateNodeAtPath } = useJsonStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'regular' | 'compact'>('compact');
  // 页面级：展开/折叠 tick
  const [expandTick, setExpandTick] = useState(0);
  const [collapseTick, setCollapseTick] = useState(0);

  // Get current selected node data
  const selectedNodeData = useMemo(() => {
    if (!jsonData) return null;
    if (selectedPath.length === 0) return jsonData;
    return getNodeAtPath(selectedPath);
  }, [jsonData, selectedPath, getNodeAtPath]);

  // Determine data type and appropriate display component
  const dataTypeInfo = useMemo(() => {
    if (selectedNodeData === null) return { type: 'null', component: 'primitive' };
    if (selectedNodeData === undefined) return { type: 'undefined', component: 'empty' };
    
    if (Array.isArray(selectedNodeData)) {
      return { 
        type: 'array', 
        component: 'array',
        length: selectedNodeData.length,
        itemTypes: selectedNodeData.length > 0 ? Array.from(new Set(selectedNodeData.map(item => getValueType(item)))) : []
      };
    }
    
    if (typeof selectedNodeData === 'object') {
      const keys = Object.keys(selectedNodeData);
      return { 
        type: 'object', 
        component: 'object',
        keys: keys.length,
        keyList: keys
      };
    }
    
    return { 
      type: getValueType(selectedNodeData), 
      component: 'primitive',
      value: selectedNodeData
    };
  }, [selectedNodeData]);

  // Handle node selection from sidebar
  const handleNodeSelect = useCallback((path: string[], data: any) => {
    setSelectedPath(path);
  }, [setSelectedPath]);

  // Handle data updates
  const handleDataUpdate = useCallback((newValue: any) => {
    if (selectedPath.length === 0) {
      // 根节点更新，直接设置整个数据
      setJsonData(newValue);
    } else {
      // 子节点更新，需要更新整个JSON数据结构
      // EnhancedTableView传递的newValue已经是修改后的selectedNodeData
      updateNodeAtPath(selectedPath, newValue);
    }
  }, [selectedPath, setJsonData, updateNodeAtPath]);

  // Handle import
  const handleImport = useCallback((json: any) => {
    setJsonData(json);
    setSelectedPath([]);
  }, [setJsonData, setSelectedPath]);

  // Clear all data
  const handleClearData = useCallback(() => {
    setJsonData(null);
    setSelectedPath([]);
    clearCachedJson();
  }, [setJsonData, setSelectedPath]);

  // Note: breadcrumb path generation removed as navigation is handled by ToolPageLayoutServer

  // Render the appropriate table component based on data type
  const renderTableContent = () => {
    if (!jsonData) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center space-y-4">
            <Database className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No JSON Data Loaded
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Load sample data or paste your own JSON to get started with the enhanced table editor
              </p>
              <Button 
                onClick={() => setImportDialogOpen(true)}
                className="inline-flex items-center gap-2"
              >
                <Upload size={16} />
                Import JSON
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedNodeData === null || selectedNodeData === undefined) {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Selected node is {selectedNodeData === null ? 'null' : 'undefined'}
            </p>
          </div>
        </div>
      );
    }

    // Use the enhanced table view for all data types
    return (
      <div className="h-full min-h-0 flex flex-col">
        <EnhancedTableView
          data={selectedNodeData}
          path={selectedPath}
          onUpdate={handleDataUpdate}
          density={density}
          className="w-full h-full"
          isMainView={true}
          expandTick={expandTick}
          collapseTick={collapseTick}
        />
      </div>
    );
  };

  return (
    <>
      <ToolPageLayoutServer
        title="JSON Table Viewer & Editor"
        description="Clear, intuitive JSON table view: quickly locate, edit, and compare data."
        faqItems={faqItems}
        showSidebar={true}
        sidebarPosition="left"
        useFullScreenHeight={true}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Header with breadcrumb and controls */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-t border-gray-200 dark:border-gray-700 border shrink-0">
            <div className="flex items-center space-x-2">
              {/* <nav className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                {breadcrumbPath.map((segment, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight size={14} className="mx-1" />}
                    <button
                      onClick={() => {
                        if (index === 0) {
                          setSelectedPath([]);
                        } else {
                          setSelectedPath(breadcrumbPath.slice(1, index + 1));
                        }
                      }}
                      className={cn(
                        "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                        index === breadcrumbPath.length - 1 && "text-gray-900 dark:text-gray-100 font-medium"
                      )}
                    >
                      {index === 0 ? (
                        <div className="flex items-center gap-1">
                          <Home size={12} />
                          <span>root</span>
                        </div>
                      ) : (
                        segment
                      )}
                    </button>
                  </React.Fragment>
                ))}
              </nav> */}
              
              {/* Current selection indicator */}
              {/* {selectedPath.length > 0 && (
                <div className="ml-4 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Selected: {dataTypeInfo.type}
                </div>
              )} */}
            </div>

            <div className="flex items-center gap-2">
              {selectedPath.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPath([])}
                  className="text-xs"
                >
                  <Home size={14} />
                  Back to Root
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
                className="text-xs"
              >
                <Upload size={14} />
                Import JSON
              </Button>

              {jsonData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearData}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={14} />
                  Clear Data
                </Button>
              )}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-4 overflow-auto min-h-0">
            <div className="h-full">
              {renderTableContent()}
            </div>
          </div>
        </div>
      </ToolPageLayoutServer>

      <ImportJsonDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
    </>
  );
}
