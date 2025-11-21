# Simple Token Frontend

React 前端应用，用于与 SimpleToken 智能合约交互并查询 The Graph 子图数据。

## 功能特性

### 1. Web3 集成
- 连接 MetaMask 钱包
- 自动切换到 Sepolia 测试网
- 显示账户地址和代币余额

### 2. 智能合约交互
- **转账**：向其他地址发送代币
- **更新数据**：在链上存储自定义数据

### 3. The Graph 数据查询
- **代币统计**：总供应量、持有者数量、交易次数等
- **最近转账**：实时显示最新的转账记录
- **数据更新**：显示用户的数据更新历史

## 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 配置

编辑 [src/config.ts](src/config.ts)，确保以下信息正确：

```typescript
export const config = {
  // The Graph 子图查询 URL
  subgraphUrl: 'https://api.studio.thegraph.com/query/.../...',

  // 智能合约地址
  contractAddress: '0x...',

  // 网络配置
  chainId: 11155111, // Sepolia
  // ...
};
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm run preview
```

## 使用说明

### 1. 连接钱包

1. 点击"连接 MetaMask"按钮
2. MetaMask 会弹出授权请求
3. 如果不在 Sepolia 网络，会自动提示切换

### 2. 查看数据

- **代币统计**：自动加载并显示全局统计信息
- **最近转账**：显示最新的 10 笔转账
- **数据更新**：显示最新的 10 条数据更新

### 3. 发送转账

1. 在"转账代币"卡片中输入：
   - 接收地址（例如：`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0`）
   - 转账数量（例如：`100`）
2. 点击"发送"按钮
3. MetaMask 会弹出确认窗口
4. 确认后等待交易完成
5. 约 3-5 秒后子图会自动更新数据

### 4. 更新数据

1. 在"更新数据"卡片中输入：
   - Token ID（例如：`1`）
   - 数据内容（例如：`Hello from The Graph!`）
2. 点击"更新"按钮
3. MetaMask 会弹出确认窗口
4. 确认后等待交易完成
5. 约 3-5 秒后子图会自动更新数据

### 5. 查看交易详情

点击每条记录下方的"查看交易 →"链接，会在新标签页打开 Etherscan 查看交易详情。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **ethers.js v6** - Web3 库
- **原生 fetch** - GraphQL 查询（无需 Apollo Client）

## 项目结构

```
frontend/
├── src/
│   ├── App.tsx           # 主应用组件
│   ├── App.css           # 样式文件
│   ├── main.tsx          # 入口文件
│   ├── config.ts         # 配置文件
│   ├── graphql.ts        # GraphQL 查询函数
│   ├── useWeb3.ts        # Web3 钩子
│   ├── SimpleToken.json  # 合约 ABI
│   └── vite-env.d.ts     # TypeScript 声明
├── index.html            # HTML 模板
├── package.json          # 依赖配置
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 开发提示

### 调试

打开浏览器开发者工具（F12），查看：
- **Console**：查看错误和日志
- **Network**：查看 GraphQL 请求
- **Application > Local Storage**：查看 MetaMask 数据

### 常见问题

**Q: 连接钱包失败？**
A: 确保已安装 MetaMask 浏览器插件。

**Q: 交易失败？**
A:
- 检查钱包是否有足够的 Sepolia ETH
- 确保在正确的网络（Sepolia）
- 检查合约地址是否正确

**Q: 查询不到数据？**
A:
- 确保子图 URL 正确
- 检查子图是否已完全同步
- 确认合约已有交易发生

**Q: 数据更新延迟？**
A: The Graph 索引通常需要 3-5 秒，可以点击"刷新数据"按钮手动更新。

## 部署

### 部署到 Vercel

```bash
npm run build
# 将 dist/ 目录部署到 Vercel
```

### 部署到 Netlify

```bash
npm run build
# 将 dist/ 目录部署到 Netlify
```

### 环境变量

如果需要在生产环境使用不同的配置，可以使用环境变量：

```typescript
// config.ts
export const config = {
  subgraphUrl: import.meta.env.VITE_SUBGRAPH_URL || 'https://...',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '0x...',
  // ...
};
```

创建 `.env.local`：
```
VITE_SUBGRAPH_URL=https://api.studio.thegraph.com/query/.../...
VITE_CONTRACT_ADDRESS=0x...
```

## License

MIT
