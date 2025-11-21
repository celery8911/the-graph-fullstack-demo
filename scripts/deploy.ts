import { ethers } from "hardhat";

async function main() {
  console.log("开始部署 SimpleToken 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户地址:", deployer.address);
  console.log(
    "账户余额:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  // 部署合约参数
  const tokenName = "Simple Token";
  const tokenSymbol = "STKN";
  const initialSupply = 1000000; // 1,000,000 tokens

  // 部署合约
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy(
    tokenName,
    tokenSymbol,
    initialSupply
  );

  await simpleToken.waitForDeployment();

  const contractAddress = await simpleToken.getAddress();
  console.log("✅ SimpleToken 合约已部署到:", contractAddress);
  console.log("代币名称:", tokenName);
  console.log("代币符号:", tokenSymbol);
  console.log("初始供应量:", initialSupply);

  // 等待几个区块确认（用于 Etherscan 验证）
  console.log("\n等待区块确认...");
  await simpleToken.deploymentTransaction()?.wait(5);

  console.log("\n部署信息摘要:");
  console.log("=".repeat(50));
  console.log("合约地址:", contractAddress);
  console.log("部署者:", deployer.address);
  console.log("网络:", (await ethers.provider.getNetwork()).name);
  console.log("=".repeat(50));

  console.log("\n下一步:");
  console.log("1. 验证合约（可选）:");
  console.log(
    `   npx hardhat verify --network sepolia ${contractAddress} "${tokenName}" "${tokenSymbol}" ${initialSupply}`
  );
  console.log("\n2. 更新子图配置文件中的合约地址");
  console.log("3. 部署子图到 The Graph");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
