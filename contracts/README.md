# Solidity 智能合约

## SimpleToken 合约

这是一个基于 OpenZeppelin 的 ERC-20 代币合约，包含以下特性：

### 功能

1. **标准 ERC-20 功能**
   - 代币转账
   - 授权和委托转账
   - 余额查询

2. **可索引事件**
   - `Transfer(address indexed from, address indexed to, uint256 value)` - ERC-20 标准转账事件
   - `DataUpdated(address indexed user, uint256 indexed tokenId, string data, uint256 timestamp)` - 自定义数据更新事件

3. **数据存储**
   - 支持用户存储和更新键值对数据
   - 每个用户可以针对不同的 tokenId 存储不同的数据
   - 记录更新时间戳和更新次数

### 部署

```bash
# 安装依赖
npm install

# 编译合约
npm run compile

# 部署到 Sepolia 测试网
npm run deploy:sepolia

# 验证合约（可选）
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "Simple Token" "STKN" 1000000
```

### 与合约交互

```bash
# 设置环境变量
export CONTRACT_ADDRESS=<your_contract_address>

# 运行交互脚本
npx hardhat run scripts/interact.ts --network sepolia
```

### 合约方法

#### 写入方法

- `updateData(uint256 tokenId, string memory data)` - 更新用户数据
- `mint(address to, uint256 amount)` - 铸造代币（仅限所有者）
- `transfer(address to, uint256 amount)` - 转账代币

#### 只读方法

- `getUserData(address user, uint256 tokenId)` - 获取用户数据
- `balanceOf(address account)` - 查询余额
- `totalSupply()` - 查询总供应量

### 事件

这些事件会被 The Graph 索引：

```solidity
// ERC-20 Transfer 事件
event Transfer(address indexed from, address indexed to, uint256 value);

// 自定义 DataUpdated 事件
event DataUpdated(
    address indexed user,
    uint256 indexed tokenId,
    string data,
    uint256 timestamp
);
```

## 环境配置

复制 `.env.example` 为 `.env` 并填入你的配置：

```bash
cp .env.example .env
```

需要配置：
- `PRIVATE_KEY`: 部署账户的私钥
- `SEPOLIA_RPC_URL`: Sepolia 测试网 RPC 端点
- `ETHERSCAN_API_KEY`: Etherscan API 密钥（用于验证）
