import { ethers } from "hardhat";

async function main() {
  // 替换为你部署的合约地址
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

  if (!CONTRACT_ADDRESS) {
    throw new Error("请在 .env 文件中设置 CONTRACT_ADDRESS");
  }

  console.log("连接到合约:", CONTRACT_ADDRESS);

  // 获取签名者
  const [signer] = await ethers.getSigners();
  console.log("使用账户:", signer.address);

  // 连接到已部署的合约
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const token = SimpleToken.attach(CONTRACT_ADDRESS);

  // 1. 查询代币信息
  console.log("\n=== 代币信息 ===");
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const balance = await token.balanceOf(signer.address);

  console.log("代币名称:", name);
  console.log("代币符号:", symbol);
  console.log("总供应量:", ethers.formatEther(totalSupply), symbol);
  console.log("账户余额:", ethers.formatEther(balance), symbol);

  // 2. 更新数据（触发 DataUpdated 事件）
  console.log("\n=== 更新数据 ===");
  const tokenId = 1;
  const data = `测试数据 - ${new Date().toISOString()}`;

  console.log("发送交易: updateData(", tokenId, ",", data, ")");
  const tx = await token.updateData(tokenId, data);
  console.log("交易哈希:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ 交易已确认，区块号:", receipt?.blockNumber);

  // 3. 查询用户数据
  console.log("\n=== 查询用户数据 ===");
  const userData = await token.getUserData(signer.address, tokenId);
  console.log("数据内容:", userData[0]);
  console.log("更新时间:", new Date(Number(userData[1]) * 1000).toISOString());
  console.log("更新次数:", userData[2].toString());

  // 4. 转账（触发 Transfer 事件）
  console.log("\n=== 转账测试 ===");
  const transferAmount = ethers.parseEther("10");
  const recipientAddress = "0x0000000000000000000000000000000000000001"; // 示例地址

  console.log("转账金额:", ethers.formatEther(transferAmount), symbol);
  console.log("接收地址:", recipientAddress);

  const transferTx = await token.transfer(recipientAddress, transferAmount);
  console.log("交易哈希:", transferTx.hash);

  const transferReceipt = await transferTx.wait();
  console.log("✅ 转账成功，区块号:", transferReceipt?.blockNumber);

  console.log("\n=== 操作完成 ===");
  console.log("这些事件将被 The Graph 索引并可通过 GraphQL 查询");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
