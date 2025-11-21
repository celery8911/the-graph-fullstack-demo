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
