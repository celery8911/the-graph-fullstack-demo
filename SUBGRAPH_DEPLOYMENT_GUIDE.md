# The Graph 子图部署指南

## 📋 前置准备清单

在开始之前，确保你已经：

- ✅ 部署了 SimpleToken 合约到 Sepolia
- ✅ 记录了合约地址
- ✅ 记录了部署区块号
- ✅ 合约已经在 Etherscan 上验证

## 🚀 快速部署步骤

### 第 1 步：注册 The Graph Studio

1. 访问 https://thegraph.com/studio/
2. 点击 "Connect Wallet"
3. 使用 MetaMask 连接（同一个部署合约的钱包）
4. 点击 "Create a Subgraph"
5. 输入子图名称，例如：`simple-token-subgraph`
6. 记录你的 **Deploy Key**（后面需要用到）

### 第 2 步：更新子图配置

在 `subgraph` 目录中，使用脚本更新配置：

```bash
cd subgraph

# 使用脚本更新（推荐）
./update-config.sh <你的合约地址> <部署区块号>

# 示例：
# ./update-config.sh 0x1234567890abcdef1234567890abcdef12345678 5678901
```

或者手动编辑 `subgraph.yaml`：

```yaml
source:
  address: "0x你的合约地址"  # 替换这里
  abi: SimpleToken
  startBlock: 5678901  # 替换这里
```

### 第 3 步：安装依赖

```bash
npm install
```

### 第 4 步：生成代码

```bash
npm run codegen
```

这会：
- 根据 ABI 生成 TypeScript 类型
- 根据 schema.graphql 生成实体类型
- 创建 `generated/` 目录

**预期输出**：
```
✔ Apply migrations
✔ Load subgraph from subgraph.yaml
  Load contract ABI from abis/SimpleToken.json
✔ Load contract ABIs
  Generate types for contract ABI: SimpleToken (abis/SimpleToken.json)
  Write types to generated/SimpleToken/SimpleToken.ts
✔ Generate types for data source templates
✔ Load data source template ABIs
✔ Generate types for data source template ABIs
✔ Load GraphQL schema from schema.graphql
  Write types to generated/schema.ts
✔ Generate types for GraphQL schema
```

### 第 5 步：构建子图

```bash
npm run build
```

这会编译 AssemblyScript 代码为 WASM。

**预期输出**：
```
✔ Compile subgraph
  Compile data source: SimpleToken => build/SimpleToken/SimpleToken.wasm
✔ Write compiled subgraph to build/
```

### 第 6 步：认证

```bash
graph auth --studio <YOUR_DEPLOY_KEY>
```

将 `<YOUR_DEPLOY_KEY>` 替换为你在 The Graph Studio 中获取的 Deploy Key。

**示例**：
```bash
graph auth --studio 1234567890abcdef1234567890abcdef
```

### 第 7 步：部署

```bash
npm run deploy
```

或者手动指定子图名称：
```bash
graph deploy --studio simple-token-subgraph
```

**部署过程**：
1. 上传子图到 IPFS
2. 提交到 The Graph Studio
3. 开始索引区块链数据

**预期输出**：
```
✔ Upload subgraph to IPFS

Build completed: QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX

Deployed to https://thegraph.com/studio/subgraph/simple-token-subgraph

Subgraph endpoints:
Queries (HTTP):     https://api.studio.thegraph.com/query/<id>/simple-token-subgraph/<version>
```

## 🔍 验证子图部署

### 在 The Graph Studio 验证

1. 访问 https://thegraph.com/studio/
2. 进入你的子图页面
3. 检查以下信息：

   **同步状态**：
   - ⏳ Syncing - 正在同步
   - ✅ Synced - 已完全同步
   - ⚠️ Failed - 失败（查看错误日志）

   **索引进度**：
   - 当前区块号
   - 最新区块号
   - 索引百分比

### 使用 Playground 测试查询

在 The Graph Studio 的 "Playground" 标签中测试查询：

#### 测试查询 1：获取代币统计

```graphql
{
  tokenStats(id: "token-stats") {
    totalSupply
    totalTransfers
    totalDataUpdates
    uniqueHolders
  }
}
```

