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

export function ExcelSpreadsheet({ data, className, maxHeight = "400px", isLoading = false }: ExcelSpreadsheetProps) {
  // 计算统计数据
  const stats = useMemo(() => calculateTableStats(data), [data]);
  
  // 从数据中提取列定义
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!data || data.length === 0) return [];
    
    const firstRow = data[0];
    return Object.keys(firstRow).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <div className="px-2 py-1 text-sm truncate" title={String(value)}>
            {String(value)}
          </div>
        );
      },
    }));
  }, [data]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

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
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden flex flex-col h-full relative",
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
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 last:border-r-0"
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
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className="flex-1 min-w-[120px] border-r border-slate-100 dark:border-slate-800 last:border-r-0 flex items-center"
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