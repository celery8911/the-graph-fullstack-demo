# The Graph 全栈 Demo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

这是一个**完整的 The Graph 全栈示例项目**，展示了从智能合约开发、部署、事件索引到前端查询的完整 Web3 数据流程。

## 🌟 项目特色

✅ **完整的端到端实现** - 从智能合约到前端的完整流程
✅ **生产级代码质量** - 包含测试、文档和最佳实践
✅ **实战部署指南** - 详细的 Sepolia 测试网部署步骤
✅ **交互式前端** - 可直接与合约交互并查看子图数据
✅ **实时数据更新** - 演示 The Graph 的实时索引能力

## 📁 项目结构

```
the-graph-fullstack-demo/
├── contracts/              # 🔐 Solidity 智能合约
│   ├── SimpleToken.sol    #     ERC-20 代币合约
│   └── README.md          #     合约文档
│
├── scripts/               # 📜 部署和交互脚本
│   ├── deploy.ts          #     合约部署脚本
│   └── interact.ts        #     合约交互脚本
│
├── subgraph/              # 📊 The Graph 子图
│   ├── schema.graphql     #     GraphQL Schema定义
│   ├── subgraph.yaml      #     子图配置文件
│   ├── src/mapping.ts     #     事件处理映射
│   └── README.md          #     子图文档
│
├── frontend/              # 💻 React 前端应用
│   ├── src/
│   │   ├── App.tsx        #     主应用组件
│   │   ├── useWeb3.ts     #     Web3钩子
│   │   ├── graphql.ts     #     GraphQL查询
│   │   └── config.ts      #     配置文件
│   └── README.md          #     前端文档
│
├── test/                  # 🧪 智能合约测试
│   └── SimpleToken.test.ts
│
├── REMIX_DEPLOYMENT_GUIDE.md      # Remix IDE 部署指南
└── SUBGRAPH_DEPLOYMENT_GUIDE.md  # 子图部署指南
```

## 🚀 核心功能

### 1. 智能合约 (Solidity)

**SimpleToken** - 基于 OpenZeppelin 的 ERC-20 代币合约

特性：
- ✅ 标准 ERC-20 功能（转账、授权、余额查询）
- ✅ 自定义数据存储（`updateData` 函数）
- ✅ 可索引事件（`Transfer`、`DataUpdated`）
- ✅ 所有者权限管理（`mint` 函数）

```solidity
// 转账代币
function transfer(address to, uint256 amount) public returns (bool)

// 更新链上数据
function updateData(uint256 tokenId, string memory data) external

// 查询用户数据
function getUserData(address user, uint256 tokenId) external view
```

### 2. The Graph 子图

**实体类型：**
- `Transfer` - 转账记录
- `DataUpdated` - 数据更新记录
- `User` - 用户聚合信息
- `TokenStats` - 全局代币统计
- `DailyStats` - 每日统计数据

**支持的查询：**
```graphql
# 查询代币统计
query {
  tokenStats(id: "token-stats") {
    totalSupply
    totalTransfers
    uniqueHolders
  }
}

# 查询最近转账
query {
  transfers(first: 10, orderBy: timestamp, orderDirection: desc) {
    fromAddress
    toAddress
    value
  }
}

# 查询用户信息
query {
  user(id: "0x...") {
    balance
    transferCount
    dataUpdateCount
  }
}
```

### 3. React 前端

**功能：**
- 🔗 连接 MetaMask 钱包
- 💸 发送代币转账
- 📝 更新链上数据
- 📊 查询和展示子图数据
- 🔄 实时更新（交易后自动刷新）
- 🔍 查看 Etherscan 交易详情

**技术亮点：**
- 使用 `ethers.js v6` 进行 Web3 交互
- 使用原生 `fetch` 查询 GraphQL（无需 Apollo Client）
- TypeScript 类型安全
- 响应式设计

## 📖 快速开始

### 前置要求

