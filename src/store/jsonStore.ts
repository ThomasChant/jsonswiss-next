import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/lib/toast';

export interface JsonState {
  // JSON data
  jsonData: any;
  originalJsonData: any;
  
  // Sample data state
  sampleDataLoaded: boolean;
  
  // Navigation state
  selectedPath: string[];
  expandedNodes: Set<string>;
  
  // Table-specific expansion state
  tableExpandedNodes: Set<string>;
  
  // View state (table only)
  viewMode: 'table';
  
  // Sidebar state
  sidebarMode: 'navigation' | 'editor';
  sidebarEditorContent: string;
  
  // History for undo/redo
  history: { data: any; description: string; timestamp: number }[];
  historyIndex: number;
  
  // Actions
  setJsonData: (data: any, description?: string) => void;
  setSelectedPath: (path: string[]) => void;
  toggleNodeExpansion: (nodeKey: string) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;
  setViewMode: (mode: 'table') => void;
  
  // Sample data actions
  setSampleDataLoaded: (loaded: boolean) => void;
  shouldLoadSampleData: () => boolean;
  
  // Sidebar actions
  setSidebarMode: (mode: 'navigation' | 'editor') => void;
  setSidebarEditorContent: (content: string) => void;
  
  // Table expansion actions
  toggleTableNodeExpansion: (nodeKey: string) => void;
  expandAllTableNodes: () => void;
  collapseAllTableNodes: () => void;
  
  // History actions
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Utility actions
  getNodeAtPath: (path: string[]) => any;
  updateNodeAtPath: (path: string[], value: any) => void;
  deleteNodeAtPath: (path: string[]) => void;
  renameKeyAtPath: (path: string[], oldKey: string, newKey: string) => void;
}

const MAX_HISTORY_SIZE = 50;
const MAX_EXPAND_NODES = 1000;
const MAX_EXPAND_DEPTH = 10;

