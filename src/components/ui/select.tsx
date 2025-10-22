"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
}

export interface SelectContentProps {
  children: React.ReactNode;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Context for Select state
const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabled?: boolean;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}>({
  isOpen: false,
  setIsOpen: () => {},
  triggerRef: { current: null } as React.MutableRefObject<HTMLButtonElement | null>
});

export function Select({ value, onValueChange, disabled, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, disabled, triggerRef }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children }: SelectTriggerProps) {
  const { isOpen, setIsOpen, disabled, triggerRef } = React.useContext(SelectContext);

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300",
        className
      )}
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);
  
  if (!value) {
    return <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>;
  }
  
  return <span>{value}</span>;
}

export function SelectContent({ children }: SelectContentProps) {
  const { isOpen, setIsOpen, triggerRef } = React.useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    function computePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();

      // Default max menu height
      const maxMenuHeight = 240; // 15rem default cap
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;
      const usableHeight = Math.min(maxMenuHeight, openUpward ? spaceAbove - 8 : spaceBelow - 8);
      const top = openUpward ? Math.max(8, rect.top - usableHeight - 4) : rect.bottom + 4;
      const left = rect.left;
      const width = rect.width;
      setPosition({ top, left, width, openUpward, maxHeight: Math.max(120, usableHeight) });
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      computePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', computePosition);
      window.addEventListener('scroll', computePosition, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', computePosition);
        window.removeEventListener('scroll', computePosition, true);
      };
    }
  }, [isOpen, setIsOpen, triggerRef]);

  if (!isOpen || !position) return null;

  const content = (
    <div
      ref={contentRef}
      className={
        "z-[1000] overflow-auto bg-white border border-slate-200 rounded-md shadow-lg dark:bg-slate-950 dark:border-slate-800"
      }
      role="listbox"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
      }}
      data-select-portal
    >
      {children}
    </div>
  );

  // Render in a portal to escape clipping parents
  return createPortal(content, document.body);
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const { onValueChange, setIsOpen, value: selectedValue } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-blue-50 dark:hover:bg-blue-900/20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-blue-50 dark:bg-blue-900/20",
        className
      )}
      onMouseDown={(e) => {
        // Use mousedown to avoid Dialog intercepting click outside
        e.preventDefault();
        onValueChange?.(value);
        setIsOpen(false);
      }}
      role="option"
      aria-selected={isSelected}
    >
      {children}
    </div>
  );
}
