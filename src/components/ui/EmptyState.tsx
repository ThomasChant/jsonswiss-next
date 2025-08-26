"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, Clipboard } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
    icon?: ReactNode;
  }[];
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actions = [],
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      "min-h-[200px] space-y-4",
      className
    )}>
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
        {icon || <FileText className="w-8 h-8 text-muted-foreground" />}
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>
      
      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                action.variant === "primary" 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 预定义的空状态组件
export function JsonEditorEmptyState({ onImport, onPaste, onCreateExample }: {
  onImport?: () => void;
  onPaste?: () => void;
  onCreateExample?: () => void;
}) {
  const actions = [];
  
  if (onImport) {
    actions.push({
      label: "Import File",
      onClick: onImport,
      variant: "primary" as const,
      icon: <Upload className="w-4 h-4" />
    });
  }
  
  if (onPaste) {
    actions.push({
      label: "Paste Content",
      onClick: onPaste,
      variant: "secondary" as const,
      icon: <Clipboard className="w-4 h-4" />
    });
  }
  
  if (onCreateExample) {
    actions.push({
      label: "Create Example",
      onClick: onCreateExample,
      variant: "secondary" as const,
      icon: <FileText className="w-4 h-4" />
    });
  }
  
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-muted-foreground" />}
      title="Start Editing JSON"
      description="Enter or paste JSON data here, or click the import button to load content from a file. Supports real-time validation and formatting."
      actions={actions}
    />
  );
}

export function SidebarNavigationEmptyState({ onImport }: {
  onImport?: () => void;
}) {
  const actions = [];
  
  if (onImport) {
    actions.push({
      label: "Import JSON",
      onClick: onImport,
      variant: "primary" as const,
      icon: <Upload className="w-4 h-4" />
    });
  }
  
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-muted-foreground" />}
      title="No JSON Data"
      description="Import a JSON file or enter data in the editor to start browsing and editing the structure."
      actions={actions}
      className="py-12"
    />
  );
}