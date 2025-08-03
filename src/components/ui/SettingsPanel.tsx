"use client";

import { ReactNode } from "react";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  children: ReactNode;
  title?: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function SettingsPanel({ 
  children, 
  title = "Options", 
  isOpen, 
  onToggle, 
  className 
}: SettingsPanelProps) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700", className)}>
      {/* Settings Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors w-full justify-between",
            isOpen 
              ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100" 
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>{title}</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Settings Content */}
      {isOpen && (
        <div className="p-4 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}

// Specific settings components for common use cases
interface CodeGenSettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CodeGenSettingsPanel({ isOpen, onToggle, children }: CodeGenSettingsPanelProps) {
  return (
    <SettingsPanel
      title="Code Generation Options"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {children}
    </SettingsPanel>
  );
}

interface ConversionSettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function ConversionSettingsPanel({ isOpen, onToggle, children }: ConversionSettingsPanelProps) {
  return (
    <SettingsPanel
      title="Conversion Options"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {children}
    </SettingsPanel>
  );
}

interface RepairSettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function RepairSettingsPanel({ isOpen, onToggle, children }: RepairSettingsPanelProps) {
  return (
    <SettingsPanel
      title="Repair Options"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {children}
    </SettingsPanel>
  );
}