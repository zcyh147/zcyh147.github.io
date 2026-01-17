#!/bin/bash

# 保存当前目录
pushd "$(dirname "$0")/.." > /dev/null

# 清理已有的 public 目录
echo "清理 public 目录..."
rm -rf public

# 构建站点
echo "构建 Hugo 站点..."
hugo --gc --minify

echo ""
echo "构建完成！"
echo ""

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "📝 检测到未提交的更改，正在提交..."
    
    # 添加所有更改
    git add .
    
    # 生成带时间戳的提交信息
    COMMIT_MSG="Site updated: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"
    
    echo ""
    echo "🚀 推送到 GitHub..."
    git push origin main
    
    echo ""
    echo "✨ 部署完成！GitHub Actions 将自动构建和发布网站"
    echo "📊 查看构建状态：https://github.com/zcyh147/zcyh147.github.io/actions"
else
    echo "✅ 没有需要提交的更改"
fi

# 恢复到原来的目录
popd > /dev/null
