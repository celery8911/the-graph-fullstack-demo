# 使用 Remix IDE 部署 SimpleToken 到 Sepolia 测试网

## 前置准备

### 1. 安装和配置 MetaMask

1. 安装 [MetaMask 浏览器插件](https://metamask.io/)
2. 创建或导入钱包
3. 切换到 Sepolia 测试网
   - 点击 MetaMask 顶部的网络下拉菜单
   - 选择 "Sepolia test network"
   - 如果看不到，点击 "Show/hide test networks"，启用测试网络

### 2. 获取 Sepolia 测试 ETH

访问以下任一水龙头获取免费的测试 ETH：
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)

通常需要 0.1-0.5 ETH 用于部署和测试。

## 部署步骤

### 步骤 1：打开 Remix IDE

访问：https://remix.ethereum.org/

### 步骤 2：创建合约文件

1. 在左侧 "File Explorer" 中，点击 "contracts" 文件夹
2. 创建新文件：点击 📄 图标，命名为 `SimpleToken.sol`
3. 复制以下完整合约代码：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleToken
 * @dev 一个简单的 ERC-20 代币合约，包含可索引的事件
 */
contract SimpleToken is ERC20, Ownable {
    // 自定义事件：数据更新事件
    event DataUpdated(
        address indexed user,
        uint256 indexed tokenId,
        string data,
        uint256 timestamp
    );

    // 存储用户数据
    struct UserData {
        string data;
        uint256 timestamp;
        uint256 updateCount;
    }

    // 映射：地址 => tokenId => 用户数据
    mapping(address => mapping(uint256 => UserData)) public userData;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * @dev 更新用户数据并触发事件
     * @param tokenId Token ID
     * @param data 要存储的数据
     */
    function updateData(uint256 tokenId, string memory data) external {
        userData[msg.sender][tokenId] = UserData({
            data: data,
            timestamp: block.timestamp,
            updateCount: userData[msg.sender][tokenId].updateCount + 1
        });

        emit DataUpdated(msg.sender, tokenId, data, block.timestamp);
    }

    /**
     * @dev 铸造新代币（仅限所有者）
     * @param to 接收地址
     * @param amount 数量
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev 获取用户数据
     * @param user 用户地址
     * @param tokenId Token ID
     */
    function getUserData(
        address user,
        uint256 tokenId
    )
        external
        view
        returns (string memory data, uint256 timestamp, uint256 updateCount)
    {
        UserData memory ud = userData[user][tokenId];
        return (ud.data, ud.timestamp, ud.updateCount);
    }
}
```

### 步骤 3：编译合约

1. 点击左侧的 "Solidity Compiler" 图标（第二个图标）
2. 配置编译器：
   - **Compiler**: 选择 `0.8.20` 或更高版本
   - **EVM Version**: 保持默认（paris）
   - **Enable optimization**: 可选（推荐勾选，runs: 200）
3. 点击蓝色 "Compile SimpleToken.sol" 按钮
4. 看到绿色的 ✓ 表示编译成功

### 步骤 4：连接 MetaMask

1. 点击左侧的 "Deploy & Run Transactions" 图标（第三个图标）
2. 在 **ENVIRONMENT** 下拉菜单中选择 `Injected Provider - MetaMask`
3. MetaMask 会弹出连接请求，点击 "连接"
4. 确认：
   - **ENVIRONMENT** 显示 "Injected Provider - MetaMask"
   - **ACCOUNT** 显示你的钱包地址
   - **NETWORK** 显示 "Sepolia (11155111)"

### 步骤 5：部署合约

1. 在 "CONTRACT" 下拉菜单中选择 `SimpleToken - contracts/SimpleToken.sol`
2. 展开 "Deploy" 按钮旁边的箭头 ▼
3. 填入构造函数参数：
   ```
   NAME: "Simple Token"
   SYMBOL: "STKN"
   INITIALSUPPLY: 1000000
   ```

   **参数说明**：
   - NAME: 代币全名
   - SYMBOL: 代币符号（显示在钱包中）
   - INITIALSUPPLY: 初始供应量（实际会是 1,000,000 * 10^18）

4. 点击橙色的 "transact" 按钮
5. MetaMask 会弹出交易确认窗口
   - 检查 Gas Fee（通常 < 0.01 ETH）
   - 点击 "确认"
6. 等待交易确认（通常 15-30 秒）

### 步骤 6：验证部署成功

1. 在 Remix 控制台底部，你会看到：
   - ✓ 绿色的成功消息
   - 交易哈希
   - 合约地址
2. 在左侧 "Deployed Contracts" 区域，会显示你的合约
3. **重要：复制并保存合约地址！** 格式如：`0x1234...5678`

### 步骤 7：测试合约功能

在 "Deployed Contracts" 区域，展开你的合约：

#### 读取函数（蓝色按钮，免费）：
- `name` - 返回 "Simple Token"
- `symbol` - 返回 "STKN"
- `totalSupply` - 返回 1000000000000000000000000
- `balanceOf` - 输入你的地址，查看余额

#### 写入函数（橙色按钮，需要 Gas）：
1. **测试 updateData**：
   - 展开 `updateData`
   - tokenId: `1`
   - data: `"Hello from Remix!"`
   - 点击 "transact"，在 MetaMask 确认

2. **查询数据**：
   - 展开 `getUserData`
   - user: 输入你的地址
   - tokenId: `1`
   - 点击 "call"
   - 应该看到返回的数据

3. **测试转账**：
   - 展开 `transfer`
   - to: 任意地址（如 `0x0000000000000000000000000000000000000001`）
   - amount: `100000000000000000000`（100 个代币）
   - 点击 "transact"，确认交易

## 在 Etherscan 上验证合约

### 方法 1：使用 Remix 验证插件（推荐）

1. 在 Remix 左侧点击 "Plugin Manager" 图标
2. 搜索并激活 "Etherscan - Contract Verification"
3. 点击新出现的 "Etherscan" 图标
4. 填入：
   - Contract Address: 你的合约地址
   - Contract Name: SimpleToken
   - API Key: 在 [Etherscan](https://etherscan.io/myapikey) 创建（免费）
5. 点击 "Verify" 按钮

### 方法 2：手动验证

1. 访问：https://sepolia.etherscan.io/verifyContract
2. 填写表单：
   - **Contract Address**: 你的合约地址
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: v0.8.20+commit...
   - **Open Source License Type**: MIT
3. 点击 "Continue"
4. 在下一页：
   - 粘贴完整的合约代码（包括 imports）
   - Optimization: Yes, Runs: 200
   - Constructor Arguments: 需要 ABI 编码，较复杂
5. 点击 "Verify and Publish"

**提示**：方法 1 更简单，推荐使用！

## 在 Etherscan 查看你的合约

访问：`https://sepolia.etherscan.io/address/你的合约地址`

