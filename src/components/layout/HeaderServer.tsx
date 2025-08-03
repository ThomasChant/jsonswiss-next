import Link from "next/link";
import { 
  Sun, 
  Moon, 
  Settings, 
  ChevronDown, 
  Edit3,
  ArrowRightLeft,
  ArrowLeftRight,
  Code2,
  FileJson2,
  FileText,
  CheckCircle,
  Wrench,
  FileSpreadsheet,
  FileCode,
  Braces,
  Globe,
  FileOutput,
  Zap,
  List,
  Table,
  Database,
  Coffee,
  Hash,
  Layers,
  Smartphone,
  Gem,
  Code2 as Code,
  GitCompare,
  FileArchive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  editorMenuItems, 
  toJsonMenuItems, 
  fromJsonMenuItems, 
  generatorMenuSections, 
  schemaMenuItems 
} from "@/data/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DropdownMenu } from "@/components/ui/DropdownMenuServer";

// 图标映射
const iconMap: Record<string, any> = {
  FileText,
  CheckCircle,
  Wrench,
  GitCompare,
  FileSpreadsheet,
  FileCode,
  FileOutput,
  Database,
  FileArchive,
  Code2,
  Braces,
  Code,
  Coffee,
  Hash,
  Smartphone,
  Layers,
  Zap,
  Gem,
  FileJson2,
  List
};

interface HeaderServerProps {
  currentPath?: string;
}

export function HeaderServer({ currentPath = "" }: HeaderServerProps) {
  // 辅助函数：检查路径是否激活
  const isActivePath = (path: string) => {
    return currentPath === path;
  };

  // 辅助函数：检查路径组是否激活
  const isActivePathGroup = (paths: string[]) => {
    return paths.some(path => currentPath.startsWith(path));
  };

  // 渲染图标
  const renderIcon = (iconName?: string, className?: string) => {
    if (!iconName || !iconMap[iconName]) return null;
    const IconComponent = iconMap[iconName];
    return <IconComponent className={className} />;
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  JSON Swiss
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Visual JSON Editor & Toolkit</p>
              </div>
            </Link>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center space-x-6">
            {/* Main Navigation */}
            <nav className="flex items-center space-x-1">
              {/* Table Viewer */}
              <div className="relative">
                <Link 
                  href="/json-table-editor"
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                    isActivePath("/json-table-editor")
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Table className={cn(
                    "w-4 h-4",
                    isActivePath("/json-table-editor") ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
                  )} />
                  <span className="text-sm font-medium">Table View</span>
                </Link>
              </div>
              
              {/* Editor Dropdown */}
              <DropdownMenu
                trigger={
                  <div className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    isActivePathGroup(["/formatter", "/validator", "/repair", "/compare"])
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Edit3 className={cn(
                    "w-4 h-4",
                    isActivePathGroup(["/formatter", "/validator", "/repair", "/compare"]) 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-400"
                  )} />
                  <span className="text-sm font-medium">Editor</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
                }
                items={editorMenuItems}
              />
              
              {/* To JSON Dropdown */}
              <DropdownMenu
                trigger={
                  <div className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    isActivePathGroup(["/converter/csv-to-json", "/converter/xml-to-json", "/converter/yaml-to-json", "/converter/ini-to-json", "/converter/properties-to-json", "/converter/toml-to-json", "/converter/dict-to-json", "/converter/sql-to-json", "/converter/excel-to-json", "/converter/jar-to-json"])
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <ArrowRightLeft className={cn(
                    "w-4 h-4",
                    isActivePathGroup(["/converter/csv-to-json", "/converter/xml-to-json", "/converter/yaml-to-json", "/converter/ini-to-json", "/converter/properties-to-json", "/converter/toml-to-json", "/converter/dict-to-json", "/converter/sql-to-json", "/converter/excel-to-json", "/converter/jar-to-json"])
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-400"
                  )} />
                  <span className="text-sm font-medium">To JSON</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
                }
                items={toJsonMenuItems}
              />
              
              {/* From JSON Dropdown */}
              <DropdownMenu
                trigger={
                  <div className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    isActivePathGroup(["/converter/json-to-csv", "/converter/json-to-xml", "/converter/json-to-yaml", "/converter/json-to-ini", "/converter/json-to-properties", "/converter/json-to-toml", "/converter/json-to-dict", "/converter/json-to-sql", "/converter/json-to-excel"])
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <ArrowLeftRight className={cn(
                    "w-4 h-4",
                    isActivePathGroup(["/converter/json-to-csv", "/converter/json-to-xml", "/converter/json-to-yaml", "/converter/json-to-ini", "/converter/json-to-properties", "/converter/json-to-toml", "/converter/json-to-dict", "/converter/json-to-sql", "/converter/json-to-excel"])
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-400"
                  )} />
                  <span className="text-sm font-medium">From JSON</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
                }
                items={fromJsonMenuItems}
              />
              
              {/* Code Generator Dropdown */}
              <DropdownMenu
                trigger={
                  <div className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    isActivePathGroup(["/generator/"])
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Code2 className={cn(
                    "w-4 h-4",
                    isActivePathGroup(["/generator/"])
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-400"
                  )} />
                  <span className="text-sm font-medium">Code Generator</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
                }
                sections={generatorMenuSections}
              />
              
              {/* Schema Dropdown */}
              <DropdownMenu
                trigger={
                  <div className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    isActivePathGroup(["/schema"])
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <FileJson2 className={cn(
                    "w-4 h-4",
                    isActivePathGroup(["/schema"])
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-400"
                  )} />
                  <span className="text-sm font-medium">Schema</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
                }
                items={schemaMenuItems}
              />
            </nav>

            {/* Additional Actions */}
            <div className="flex items-center space-x-2 border-slate-200 dark:border-slate-700 pl-4">
              {/* Theme Toggle - Invisible but with placeholder */}
              <div className="p-2 rounded-lg invisible">
                <div className="w-5 h-5" />
              </div>

              {/* Settings - Invisible but with placeholder */}
              <div className="p-2 rounded-lg invisible">
                <div className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}