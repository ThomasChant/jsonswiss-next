"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  Hash, 
  List, 
  Braces, 
  FileText, 
  Circle, 
  Square, 
  Search,
  X,
  Copy,
  Edit3,
  Plus,
  Trash2,
  MoreHorizontal,
  Download,
  Expand,
  Minimize,
  Home,
  TreePine,
  PenTool
} from "lucide-react";
import { useJsonStore } from "@/store/jsonStore";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { AddChildDialog } from './AddChildDialog';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { SidebarJsonEditor } from '@/components/editor/SidebarJsonEditor';
import { useClipboard } from '@/hooks/useClipboard';
import { SidebarNavigationEmptyState } from '@/components/ui/EmptyState';

interface TreeNodeProps {
  data: any;
  path: string[];
  nodeKey: string;
  level: number;
  searchTerm?: string;
  onEditNode?: (path: string[], value: any) => void;
  onDeleteNode?: (path: string[]) => void;
  onAddNode?: (path: string[], key: string, value: any) => void;
  onNodeSelect?: (path: string[], data: any) => void;
}

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  path: string[];
  data: any;
  onClose: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onAddChild: () => void;
  onExport: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  isOpen, 
  x, 
  y, 
  path, 
  data, 
  onClose, 
  onEdit, 
  onCopy, 
  onDelete, 
  onAddChild, 
  onExport 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const isExpandable = (data !== null && typeof data === "object");
  const canAddChild = isExpandable;
  const canDelete = path.length > 0;
  
  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button 
        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
        onClick={onCopy}
      >
        <Copy className="w-4 h-4" />
        <span>Copy Value</span>
      </button>
      
      <button 
        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
        onClick={onEdit}
      >
        <Edit3 className="w-4 h-4" />
        <span>Edit Value</span>
      </button>
      
      {canAddChild && (
        <button 
          className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
          onClick={onAddChild}
        >
          <Plus className="w-4 h-4" />
          <span>Add Child</span>
        </button>
      )}
      
      <button 
        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
        onClick={onExport}
      >
        <Download className="w-4 h-4" />
        <span>Export Node</span>
      </button>
      
      {canDelete && (
        <>
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center space-x-2"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </>
      )}
    </div>
  );
};

