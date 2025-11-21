# The Graph 子图

这个子图索引 SimpleToken 智能合约的事件，提供 GraphQL API 查询链上数据。

## 功能特性

### 索引的事件
- `Transfer` - ERC-20 代币转账事件
- `DataUpdated` - 用户数据更新事件

### 实体类型
- **Transfer** - 转账记录
- **DataUpdated** - 数据更新记录
- **User** - 用户信息（余额、统计等）
- **TokenStats** - 代币全局统计
- **DailyStats** - 每日统计信息

## 部署步骤

### 前置准备

1. **安装依赖**
   ```bash
   cd subgraph
   npm install
   ```

2. **更新配置**

   编辑 `subgraph.yaml`，替换以下信息：

   ```yaml
   # 替换为你的合约地址
   address: "0xYourContractAddress"

   # 替换为合约部署的区块号
   startBlock: 123456
   ```

3. **注册 The Graph Studio**

   访问 [The Graph Studio](https://thegraph.com/studio/)：
   - 使用钱包连接
   - 创建新的子图
   - 记录子图名称（slug）

### 部署到 The Graph Studio

1. **生成代码**
   ```bash
   npm run codegen
   ```

   这会根据 ABI 和 schema 生成 TypeScript 类型。

2. **构建子图**
   ```bash
   npm run build
   ```

   编译 AssemblyScript 代码为 WASM。

3. **认证**
   ```bash
   graph auth --studio <DEPLOY_KEY>
   ```

   从 The Graph Studio 复制你的 Deploy Key。

4. **部署**
   ```bash
   npm run deploy
   ```

   或手动指定子图名称：
   ```bash
   graph deploy --studio your-subgraph-name
   ```

### 本地开发（可选）

如果你想在本地运行 Graph Node：

1. **启动本地 Graph Node**
   ```bash
   # 使用 Docker Compose
   git clone https://github.com/graphprotocol/graph-node
   cd graph-node/docker
   docker-compose up
   ```

2. **创建本地子图**
   ```bash
   npm run create-local
   ```

3. **部署到本地**
   ```bash
   npm run deploy-local
   ```

## GraphQL 查询示例

部署成功后，你可以在 The Graph Studio 的 Playground 中测试查询。

### 查询最近的转账记录

```graphql
query RecentTransfers {
  transfers(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    from
    to
    value
    timestamp
    transactionHash
  }
}
```

### 查询用户信息

```graphql
query UserInfo($address: ID!) {
  user(id: $address) {
    address
    balance
    totalSent
    totalReceived
    transferCount
    dataUpdateCount
    firstSeenTimestamp
    lastSeenTimestamp
  }
}
```

### 查询数据更新记录

```graphql
query DataUpdates {
  dataUpdateds(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    user
    tokenId
    data
    timestamp
    transactionHash
  }
}
```

### 查询特定用户的数据更新

```graphql
query UserDataUpdates($user: Bytes!) {
  dataUpdateds(where: { user: $user }, orderBy: timestamp, orderDirection: desc) {
    id
    tokenId
    data
    timestamp
  }
}
```

### 查询代币统计

```graphql
query TokenStatistics {
  tokenStats(id: "token-stats") {
    totalSupply
    totalTransfers
    totalDataUpdates
    uniqueHolders
    lastUpdateTimestamp
  }
}
```

### 查询每日统计

```graphql
query DailyStatistics {
  dailyStats(first: 7, orderBy: date, orderDirection: desc) {
    date
    transferCount
    dataUpdateCount
    uniqueUsers
    volume
  }
}
```

### 查询用户的所有活动

```graphql
query UserActivity($address: ID!) {
  user(id: $address) {
    address
    balance
    transfers(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      to
      value
      timestamp
    }
    dataUpdates(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      tokenId
      data
      timestamp
    }
  }
}
```

## 子图状态监控

### 检查同步状态

访问 The Graph Studio 查看：
- 索引进度
- 同步区块高度
- 错误和警告
- 查询性能

### 常见问题

**Q: 子图部署后看不到数据？**
A: 确保：
1. 合约地址和起始区块号正确
2. 网络设置为 `sepolia`
3. 合约已经有事件触发
4. 等待子图同步完成

**Q: 编译错误？**
A:
1. 检查 `subgraph.yaml` 中的事件签名是否匹配
2. 确保 ABI 文件正确
3. 运行 `npm run codegen` 重新生成类型

**Q: 查询返回空结果？**
A:
1. 检查子图是否完全同步
2. 确认链上确实有相关交易
3. 验证查询语法正确

## 更新子图

如果需要修改子图：

1. 更新 `schema.graphql`、`subgraph.yaml` 或 `mapping.ts`
2. 重新运行构建流程：
   ```bash
   npm run codegen
   npm run build
   npm run deploy
   ```

3. The Graph Studio 会创建新版本
4. 可以在旧版本和新版本之间切换

## API 端点

部署成功后，你会获得两个端点：

- **查询 URL (HTTP)**：用于生产环境查询
  ```
  https://api.studio.thegraph.com/query/<SUBGRAPH_ID>/simple-token-subgraph/version/latest
  ```

- **开发查询 URL**：用于开发和测试
  ```
  https://api.studio.thegraph.com/query/<SUBGRAPH_ID>/simple-token-subgraph/<VERSION>
  ```

## 发布到去中心化网络

当你的子图准备好进入生产环境：

1. 在 The Graph Studio 中点击 "Publish"
2. 需要支付一些 GRT 代币作为 curation signal
3. 子图将被发布到去中心化网络
4. 获得最终的生产 URL

## 性能优化建议

1. **合理设置 startBlock**：从合约部署区块开始，避免扫描不必要的历史区块
2. **优化查询**：使用 `first`、`skip` 分页，避免查询过多数据
3. **使用索引字段**：在 schema 中合理使用 `@index` 标记
4. **避免复杂计算**：将复杂逻辑放在前端处理

## 资源链接

- [The Graph 文档](https://thegraph.com/docs/)
- [AssemblyScript 文档](https://www.assemblyscript.org/)
- [The Graph Studio](https://thegraph.com/studio/)
- [Discord 社区](https://discord.gg/graphprotocol)
