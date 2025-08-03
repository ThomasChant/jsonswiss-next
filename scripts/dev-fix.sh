#!/bin/bash

# Next.js 开发环境修复脚本
# 解决编译错误和缓存问题

echo "🔧 开始修复 Next.js 开发环境..."

# 1. 停止所有 Next.js 进程
echo "📝 停止现有 Next.js 进程..."
pkill -f "next dev" || true
pkill -f "next start" || true

# 2. 清理缓存
echo "🧹 清理 Next.js 缓存..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# 3. 清理临时文件
echo "🗑️  清理临时文件..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# 4. 重新安装依赖（可选）
if [ "$1" = "--reinstall" ]; then
    echo "📦 重新安装依赖..."
    rm -rf node_modules
    rm -f package-lock.json
    npm install
fi

# 5. 验证配置
echo "✅ 验证 Next.js 配置..."
if [ -f "next.config.ts" ]; then
    echo "   ✓ next.config.ts 存在"
else
    echo "   ❌ next.config.ts 缺失"
fi

# 6. 启动开发服务器
echo "🚀 启动开发服务器..."
echo "   使用 npm run dev 启动服务器"
echo "   如果仍有问题，请运行: ./scripts/dev-fix.sh --reinstall"

echo "🎉 修复完成！"