"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

// 生成Excel风格的列名 (A, B, ..., Z, AA, AB, ...)
function getExcelColumnName(index: number): string {
  let result = '';
  let num = index;
  
  while (num >= 0) {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
    if (num < 0) break;
  }
  
  return result;
}

// 计算行号列宽度
function calculateRowNumberWidth(rowCount: number): string {
  const digits = rowCount.toString().length;
  // 基础宽度 + 每个数字的宽度 + 内边距
  const width = Math.max(48, 24 + digits * 8); // 最小48px，每个数字约8px
  return `${width}px`;
}

// 计算列宽度的工具函数
function calculateColumnWidths(data: any[]): { [key: string]: number } {
  if (!data || data.length === 0) return {};
  
  const columnWidths: { [key: string]: number } = {};
  const firstRow = data[0];
  const columnKeys = Object.keys(firstRow);
  
  columnKeys.forEach((key, index) => {
    // 计算列标题宽度 (Excel风格的列名如 A, B, C...)
    const headerText = getExcelColumnName(index);
    const headerWidth = Math.max(headerText.length * 12, 40); // 每个字符约12px，最小40px
    
    // 计算内容的最大宽度
    const maxContentLength = data.reduce((max, row) => {
      const value = row[key];
      const stringValue = String(value || '');
      return Math.max(max, stringValue.length);
    }, 0);
    
    // 基于内容长度估算像素宽度
    // 每个字符约8px，加上内边距24px (左右各12px)
    const contentWidth = Math.max(maxContentLength * 8 + 24, 80);
    
    // 取标题宽度和内容宽度的最大值，但限制在合理范围内
    const calculatedWidth = Math.max(headerWidth, contentWidth);
    columnWidths[key] = Math.min(Math.max(calculatedWidth, 100), 300); // 最小100px，最大300px
  });
  
  return columnWidths;
}

interface ExcelSpreadsheetProps {
  data: any[];
  className?: string;
  maxHeight?: string;
  isLoading?: boolean;
}

interface ColumnStats {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'mixed';
  nullCount: number;
  uniqueCount: number;
}

interface TableStats {
  totalRows: number;
  totalColumns: number;
  columnStats: ColumnStats[];
  memorySize: string;
}

// 计算表格统计数据
function calculateTableStats(data: any[]): TableStats {
  if (!data || data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      columnStats: [],
      memorySize: '0 B'
    };
  }

  const firstRow = data[0];
  const columnNames = Object.keys(firstRow);
  
  const columnStats: ColumnStats[] = columnNames.map(columnName => {
    const values = data.map(row => row[columnName]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = new Set(nonNullValues);
    
    // 检测数据类型
    let type: ColumnStats['type'] = 'string';
    if (nonNullValues.length > 0) {
      const sampleValue = nonNullValues[0];
      if (typeof sampleValue === 'number') {
        type = 'number';
      } else if (typeof sampleValue === 'boolean') {
        type = 'boolean';
      } else if (sampleValue instanceof Date || (!isNaN(Date.parse(String(sampleValue))) && String(sampleValue).match(/\d{4}-\d{2}-\d{2}/))) {
        type = 'date';
      } else {
        // 检查是否为混合类型
        const types = new Set(nonNullValues.map(v => typeof v));
        if (types.size > 1) {
          type = 'mixed';
        }
      }
    }
    
    return {
      name: columnName,
      type,
      nullCount: data.length - nonNullValues.length,
      uniqueCount: uniqueValues.size
    };
  });
  
  // 估算内存大小
  const jsonString = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonString]).size;
  const memorySize = formatBytes(sizeInBytes);
  
  return {
    totalRows: data.length,
    totalColumns: columnNames.length,
    columnStats,
    memorySize
  };
}

// 格式化字节大小
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ExcelSpreadsheet({ data, className, isLoading = false }: ExcelSpreadsheetProps) {
  // 计算统计数据
  const stats = useMemo(() => calculateTableStats(data), [data]);
  
  // 计算列宽度
  const columnWidths = useMemo(() => calculateColumnWidths(data), [data]);
  
  // 从数据中提取列定义
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!data || data.length === 0) return [];
    
    const firstRow = data[0];
    return Object.keys(firstRow).map((key, index) => ({
      accessorKey: key,
      header: getExcelColumnName(index), // 使用Excel风格的列名
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <div className="text-sm truncate" title={String(value)}>
            {String(value)}
          </div>
        );
      },
      meta: {
        width: columnWidths[key] || 120, // 使用计算的宽度，默认120px
      },
    }));
  }, [data, columnWidths]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  // 计算行号列宽度
  const rowNumberWidth = useMemo(() => {
    return calculateRowNumberWidth(data?.length || 0);
  }, [data?.length]);

  // 创建虚拟化容器的引用
  const parentRef = React.useRef<HTMLDivElement>(null);

  // 设置虚拟化
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // 每行的估计高度
    overscan: 10, // 预渲染的行数
  });
  
  // 如果没有数据，显示空状态或loading状态但保留统计信息
  if (!data || data.length === 0) {
    return (
      <div className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden flex flex-col h-full",
        className
      )}>
        {/* 空状态或loading状态内容 */}
        <div className="flex-1 flex items-center justify-center">
          {isLoading ? (
            <div className="text-center text-slate-500 dark:text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p>Loading Excel file...</p>
              <p className="text-sm mt-1">Processing your spreadsheet data</p>
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400">
              <p>No data to display</p>
              <p className="text-sm mt-1">Import an Excel file to see the spreadsheet</p>
            </div>
          )}
        </div>
        
        {/* 底部统计信息 - 即使没有数据也显示 */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
          <div className="flex justify-center">
            <div className="flex gap-8 text-sm text-slate-600 dark:text-slate-400">
              <div>{stats.totalRows.toLocaleString()} rows × {stats.totalColumns} columns</div>
              <div>Memory: {stats.memorySize}</div>
              <div>Showing: 0 / 0 rows</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full relative",
      className
    )}>
      {/* Loading覆盖层 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p>Loading Excel file...</p>
            <p className="text-sm mt-1">Processing your spreadsheet data</p>
          </div>
        </div>
      )}
      {/* 表头 */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex">
          {/* 行号列表头 */}
          <div 
            className="px-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50"
            style={{ width: rowNumberWidth }}
          >
            #
          </div>
          {/* 列号表头 */}
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                 key={header.id}
                 className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                 style={{ 
                   width: `${(header.column.columnDef.meta as any)?.width || 120}px`,
                   flexShrink: 0
                 }}
               >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 虚拟化表格内容 */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                style={
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }
                }
                className="flex border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {/* 行号列 */}
                <div 
                  className="px-2 py-2 text-xs text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30"
                  style={{ width: rowNumberWidth }}
                >
                  {virtualRow.index + 1}
                </div>
                {/* 数据列 */}
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className="border-r border-slate-100 dark:border-slate-800 last:border-r-0 flex items-center px-3 py-2"
                    style={{ 
                      width: `${(cell.column.columnDef.meta as any)?.width || 120}px`,
                      flexShrink: 0
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部统计信息 */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
        <div className="flex justify-center">
          <div className="flex gap-8 text-sm text-slate-600 dark:text-slate-400">
            <div>{stats.totalRows.toLocaleString()} rows × {stats.totalColumns} columns</div>
            <div>Memory: {stats.memorySize}</div>
            <div>Showing: {virtualizer.getVirtualItems().length} / {rows.length} rows</div>
          </div>
        </div>
      </div>
    </div>
  );
}