你可以看到：
- ✅ 合约代码（验证后）
- 📊 交易历史
- 📝 事件日志（Transfer、DataUpdated）
- 🔍 代币信息

## 保存重要信息

请记录以下信息（后续 The Graph 配置需要）：

```
合约地址: 0x________________________________
部署区块号: _________（在 Etherscan 交易详情中查看）
部署交易哈希: 0x________________________________
网络: Sepolia
链 ID: 11155111
```

## 下一步

合约部署成功后，我们将：
1. 使用这个合约地址配置 The Graph 子图
2. 创建子图来索引 Transfer 和 DataUpdated 事件
3. 部署子图到 The Graph Studio
4. 创建前端应用查询数据

## 常见问题

**Q: MetaMask 连接失败？**
A: 确保浏览器允许弹出窗口，刷新 Remix 页面重试。

**Q: 交易失败 "out of gas"？**
A: 在 MetaMask 中手动增加 Gas Limit。

**Q: 看不到 Sepolia 网络？**
A: 在 MetaMask 设置中启用 "Show test networks"。

**Q: 水龙头不给我 ETH？**
A: 尝试多个水龙头，或在 Twitter 上请求帮助（#SepoliaETH）。

---

完成部署后，告诉我你的合约地址，我会帮你配置 The Graph 子图！
