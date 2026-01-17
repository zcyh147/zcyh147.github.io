#!/bin/bash

# 保存当前目录
pushd "$(dirname "$0")/.." > /dev/null

# 本地运行
hugo server

# 恢复到原来的目录
popd > /dev/null
