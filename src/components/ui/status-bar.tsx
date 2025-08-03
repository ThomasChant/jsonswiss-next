"use client";

import { useJsonStore } from "@/store/jsonStore";
import { FileText, Hash, Layers, Zap } from "lucide-react";

export function StatusBar() {
  const { jsonData } = useJsonStore();

  const getFileSize = () => {
    if (!jsonData) return "0 B";
    const jsonString = JSON.stringify(jsonData);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getLineCount = () => {
    if (!jsonData) return 0;
    return JSON.stringify(jsonData, null, 2).split('\n').length;
  };

  const getNodeCount = () => {
    if (!jsonData) return 0;
    
    const countNodes = (obj: any): number => {
      if (obj === null || typeof obj !== 'object') return 1;
      
      if (Array.isArray(obj)) {
        return 1 + obj.reduce((count: number, item: any) => count + countNodes(item), 0);
      }
      
      return 1 + Object.values(obj as Record<string, any>).reduce((count: number, value: any) => count + countNodes(value), 0);
    };
    
    return countNodes(jsonData);
  };

  if (!jsonData) {
    return (
      <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Ready</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>JSON Swiss Editor</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span className="font-medium">{getFileSize()}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Hash className="w-4 h-4" />
            <span className="font-medium">{getLineCount().toLocaleString()}</span>
            <span className="text-slate-500 dark:text-slate-500">lines</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Layers className="w-4 h-4" />
            <span className="font-medium">{getNodeCount().toLocaleString()}</span>
            <span className="text-slate-500 dark:text-slate-500">nodes</span>
          </div>
          
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
          
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="font-medium text-green-600 dark:text-green-400">Valid JSON</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-slate-500 dark:text-slate-500">UTF-8</span>
          <span className="text-slate-500 dark:text-slate-500">JSON</span>
        </div>
      </div>
    </div>
  );
}