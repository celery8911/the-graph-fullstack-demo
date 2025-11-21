# 使用 MetaMask 部署（不需要私钥）

## 方法 1：使用 Remix IDE（最简单）

1. 访问 [Remix IDE](https://remix.ethereum.org/)
2. 创建新文件 `SimpleToken.sol`，复制我们的合约代码
3. 编译合约（Solidity Compiler 选 0.8.20）
4. 连接 MetaMask
   - 在 "Deploy & Run Transactions" 标签
   - Environment 选择 "Injected Provider - MetaMask"
   - 确保 MetaMask 切换到 Sepolia 测试网
5. 填入构造函数参数：
   - name: "Simple Token"
   - symbol: "STKN"
   - initialSupply: 1000000
6. 点击 "Deploy"，在 MetaMask 中确认交易

## 方法 2：使用在线部署工具

使用 [Tenderly](https://tenderly.co/) 或 [OpenZeppelin Defender](https://defender.openzeppelin.com/)，这些工具支持通过 MetaMask 部署。

## 方法 3：创建测试专用钱包

1. 创建一个**新的**、**仅用于测试的** MetaMask 钱包
2. 导出这个测试钱包的私钥（设置 > 安全与隐私 > 显示私钥）
3. 这个钱包只用于测试网，不要放真实资产
4. 从水龙头获取测试 ETH

**安全提示：**
- ✅ 测试网专用钱包的私钥相对安全
- ✅ 确保 `.env` 在 `.gitignore` 中（已配置）
- ❌ 永远不要提交包含私钥的文件到 Git
- ❌ 不要使用包含真实资产的钱包私钥
