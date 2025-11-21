#!/bin/bash

# 更新 subgraph.yaml 配置脚本
# 使用方法: ./update-config.sh <合约地址> <起始区块号>

if [ "$#" -ne 2 ]; then
    echo "使用方法: ./update-config.sh <合约地址> <起始区块号>"
    echo "示例: ./update-config.sh 0x1234567890abcdef1234567890abcdef12345678 1234567"
    exit 1
fi

CONTRACT_ADDRESS=$1
START_BLOCK=$2

echo "正在更新 subgraph.yaml..."
echo "合约地址: $CONTRACT_ADDRESS"
echo "起始区块: $START_BLOCK"

# 使用 sed 更新配置文件
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/address: \"0x[a-fA-F0-9]*\"/address: \"$CONTRACT_ADDRESS\"/" subgraph.yaml
    sed -i '' "s/startBlock: [0-9]*/startBlock: $START_BLOCK/" subgraph.yaml
else
    # Linux
    sed -i "s/address: \"0x[a-fA-F0-9]*\"/address: \"$CONTRACT_ADDRESS\"/" subgraph.yaml
    sed -i "s/startBlock: [0-9]*/startBlock: $START_BLOCK/" subgraph.yaml
fi

echo "✅ 配置已更新！"
echo ""
echo "下一步："
echo "1. 运行 'npm run codegen' 生成类型"
echo "2. 运行 'npm run build' 构建子图"
echo "3. 运行 'npm run deploy' 部署到 The Graph Studio"