- Node.js >= 18
- MetaMask 浏览器插件
- Sepolia 测试网 ETH（[从水龙头获取](https://sepoliafaucet.com/)）

### 1. 克隆项目

```bash
git clone https://github.com/celery8911/the-graph-fullstack-demo.git
cd the-graph-fullstack-demo
```

### 2. 部署智能合约

**选项 A：使用 Remix IDE（推荐新手）**

参考 [REMIX_DEPLOYMENT_GUIDE.md](REMIX_DEPLOYMENT_GUIDE.md)

**选项 B：使用 Hardhat**

```bash
# 安装依赖
npm install

# 编译合约
npm run compile

# 运行测试
npm test

# 配置 .env
cp .env.example .env
# 编辑 .env 填入私钥和 RPC URL

# 部署到 Sepolia
npm run deploy:sepolia
```

### 3. 部署 The Graph 子图

详细步骤参考 [SUBGRAPH_DEPLOYMENT_GUIDE.md](SUBGRAPH_DEPLOYMENT_GUIDE.md)

```bash
cd subgraph

# 安装依赖
npm install

# 更新配置（填入你的合约地址和区块号）
./update-config.sh <合约地址> <起始区块号>

# 生成类型
npm run codegen

# 构建子图
npm run build

# 认证（从 The Graph Studio 获取 Deploy Key）
npx graph auth --studio <YOUR_DEPLOY_KEY>

# 部署
npm run deploy
```

### 4. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 更新配置
# 编辑 src/config.ts，填入子图 URL 和合约地址

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 🎯 使用示例

### 场景 1：发送代币

1. 在前端点击"连接 MetaMask"
2. 在"转账代币"表单中输入接收地址和数量
3. 点击"发送"，在 MetaMask 确认交易
4. 等待 3-5 秒，子图自动索引新交易
5. 在"最近转账"列表中看到新记录

### 场景 2：更新链上数据

1. 在"更新数据"表单中输入 Token ID 和数据内容
2. 点击"更新"，在 MetaMask 确认交易
3. 等待 3-5 秒，子图自动索引
4. 在"最近数据更新"列表中看到新记录

### 场景 3：查询历史数据

- 查看"代币统计"卡片了解全局数据
- 滚动"最近转账"列表查看转账历史
- 点击"查看交易 →"在 Etherscan 查看详情

## 🏗️ 技术架构

```
┌─────────────────┐
│   React 前端    │
│  (port 3000)    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         v                 v
┌─────────────────┐  ┌──────────────────┐
│   MetaMask      │  │  The Graph API   │
│   (Web3)        │  │   (GraphQL)      │
└────────┬────────┘  └────────┬─────────┘
         │                    │
         v                    │
┌─────────────────┐          │
│ SimpleToken     │          │
│   (Sepolia)     │◄─────────┘
└─────────────────┘     索引事件
```

## 📚 文档

- [智能合约文档](contracts/README.md)
- [子图文档](subgraph/README.md)
- [前端文档](frontend/README.md)
- [Remix 部署指南](REMIX_DEPLOYMENT_GUIDE.md)
- [子图部署指南](SUBGRAPH_DEPLOYMENT_GUIDE.md)

## 🧪 测试

```bash
# 运行智能合约测试
npm test

# 测试结果
✔ 应该正确设置代币名称和符号
✔ 应该将初始供应量分配给 owner
✔ 应该在转账时触发 Transfer 事件
✔ 应该在更新数据时触发 DataUpdated 事件
... 11 passing
```

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 智能合约 | Solidity | ^0.8.20 |
| 合约库 | OpenZeppelin | ^5.0.0 |
| 开发框架 | Hardhat | ^2.19.0 |
| 测试框架 | Hardhat Toolbox | ^4.0.0 |
| 索引协议 | The Graph | Protocol v0.0.7 |
| 子图语言 | AssemblyScript | - |
| 前端框架 | React | ^18.2.0 |
| 构建工具 | Vite | ^5.0.0 |
| Web3 库 | ethers.js | ^6.9.0 |
| 类型系统 | TypeScript | ^5.3.0 |

## 🌐 已部署实例

- **智能合约**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x0379201C1014ece6FEc1bFE4E6371C484748406a)
- **子图**: [The Graph Studio](https://api.studio.thegraph.com/query/1716172/simple-token-subgraph/v0.0.2)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 License

[MIT](LICENSE)

---

**如果这个项目对你有帮助，请给个 ⭐ Star！**