**预期结果**：
```json
{
  "data": {
    "tokenStats": {
      "totalSupply": "1000000000000000000000000",
      "totalTransfers": "1",
      "totalDataUpdates": "0",
      "uniqueHolders": "1"
    }
  }
}
```

#### 测试查询 2：获取最近的转账

```graphql
{
  transfers(first: 5, orderBy: timestamp, orderDirection: desc) {
    id
    from
    to
    value
    timestamp
  }
}
```

#### 测试查询 3：获取用户信息

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    address
    balance
    totalSent
    totalReceived
    transferCount
    dataUpdateCount
  }
}
```

**Query Variables**：
```json
{
  "id": "0x你的钱包地址（小写）"
}
```

## 🧪 触发事件生成测试数据

如果子图同步成功但没有数据，在 Remix IDE 中执行一些交易：

### 1. 测试转账

```solidity
// 在 Remix 的 Deployed Contracts 中
transfer(
  to: "0x0000000000000000000000000000000000000001",
  amount: "100000000000000000000"  // 100 tokens
)
```

### 2. 测试数据更新

```solidity
updateData(
  tokenId: 1,
  data: "Hello from The Graph!"
)
```

等待交易确认后（15-30秒），刷新 The Graph Studio，应该能看到新数据。

## 📊 查看子图指标

在 The Graph Studio 中查看：

- **Queries** - 查询次数统计
- **Indexing Status** - 索引状态
- **Logs** - 详细日志
- **Performance** - 性能指标

## ❌ 常见问题排查

### 问题 1：codegen 失败

**错误**：`Failed to load contract ABI`

**解决**：
```bash
# 确保 ABI 文件存在
ls -la subgraph/abis/SimpleToken.json

# 如果不存在，从项目根目录复制
cp artifacts/contracts/SimpleToken.sol/SimpleToken.json subgraph/abis/
```

### 问题 2：build 失败

**错误**：`Mapping handler not found`

**解决**：
- 检查 `subgraph.yaml` 中的 handler 名称与 `mapping.ts` 中的函数名称一致
- 确保 event 签名正确

### 问题 3：部署后无数据

**可能原因**：
1. startBlock 设置错误（晚于合约部署）
2. 合约地址错误
3. 还没有交易触发事件

**解决**：
```bash
# 在 Etherscan 查看合约部署区块号
# https://sepolia.etherscan.io/address/<你的合约地址>

# 确认有 Transfer 或 DataUpdated 事件
```

### 问题 4：索引失败

**错误**：在 Studio 看到 "Failed" 状态

**解决**：
1. 查看 Studio 的 "Logs" 标签
2. 检查错误信息
3. 常见错误：
   - Event signature mismatch - 检查 ABI
   - Invalid start block - 修改 startBlock
   - Network issues - 等待重试

## 📝 获取 API 端点

部署成功后，你会得到两个重要的 URL：

### 开发查询 URL
```
https://api.studio.thegraph.com/query/<id>/simple-token-subgraph/<version>
```
- 用于开发和测试
- 每次部署创建新版本
- 可以回滚到之前版本

### 生产查询 URL（发布后）
```
https://gateway.thegraph.com/api/<api-key>/subgraphs/id/<subgraph-id>
```
- 需要先 "Publish" 子图到去中心化网络
- 需要支付 GRT 代币
- 更稳定和去中心化

## 🎯 下一步

子图部署并验证成功后：

1. ✅ 记录你的查询 URL
2. ✅ 在 Playground 中测试几个查询
3. ✅ 确保能获取到数据
4. ✅ 继续创建 React 前端应用

## 📚 有用的命令

```bash
# 查看 Graph CLI 版本
graph --version

# 查看帮助
graph --help

# 查看部署帮助
graph deploy --help

# 清理构建文件
rm -rf build/ generated/

# 重新构建
npm run codegen && npm run build
```

## 🔗 相关资源

- [The Graph 文档](https://thegraph.com/docs/)
- [The Graph Studio](https://thegraph.com/studio/)
- [The Graph Discord](https://discord.gg/graphprotocol)
- [AssemblyScript 手册](https://www.assemblyscript.org/)

---

准备好后，告诉我你的子图查询 URL，我会帮你创建前端应用！
