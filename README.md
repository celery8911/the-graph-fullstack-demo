# The Graph 全栈 Demo

这是一个完整的 The Graph 全栈示例项目，展示了从智能合约到前端的完整数据索引和查询流程。

## 项目结构

```
.
├── contracts/          # Solidity 智能合约
├── scripts/           # 部署脚本
├── subgraph/          # The Graph 子图配置
└── frontend/          # React 前端应用
```

## 包含内容

1. **Solidity 智能合约**
   - SimpleToken ERC-20 合约
   - 包含 Transfer 和 DataUpdated 可索引事件

2. **The Graph 子图**
   - subgraph.yaml (Manifest)
   - schema.graphql (GraphQL Schema)
   - mapping.ts (事件处理器)

3. **React 前端**
   - GraphQL 客户端集成
   - 实时数据查询和展示

## 快速开始

详细的部署和使用说明请参考各个目录下的 README 文件。

## 技术栈

- Solidity ^0.8.20
- Hardhat
- The Graph
- React
- TypeScript
- GraphQL

## License

MIT
