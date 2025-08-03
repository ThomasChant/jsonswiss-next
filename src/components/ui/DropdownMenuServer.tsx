import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  FileText,
  CheckCircle,
  Wrench,
  GitCompare,
  FileSpreadsheet,
  FileCode,
  FileCode2,
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
} from "lucide-react";

// 图标映射
const iconMap: Record<string, any> = {
  FileText,
  CheckCircle,
  Wrench,
  GitCompare,
  FileSpreadsheet,
  FileCode,
  FileCode2,
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

interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface DropdownMenuProps {
  trigger: ReactNode;
  content?: ReactNode;
  items?: NavigationItem[];
  sections?: NavigationSection[];
  className?: string;
}

// 服务器端下拉菜单组件 - 使用 CSS hover 而不是 JavaScript 状态
export function DropdownMenu({ trigger, content, items, sections, className }: DropdownMenuProps) {
  const renderContent = () => {
    if (content) {
      return content;
    }
    
    if (items) {
      return (
        <div className="w-56 py-2">
          {items.map((item, index) => {
            const IconComponent = item.icon ? iconMap[item.icon] : null;
            return (
              <Link 
                key={index}
                href={item.href} 
                className="flex items-center space-x-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {IconComponent && (
                  <IconComponent className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                )}
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      );
    }
    
    if (sections) {
      return (
        <div className="w-96 py-2">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="grid grid-cols-2 gap-1 px-2">
                {section.items.map((item, itemIndex) => {
                  const IconComponent = item.icon ? iconMap[item.icon] : null;
                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      {IconComponent && (
                        <IconComponent className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {sectionIndex < sections.length - 1 && (
                <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={cn("relative group", className)}>
      {/* 触发器 */}
      <div className="cursor-pointer">
        {trigger}
      </div>
      
      {/* 下拉内容 - 使用 CSS hover 显示/隐藏 */}
      <div className="absolute top-full mt-1 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
        {renderContent()}
      </div>
    </div>
  );
}