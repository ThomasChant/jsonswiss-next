# 配置面板迁移指南

## 概述

本文档描述了将所有功能页面的配置项移动到右侧视图上方，并默认隐藏、点击配置按钮后展开的实现方案。

## 设计目标

1. **统一用户体验** - 所有功能页面的配置项位置一致
2. **节省空间** - 配置项默认隐藏，减少界面混乱
3. **易于访问** - 点击配置按钮即可展开/收起配置项
4. **响应式设计** - 在不同屏幕尺寸下都能良好工作

## 实现方案

### 1. 创建通用配置面板组件

创建了 `src/components/ui/SettingsPanel.tsx` 组件，包含：

- **SettingsPanel** - 基础配置面板组件
- **CodeGenSettingsPanel** - 代码生成器专用配置面板
- **ConversionSettingsPanel** - 转换器专用配置面板
- **RepairSettingsPanel** - 修复工具专用配置面板

### 2. 配置面板特性

- **可折叠** - 默认隐藏，点击展开
- **统一样式** - 一致的视觉设计
- **图标指示** - 使用 ChevronUp/ChevronDown 指示状态
- **响应式** - 适配不同屏幕尺寸

### 3. 布局结构

```
功能页面布局：
├── 操作按钮栏 (Import, Copy, Download)
├── 编辑器区域
│   ├── 左侧：输入编辑器
│   └── 右侧：
│       ├── 配置面板 (新位置，可折叠)
│       └── 输出编辑器
```

## 已更新的页面

### 代码生成器
- ✅ JavaScript Generator (`/generator/javascript`)
- ✅ TypeScript Generator (`/generator/typescript`)
- 🔄 其他生成器页面 (待更新)

### 转换器
- ✅ CSV to JSON (`/converter/csv-to-json`)
- 🔄 其他转换器页面 (待更新)

### 工具
- ✅ JSON Repair (`/repair`)

## 使用示例

### JavaScript 生成器配置面板

```tsx
<CodeGenSettingsPanel
  isOpen={showSettings}
  onToggle={() => setShowSettings(!showSettings)}
>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {/* 配置选项 */}
  </div>
</CodeGenSettingsPanel>
```

### 转换器配置面板

```tsx
<ConversionSettingsPanel
  isOpen={showSettings}
  onToggle={() => setShowSettings(!showSettings)}
>
  {/* 转换选项 */}
</ConversionSettingsPanel>
```

## 迁移步骤

对于每个功能页面：

1. **移除 Settings2 图标导入**
2. **添加对应的配置面板组件导入**
3. **移除原有的配置面板 JSX**
4. **在右侧视图上方添加新的配置面板**
5. **移除操作按钮栏中的配置按钮**

## 技术细节

### 状态管理
- 保持现有的 `showSettings` 状态
- 配置选项状态保持不变

### 样式系统
- 使用 Tailwind CSS 类
- 支持深色模式
- 响应式网格布局

### 组件结构
```tsx
interface SettingsPanelProps {
  children: ReactNode;
  title?: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}
```

## 后续工作

1. **批量更新** - 更新所有剩余的功能页面
2. **测试验证** - 确保所有配置功能正常工作
3. **用户体验优化** - 根据用户反馈调整
4. **文档更新** - 更新用户使用文档

## 注意事项

- 配置面板默认隐藏，首次使用时需要引导用户
- 在小屏幕设备上，配置面板可能需要特殊处理
- 保持向后兼容性，确保现有功能不受影响

## 测试清单

- [ ] 配置面板正确展开/收起
- [ ] 配置选项功能正常
- [ ] 响应式布局正常
- [ ] 深色模式支持
- [ ] 键盘导航支持
- [ ] 屏幕阅读器兼容性