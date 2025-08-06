import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { HeaderServer } from "./HeaderServer";
import { Footer } from "./Footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { cn } from "@/lib/utils";
import { FAQServer } from "@/components/ui/faq-server";

interface FAQ {
  question: string;
  answer: string;
}

interface ToolPageLayoutServerProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  faqItems?: FAQ[];
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'center';
  rightPanel?: ReactNode;
  useFullScreenHeight?: boolean;
  currentPath?: string;
}

export function ToolPageLayoutServer({ 
  children, 
  title, 
  description, 
  icon,
  faqItems = [],
  showSidebar = true,
  sidebarPosition = 'left',
  rightPanel,
  useFullScreenHeight = false,
  currentPath
}: ToolPageLayoutServerProps) {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <HeaderServer currentPath={currentPath} />
      
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
        "flex-1",
        useFullScreenHeight ? "h-screen-minus-header" : "min-h-0"
      )}>
        {showSidebar ? (
          <div className={cn(
            "grid h-full gap-2 p-2",
            rightPanel ? "grid-cols-three-panel" : "grid-cols-sidebar flex-1"
          )}>
            {/* Sidebar */}
            {sidebarPosition === 'left' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="h-full overflow-hidden">
                  <Sidebar />
                </div>
              </div>
            )}
            
            {/* Main Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden min-h-0">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </div>
            
            {/* Center Sidebar */}
            {sidebarPosition === 'center' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="h-full overflow-hidden">
                  <Sidebar />
                </div>
              </div>
            )}
            
            {/* Right Panel */}
            {rightPanel && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="h-full overflow-hidden">
                  {rightPanel}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full p-2">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col h-full">
              <div className="flex-1 overflow-hidden min-h-0">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section - 服务器端预渲染 */}
      <FAQServer faqItems={faqItems} />

      {/* Footer */}
      <Footer />
    </div>
  );
}