const TreeNode: React.FC<TreeNodeProps> = ({ 
  data, 
  path, 
  nodeKey, 
  level, 
  searchTerm, 
  onEditNode, 
  onDeleteNode, 
  onAddNode,
  onNodeSelect 
}) => {
  const { selectedPath, expandedNodes, toggleNodeExpansion, setSelectedPath } = useJsonStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isValidJson, setIsValidJson] = useState(true); // 跟踪JSON是否有效
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeletePath, setPendingDeletePath] = useState<string[]>([]);
  const [pendingAddPath, setPendingAddPath] = useState<string[]>([]);
  const { copy } = useClipboard({ successMessage: 'Copied to clipboard' });
  
  const isExpanded = expandedNodes.has(nodeKey);
  const isSelected = selectedPath.join(".") === path.join(".");
  
  const isObject = data !== null && typeof data === "object" && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isExpandable = isObject || isArray;
  
  const childCount = isObject ? Object.keys(data).length : isArray ? data.length : 0;
  
  // Check if this node matches the search term
  const nodeText = `${path[path.length - 1] || "root"} ${JSON.stringify(data)}`;
  const matchesSearch = !searchTerm || nodeText.toLowerCase().includes(searchTerm.toLowerCase());
  
  // Check if any children match the search
  const hasMatchingChildren = useMemo(() => {
    if (!searchTerm || !isExpandable) return false;
    
    const checkChildren = (obj: any, currentPath: string[]): boolean => {
      if (obj && typeof obj === 'object') {
        const isCurrentArray = Array.isArray(obj);
        const entries: [string, any][] = isCurrentArray ? obj.map((item: any, idx: number) => [idx.toString(), item] as [string, any]) : Object.entries(obj);
        return entries && entries.some(([key, value]: [string, any]) => {
          const childPath = [...currentPath, key];
          const childText = `${key} ${JSON.stringify(value)}`;
          if (childText.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
          }
          if (value && typeof value === 'object') {
            return checkChildren(value, childPath);
          }
          return false;
        });
      }
      return false;
    };
    
    return checkChildren(data, path);
  }, [searchTerm, data, path, isExpandable]);
  
  const shouldShow = !searchTerm || matchesSearch || hasMatchingChildren;
  
  // Get appropriate icon for the node type
  const getIcon = () => {
    if (isArray) return <List className="w-4 h-4 text-blue-500" />;
    if (isObject) return <Braces className="w-4 h-4 text-green-500" />;
    if (typeof data === "string") return <FileText className="w-4 h-4 text-orange-500" />;
    if (typeof data === "number") return <Hash className="w-4 h-4 text-purple-500" />;
    if (typeof data === "boolean") return data ? <Circle className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4 text-red-500" />;
    return <Circle className="w-4 h-4 text-gray-500" />;
  };
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpandable) {
      toggleNodeExpansion(nodeKey);
    }
  };
  
  const handleSelect = () => {
    setSelectedPath(path);
    if (onNodeSelect) {
      onNodeSelect(path, data);
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };
  
  const handleEdit = () => {
    setEditValue(JSON.stringify(data, null, 2));
    setIsValidJson(true); // 初始值总是有效的
    setIsEditing(true);
    setContextMenu(null);
  };
  
  const handleSaveEdit = () => {
    try {
      const newValue = JSON.parse(editValue);
      onEditNode?.(path, newValue);
      setIsEditing(false);
    } catch (error) {
      // Show error - for now just cancel
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue("");
    setIsValidJson(true); // 重置验证状态
  };
  
  const handleCopy = async () => {
    try {
      await copy(JSON.stringify(data, null, 2));
      setContextMenu(null);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };
  
  const handleDelete = () => {
    setPendingDeletePath(path);
    setDeleteDialogOpen(true);
    setContextMenu(null);
  };

  const handleDeleteConfirm = () => {
    onDeleteNode?.(pendingDeletePath);
  };
  
  const handleAddChild = () => {
    setPendingAddPath(path);
    setAddChildDialogOpen(true);
    setContextMenu(null);
  };

  const handleAddChildConfirm = (key: string | null, value: any) => {
    onAddNode?.(pendingAddPath, key || "", value);
  };
  
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${path.join('_') || 'root'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setContextMenu(null);
  };
  
  if (!shouldShow) return null;
  
  return (
    <div>
      <div
        className={cn(
          "flex items-center px-2 py-1 cursor-pointer hover:bg-accent rounded-sm group relative whitespace-nowrap",
          isSelected && "bg-accent",
          matchesSearch && searchTerm && "bg-yellow-100 dark:bg-yellow-900/20",
          "text-sm"
        )}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
      >
        {isExpandable && (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-muted rounded mr-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        {!isExpandable && <div className="w-4 mr-1" />}
        
        {getIcon()}
        
        <span className="ml-2 font-mono text-xs">
          {path[path.length - 1] || "root"}
        </span>
        
        {isExpandable && !isExpanded && (
          <span className="ml-auto text-xs text-muted-foreground">
            {Array.isArray(data) ? `${childCount} items` : `${childCount} props`}
          </span>
        )}
        
        {!isExpandable && !isEditing && (
          <span className="ml-auto text-xs text-muted-foreground">
            {JSON.stringify(data)}
          </span>
        )}
        
        {isEditing && (
          <div className="ml-2 flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => {
                const newValue = e.target.value;
                setEditValue(newValue);
                
                // 实时JSON语法检查
                try {
                  JSON.parse(newValue);
                  setIsValidJson(true);
                } catch (error) {
                  setIsValidJson(false);
                }
              }}
              className={`flex-1 px-2 py-1 text-xs bg-background border rounded ${
                !isValidJson ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValidJson) handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              autoFocus
            />
            <button 
              onClick={handleSaveEdit} 
              disabled={!isValidJson}
              className={`${
                isValidJson 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title={!isValidJson ? 'Invalid JSON syntax' : 'Save changes'}
            >
              ✓
            </button>
            <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
              ✕
            </button>
          </div>
        )}
        
        <button
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e);
          }}
        >
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>
      
      <ContextMenu
        isOpen={!!contextMenu}
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        path={path}
        data={data}
        onClose={() => setContextMenu(null)}
        onEdit={handleEdit}
        onCopy={handleCopy}
        onDelete={handleDelete}
        onAddChild={handleAddChild}
        onExport={handleExport}
      />
      
      {isExpanded && isExpandable && (
        <div>
          {isObject && data &&
            Object.entries(data).map(([key, value]) => (
              <TreeNode
                key={`${nodeKey}.${key}`}
                data={value}
                path={[...path, key]}
                nodeKey={`${nodeKey}.${key}`}
                level={level + 1}
                searchTerm={searchTerm}
                onEditNode={onEditNode}
                onDeleteNode={onDeleteNode}
                onAddNode={onAddNode}
                onNodeSelect={onNodeSelect}
              />
            ))}
          {isArray && data &&
            data.map((item: any, index: number) => (
              <TreeNode
                key={`${nodeKey}.${index}`}
                data={item}
                path={[...path, index.toString()]}
                nodeKey={`${nodeKey}.${index}`}
                level={level + 1}
                searchTerm={searchTerm}
                onEditNode={onEditNode}
                onDeleteNode={onDeleteNode}
                onAddNode={onAddNode}
                onNodeSelect={onNodeSelect}
              />
            ))}
        </div>
      )}

      {/* Add Child Dialog */}
      <AddChildDialog
        open={addChildDialogOpen}
        onOpenChange={setAddChildDialogOpen}
        parentPath={pendingAddPath}
        parentData={data}
        onAddChild={handleAddChildConfirm}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        path={pendingDeletePath}
        nodeData={data}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

interface SidebarProps {
  onNodeSelect?: (path: string[], data: any) => void;
}

export function Sidebar({ onNodeSelect }: SidebarProps = {}) {
  const { 
    jsonData, 
    selectedPath, 
    expandAllNodes, 
    collapseAllNodes, 
    updateNodeAtPath, 
    deleteNodeAtPath, 
    setJsonData,
    setSelectedPath,
    sidebarMode,
    setSidebarMode
  } = useJsonStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const breadcrumbSegments = useMemo(() => {
    const segments = [{ label: "root", path: [] as string[] }];
    if (selectedPath.length > 0) {
      let currentPath: string[] = [];
      selectedPath.forEach((segment) => {
        currentPath = [...currentPath, segment];
        segments.push({
          label: segment,
          path: [...currentPath]
        });
      });
    }
    return segments;
  }, [selectedPath]);
  
  const handleEditNode = (path: string[], value: any) => {
    updateNodeAtPath(path, value);
  };
  
  const handleDeleteNode = (path: string[]) => {
    deleteNodeAtPath(path);
  };
  
  const handleAddNode = (parentPath: string[], key: string, value: any) => {
    const parentNode = parentPath.length === 0 ? jsonData : getNodeAtPath(jsonData, parentPath);
    
    if (Array.isArray(parentNode)) {
      // For arrays, add to the end
      const newArray = [...parentNode, value];
      if (parentPath.length === 0) {
        setJsonData(newArray, 'Add array item');
      } else {
        updateNodeAtPath(parentPath, newArray);
      }
    } else if (parentNode && typeof parentNode === 'object') {
      // For objects, add the key-value pair
      const newObject = { ...parentNode, [key]: value };
      if (parentPath.length === 0) {
        setJsonData(newObject, 'Add object property');
      } else {
        updateNodeAtPath(parentPath, newObject);
      }
    }
  };
  
  const getNodeAtPath = (data: any, path: string[]): any => {
    let current = data;
    for (const key of path) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const handleModeToggle = () => {
    const newMode = sidebarMode === 'navigation' ? 'editor' : 'navigation';
    setSidebarMode(newMode);
    toast.success(`Switched to ${newMode} mode`);
  };
  
  if (!jsonData) {
    return (
      <aside className="w-full bg-muted/10 flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {sidebarMode === 'navigation' ? 'Navigation' : 'Editor'}
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleModeToggle}
                className={cn(
                  "p-1 hover:bg-muted rounded transition-colors",
                  "text-muted-foreground hover:text-foreground"
                )}
                title={`Switch to ${sidebarMode === 'navigation' ? 'Editor' : 'Navigation'} Mode`}
              >
                {sidebarMode === 'navigation' ? (
                  <PenTool className="w-4 h-4" />
                ) : (
                  <TreePine className="w-4 h-4" />
                )}
              </button>
              {sidebarMode === 'navigation' && (
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {sidebarMode === 'navigation' && showSearch && (
            <div className="mb-3 relative">
              <input
                type="text"
                placeholder="Search JSON..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md pr-8"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          
          {/* Breadcrumb Navigation - only show in navigation mode */}
          {sidebarMode === 'navigation' && (
            <div className="mt-3">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-1 text-sm">
                  <button className="px-2 py-1 rounded text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                    <div className="flex items-center space-x-1">
                      <Home className="w-3 h-3" />
                      <span>root</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Content area */}
        <div className="flex-1">
          {sidebarMode === 'editor' ? (
            <div className="sidebar-editor-container">
              <SidebarJsonEditor className="h-full" />
            </div>
          ) : (
            <div className="sidebar-navigation-container">
              <SidebarNavigationEmptyState 
                onImport={() => {
                  // 触发导入功能
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        try {
                          const content = e.target?.result as string;
                          const parsed = JSON.parse(content);
                          setJsonData(parsed, `Imported from ${file.name}`);
                          toast.success(`Successfully imported ${file.name}`);
                        } catch (error) {
                          toast.error('Invalid JSON file');
                        }
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
              />
            </div>
          )}
        </div>
      </aside>
    );
  }
  
  return (
    <aside className="w-full bg-muted/10 flex flex-col">
      <div className="p-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {sidebarMode === 'navigation' ? 'Navigation' : 'Editor'}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleModeToggle}
              className={cn(
                "p-1 hover:bg-muted rounded transition-colors",
                sidebarMode === 'editor' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              title={`Switch to ${sidebarMode === 'navigation' ? 'Editor' : 'Navigation'} Mode`}
            >
              {sidebarMode === 'navigation' ? (
                <PenTool className="w-4 h-4" />
              ) : (
                <TreePine className="w-4 h-4" />
              )}
            </button>
            {sidebarMode === 'navigation' && (
              <>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={cn(
                    "p-1 hover:bg-muted rounded transition-colors",
                    showSearch ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={expandAllNodes}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  title="Expand All"
                >
                  <Expand className="w-4 h-4" />
                </button>
                <button
                  onClick={collapseAllNodes}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  title="Collapse All"
                >
                  <Minimize className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {sidebarMode === 'navigation' && showSearch && (
          <div className="mb-3 relative">
            <input
              type="text"
              placeholder="Search JSON..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md pr-8"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        
        {/* Breadcrumb Navigation - only show in navigation mode */}
        {sidebarMode === 'navigation' && (
          <div className="mt-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-1 text-sm overflow-x-auto scrollbar-thin">
              {breadcrumbSegments.map((segment, index) => (
                <div key={index} className="flex items-center space-x-1 flex-shrink-0">
                  {index > 0 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  )}
                  <button
                    onClick={() => setSelectedPath(segment.path)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-mono transition-colors hover:bg-slate-200 dark:hover:bg-slate-700",
                      index === breadcrumbSegments.length - 1
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    {index === 0 ? (
                      <div className="flex items-center space-x-1">
                        <Home className="w-3 h-3" />
                        <span>{segment.label}</span>
                      </div>
                    ) : (
                      segment.label
                    )}
                  </button>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Content area - conditionally render based on mode */}
      <div className="flex-1 flex flex-col min-h-0">
        {sidebarMode === 'editor' ? (
          <div className="sidebar-editor-container">
            <SidebarJsonEditor className="h-full" />
          </div>
        ) : (
          <div className="sidebar-navigation-container overflow-x-auto overflow-y-auto flex-1">
            <div className="sidebar-tree-content p-2 min-w-max h-full">
              <TreeNode
                data={jsonData}
                path={[]}
                nodeKey=""
                level={0}
                searchTerm={searchTerm}
                onEditNode={handleEditNode}
                onDeleteNode={handleDeleteNode}
                onAddNode={handleAddNode}
                onNodeSelect={onNodeSelect}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
