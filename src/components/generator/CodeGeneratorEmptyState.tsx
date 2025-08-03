"use client";

import { ReactNode } from "react";
import { Code2 } from "lucide-react";

interface CodeExample {
  comment?: string;
  lines: Array<{
    content: string;
    type: 'keyword' | 'class' | 'comment' | 'normal';
  }>;
}

interface CodeGeneratorEmptyStateProps {
  language: string;
  languageDisplayName: string;
  icon?: ReactNode;
  description?: string;
  codeExample?: CodeExample;
  features?: string;
}

export function CodeGeneratorEmptyState({
  language,
  languageDisplayName,
  icon,
  description,
  codeExample,
  features
}: CodeGeneratorEmptyStateProps) {
  const defaultDescription = `Enter JSON data to generate ${languageDisplayName} code`;
  const defaultFeatures = `Analyze JSON structure and create corresponding ${languageDisplayName} code`;

  const getLineStyle = (type: string) => {
    switch (type) {
      case 'keyword':
        return 'text-blue-600 dark:text-blue-400';
      case 'class':
        return 'text-green-600 dark:text-green-400';
      case 'comment':
        return 'text-slate-400 dark:text-slate-500';
      case 'normal':
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      <div className="text-center max-w-md">
        {icon || <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />}
        <p className="mb-4">{description || defaultDescription}</p>
        
      
        
        <p className="text-xs mt-3 text-slate-400">
          {features || defaultFeatures}
        </p>
      </div>
    </div>
  );
}