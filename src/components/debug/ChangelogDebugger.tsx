"use client";

import { useEffect } from "react";

export function ChangelogDebugger() {
  useEffect(() => {
    console.log('Changelog page mounted');
    
    // 检查是否有任何错误或重定向
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      console.log('History pushState called:', args);
      return originalPushState.apply(history, args);
    };
    
    history.replaceState = function(...args) {
      console.log('History replaceState called:', args);
      return originalReplaceState.apply(history, args);
    };
    
    // 监听页面卸载
    return () => {
      console.log('Changelog page unmounting');
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);
  
  return null; // 这个组件不渲染任何内容，只用于调试
}