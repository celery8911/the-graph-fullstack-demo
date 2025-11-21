import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleToken", function () {
  let simpleToken: SimpleToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  const TOKEN_NAME = "Simple Token";
  const TOKEN_SYMBOL = "STKN";
  const INITIAL_SUPPLY = 1000000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      INITIAL_SUPPLY
    );
    await simpleToken.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置代币名称和符号", async function () {
      expect(await simpleToken.name()).to.equal(TOKEN_NAME);
      expect(await simpleToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("应该将初始供应量分配给 owner", async function () {
      const ownerBalance = await simpleToken.balanceOf(owner.address);
      const totalSupply = await simpleToken.totalSupply();

      expect(totalSupply).to.equal(
        ethers.parseEther(INITIAL_SUPPLY.toString())
      );
      expect(ownerBalance).to.equal(totalSupply);
    });

    it("应该设置正确的 owner", async function () {
      expect(await simpleToken.owner()).to.equal(owner.address);
    });
  });

  describe("Transfer 事件", function () {
    it("应该在转账时触发 Transfer 事件", async function () {
      const amount = ethers.parseEther("100");

      await expect(simpleToken.transfer(addr1.address, amount))
        .to.emit(simpleToken, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("应该正确更新余额", async function () {
      const amount = ethers.parseEther("100");
      await simpleToken.transfer(addr1.address, amount);

      expect(await simpleToken.balanceOf(addr1.address)).to.equal(amount);
    });
  });

  describe("DataUpdated 事件", function () {
    it("应该在更新数据时触发 DataUpdated 事件", async function () {
      const tokenId = 1;
      const data = "测试数据";

      const tx = await simpleToken.connect(addr1).updateData(tokenId, data);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(simpleToken, "DataUpdated")
        .withArgs(addr1.address, tokenId, data, block!.timestamp);
    });

    it("应该正确存储用户数据", async function () {
      const tokenId = 1;
      const data = "测试数据";

      await simpleToken.connect(addr1).updateData(tokenId, data);

      const userData = await simpleToken.getUserData(addr1.address, tokenId);
      expect(userData[0]).to.equal(data); // data
      expect(userData[2]).to.equal(1); // updateCount
    });

    it("应该正确追踪更新次数", async function () {
      const tokenId = 1;

      await simpleToken.connect(addr1).updateData(tokenId, "数据1");
      await simpleToken.connect(addr1).updateData(tokenId, "数据2");
      await simpleToken.connect(addr1).updateData(tokenId, "数据3");

      const userData = await simpleToken.getUserData(addr1.address, tokenId);
      expect(userData[2]).to.equal(3); // updateCount
    });

    it("不同用户的数据应该独立存储", async function () {
      const tokenId = 1;

      await simpleToken.connect(addr1).updateData(tokenId, "用户1的数据");
      await simpleToken.connect(addr2).updateData(tokenId, "用户2的数据");

      const userData1 = await simpleToken.getUserData(addr1.address, tokenId);
      const userData2 = await simpleToken.getUserData(addr2.address, tokenId);

      expect(userData1[0]).to.equal("用户1的数据");
      expect(userData2[0]).to.equal("用户2的数据");
    });
  });

  describe("Mint 功能", function () {
    it("owner 应该能够铸造新代币", async function () {
      const amount = ethers.parseEther("1000");

      await expect(simpleToken.mint(addr1.address, amount))
        .to.emit(simpleToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, amount);

      expect(await simpleToken.balanceOf(addr1.address)).to.equal(amount);
    });

    it("非 owner 不应该能够铸造代币", async function () {
      const amount = ethers.parseEther("1000");

      await expect(
        simpleToken.connect(addr1).mint(addr2.address, amount)
      ).to.be.revertedWithCustomError(simpleToken, "OwnableUnauthorizedAccount");
    });
  });
});
