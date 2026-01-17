#!/bin/bash

# 保存当前目录
pushd "$(dirname "$0")/.." > /dev/null

# 清理已有的 public 目录
echo "清理 public 目录..."
rm -rf public

# 构建站点（用于本地测试）
echo "构建 Hugo 站点..."
hugo --gc --minify

echo "构建完成！"
echo "public 目录已生成"
echo ""
echo "提示：使用 GitHub Actions 自动部署，只需："
echo "  git add ."
echo "  git commit -m '你的提交信息'"
echo "  git push origin main"

# 恢复到原来的目录
popd > /dev/null
