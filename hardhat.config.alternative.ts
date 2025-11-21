import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ledger";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org",
      // 使用 Ledger 硬件钱包
      ledgerAccounts: [
        "0x0000000000000000000000000000000000000000", // 替换为你的地址
      ],
    },
  },
};

export default config;