export const useJsonStore = create<JsonState>()(
  persist(
    (set, get) => ({
      // Initial state
      jsonData: null,
      originalJsonData: null,
      sampleDataLoaded: false,
      selectedPath: [],
      expandedNodes: new Set<string>(),
      tableExpandedNodes: new Set<string>(),
      viewMode: 'table',
      sidebarMode: 'navigation',
      sidebarEditorContent: '',
      history: [],
      historyIndex: -1,
      
      // Actions
      setJsonData: (data, description = 'Update JSON') => {
        const state = get();
        
        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({
          data: JSON.parse(JSON.stringify(state.jsonData || {})),
          description,
          timestamp: Date.now(),
        });
        
        // Limit history size
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }
        
        // 同步更新侧边栏编辑器内容
        const newSidebarContent = data === null ? '' : JSON.stringify(data, null, 2);
        
        set({
          jsonData: data,
          originalJsonData: state.originalJsonData || data,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          sidebarEditorContent: newSidebarContent,
        });
      },
      
      setSelectedPath: (path) => set({ selectedPath: path }),
      
      toggleNodeExpansion: (nodeKey) => {
        const state = get();
        const newExpanded = new Set(state.expandedNodes);
        if (newExpanded.has(nodeKey)) {
          newExpanded.delete(nodeKey);
        } else {
          newExpanded.add(nodeKey);
        }
        set({ expandedNodes: newExpanded });
      },
      
      expandAllNodes: () => {
        const state = get();
        
        // Check if there's data to expand
        if (!state.jsonData || (typeof state.jsonData !== 'object')) {
          toast.warning('No JSON data available to expand');
          return;
        }
        
        const allNodes = new Set<string>();
        let nodeCount = 0;
        let maxDepth = 0;
        let wasLimited = false;
        
        const collectNodes = (obj: any, path: string[] = [], depth: number = 0) => {
          if (depth > MAX_EXPAND_DEPTH) {
            maxDepth = Math.max(maxDepth, depth);
            wasLimited = true;
            return;
          }
          
          if (nodeCount >= MAX_EXPAND_NODES) {
            wasLimited = true;
            return;
          }
          
          if (typeof obj === 'object' && obj !== null) {
            const currentPath = path.length === 0 ? '' : '.' + path.join('.');
            // Always add the path, including empty path for root
            allNodes.add(currentPath);
            nodeCount++;
            
            if (Array.isArray(obj)) {
              obj.forEach((item, index) => {
                collectNodes(item, [...path, index.toString()], depth + 1);
              });
            } else {
              Object.entries(obj).forEach(([key, value]) => {
                collectNodes(value, [...path, key], depth + 1);
              });
            }
          }
        };
        
        collectNodes(state.jsonData);
        set({ expandedNodes: allNodes });
        
        if (nodeCount === 0) {
          toast.info('No expandable nodes found');
          return;
        }
        
        if (wasLimited) {
          if (nodeCount >= MAX_EXPAND_NODES) {
            toast.info(`Expanded ${nodeCount} nodes (limit reached). Some nodes remain collapsed for performance.`);
          }
          if (maxDepth > MAX_EXPAND_DEPTH) {
            toast.info(`Maximum expansion depth (${MAX_EXPAND_DEPTH}) reached. Deeply nested nodes remain collapsed.`);
          }
        } else {
          toast.success(`Expanded all ${nodeCount} nodes`);
        }
      },
      
      collapseAllNodes: () => {
        const state = get();
        const currentlyExpanded = state.expandedNodes.size;
        
        if (currentlyExpanded === 0) {
          toast.info('All nodes are already collapsed');
          return;
        }
        
        set({ expandedNodes: new Set() });
        toast.success(`Collapsed ${currentlyExpanded} nodes`);
      },
      
      setViewMode: (mode) => set({ viewMode: 'table' }),
      
      // Sample data actions
      setSampleDataLoaded: (loaded) => set({ sampleDataLoaded: loaded }),
      
      shouldLoadSampleData: () => {
        const state = get();
        return !state.jsonData && !state.sampleDataLoaded;
      },
      
      // Sidebar actions
      setSidebarMode: (mode) => {
        const state = get();
        
        if (mode === 'editor' && state.sidebarMode === 'navigation') {
          // Switching from navigation to editor: format current jsonData
          let formattedContent = '';
          if (state.jsonData !== null && state.jsonData !== undefined) {
            try {
              formattedContent = JSON.stringify(state.jsonData, null, 2);
            } catch (error) {
              formattedContent = '';
              toast.error('Failed to format JSON data for editor');
            }
          }
          set({ 
            sidebarMode: mode,
            sidebarEditorContent: formattedContent
          });
        } else if (mode === 'navigation' && state.sidebarMode === 'editor') {
          // Switching from editor to navigation: parse editor content if valid
          if (state.sidebarEditorContent.trim()) {
            try {
              const parsedData = JSON.parse(state.sidebarEditorContent);
              state.setJsonData(parsedData, 'Update from sidebar editor');
              set({ sidebarMode: mode });
              toast.success('JSON data updated from sidebar editor');
            } catch (error) {
              // Invalid JSON, just switch mode without updating data
              set({ sidebarMode: mode });
              toast.warning('Switched to navigation mode. Editor content was not valid JSON.');
            }
          } else {
            set({ sidebarMode: mode });
          }
        } else {
          set({ sidebarMode: mode });
        }
      },
      
      setSidebarEditorContent: (content) => {
        set({ sidebarEditorContent: content });
        
        // Try to parse and update jsonData if content is valid JSON
        if (content.trim()) {
          try {
            const parsedData = JSON.parse(content);
            const state = get();
            state.setJsonData(parsedData, 'Update from sidebar editor');
          } catch (error) {
            // Invalid JSON, don't update jsonData
          }
        }
      },
      
      // Table expansion actions
      toggleTableNodeExpansion: (nodeKey) => {
        const state = get();
        const newExpanded = new Set(state.tableExpandedNodes);
        if (newExpanded.has(nodeKey)) {
          newExpanded.delete(nodeKey);
        } else {
          newExpanded.add(nodeKey);
        }
        set({ tableExpandedNodes: newExpanded });
      },
      
      expandAllTableNodes: () => {
        const state = get();
        const allNodes = new Set<string>();
        let nodeCount = 0;
        
        const collectNodes = (obj: any, path: string[] = []) => {
          if (nodeCount >= MAX_EXPAND_NODES) return;
          
          if (typeof obj === 'object' && obj !== null) {
            const currentPath = path.length === 0 ? '' : '.' + path.join('.');
            if (currentPath) {
              allNodes.add(currentPath);
              nodeCount++;
            }
            
            if (Array.isArray(obj)) {
              obj.forEach((item, index) => {
                collectNodes(item, [...path, index.toString()]);
              });
            } else {
              Object.entries(obj).forEach(([key, value]) => {
                collectNodes(value, [...path, key]);
              });
            }
          }
        };
        
        collectNodes(state.jsonData);
        set({ tableExpandedNodes: allNodes });
        
        if (nodeCount > 0) {
          toast.success(`Expanded all ${nodeCount} table nodes`);
        }
      },
      
      collapseAllTableNodes: () => set({ tableExpandedNodes: new Set() }),
      
      // History actions
      addToHistory: () => {
        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({
          data: JSON.parse(JSON.stringify(state.jsonData || {})),
          description: 'Manual save point',
          timestamp: Date.now(),
        });
        
        // Limit history size
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }
        
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const historyItem = state.history[newIndex];
          set({
            jsonData: JSON.parse(JSON.stringify(historyItem.data)),
            historyIndex: newIndex,
          });
        }
      },
      
      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const historyItem = state.history[newIndex];
          set({
            jsonData: JSON.parse(JSON.stringify(historyItem.data)),
            historyIndex: newIndex,
          });
        }
      },
      
      clearHistory: () => set({ history: [], historyIndex: -1 }),
      
      // Utility actions
      getNodeAtPath: (path) => {
        const state = get();
        let current = state.jsonData;
        
        for (const key of path) {
          if (current && typeof current === 'object') {
            current = current[key];
          } else {
            return undefined;
          }
        }
        
        return current;
      },
      
      updateNodeAtPath: (path, value) => {
        const state = get();
        
        if (!state.jsonData) {
          toast.error('No JSON data to update');
          return;
        }
        
        try {
          const newData = JSON.parse(JSON.stringify(state.jsonData));
          
          if (path.length === 0) {
            // Root update
            state.setJsonData(value, 'Update root');
            return;
          }
          
          let current = newData;
          
          // Navigate to parent
          for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (current && typeof current === 'object') {
              current = current[key];
            } else {
              throw new Error(`Invalid path: cannot access property '${key}' on ${typeof current}`);
            }
          }
          
          // Update final property
          if (current && typeof current === 'object') {
            const lastKey = path[path.length - 1];
            
            // Handle array index updates
            if (Array.isArray(current)) {
              const index = parseInt(lastKey);
              if (isNaN(index) || index < 0 || index >= current.length) {
                throw new Error(`Invalid array index: ${lastKey}`);
              }
              current[index] = value;
            } else {
              current[lastKey] = value;
            }
            
            state.setJsonData(newData, `Update ${path.join('.')}`);
          } else {
            throw new Error(`Cannot update property on ${typeof current}`);
          }
        } catch (error) {
          toast.error(`Failed to update: ${(error as Error).message}`);
        }
      },
      
      deleteNodeAtPath: (path) => {
        const state = get();
        const newData = JSON.parse(JSON.stringify(state.jsonData));
        
        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]];
        }
        
        if (path.length > 0) {
          const lastKey = path[path.length - 1];
          if (Array.isArray(current)) {
            current.splice(parseInt(lastKey), 1);
          } else {
            delete current[lastKey];
          }
        }
        
        state.setJsonData(newData, `Delete ${path.join('.')}`);
      },
      
      renameKeyAtPath: (path, oldKey, newKey) => {
        const state = get();
        
        if (!state.jsonData) {
          toast.error('No JSON data to update');
          return;
        }
        
        if (!newKey || newKey.trim() === '') {
          toast.error('New key name cannot be empty');
          return;
        }
        
        if (oldKey === newKey) {
          toast.info('Key name unchanged');
          return;
        }
        
        try {
          const newData = JSON.parse(JSON.stringify(state.jsonData));
          
          // Navigate to the target object
          let target = newData;
          for (const key of path) {
            if (target && typeof target === 'object' && !Array.isArray(target)) {
              target = target[key];
            } else {
              throw new Error(`Invalid path: cannot access property '${key}'`);
            }
          }
          
          // Validate target is an object (not array)
          if (!target || typeof target !== 'object' || Array.isArray(target)) {
            throw new Error('Can only rename keys in objects, not arrays');
          }
          
          // Check if old key exists
          if (!(oldKey in target)) {
            throw new Error(`Key '${oldKey}' does not exist`);
          }
          
          // Check if new key already exists (unless it's the same as old key)
          if (newKey in target) {
            throw new Error(`Key '${newKey}' already exists`);
          }
          
          // Validate new key name (basic validation)
          if (newKey.includes('.') || newKey.includes('[') || newKey.includes(']')) {
            throw new Error('Key name cannot contain special characters like ., [, ]');
          }
          
          // Perform the rename: copy value, delete old key
          const value = target[oldKey];
          delete target[oldKey];
          target[newKey] = value;
          
          const pathStr = path.length > 0 ? `${path.join('.')}.` : '';
          state.setJsonData(newData, `Rename key ${pathStr}${oldKey} to ${newKey}`);
          
          toast.success(`Renamed key '${oldKey}' to '${newKey}'`);
          
        } catch (error) {
          toast.error(`Failed to rename key: ${(error as Error).message}`);
        }
      },
    }),
    {
      name: 'json-swiss-storage',
      // Only persist essential data
      partialize: (state) => ({
        jsonData: state.jsonData,
        sampleDataLoaded: state.sampleDataLoaded,
        expandedNodes: Array.from(state.expandedNodes),
        tableExpandedNodes: Array.from(state.tableExpandedNodes),
        viewMode: state.viewMode,
        sidebarMode: state.sidebarMode,
        sidebarEditorContent: state.sidebarEditorContent,
      }),
      // Restore expanded nodes as Set
      onRehydrateStorage: () => (state) => {
        if (state && state.expandedNodes) {
          state.expandedNodes = new Set(state.expandedNodes as any);
        }
        if (state && state.tableExpandedNodes) {
          state.tableExpandedNodes = new Set(state.tableExpandedNodes as any);
        }
      },
    }
  )
);
