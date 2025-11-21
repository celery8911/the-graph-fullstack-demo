import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { config } from './config';
import SimpleTokenABI from './SimpleToken.json';

export function useWeb3() {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);

  // 连接钱包
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('请安装 MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      // 请求账户
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // 检查网络
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== `0x${config.chainId.toString(16)}`) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${config.chainId.toString(16)}` }],
          });
        } catch (error: any) {
          if (error.code === 4902) {
            alert(`请在 MetaMask 中添加 ${config.chainName} 网络`);
          }
        }
      }

      // 创建 provider 和 contract
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        config.contractAddress,
        SimpleTokenABI.abi,
        signer
      );

      setAccount(accounts[0]);
      setProvider(provider);
      setContract(contract);

      // 获取余额
      const balance = await contract.balanceOf(accounts[0]);
      setBalance(formatEther(balance));
    } catch (error) {
      console.error('连接钱包失败:', error);
      alert('连接钱包失败');
    } finally {
      setIsConnecting(false);
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount('');
          setProvider(null);
          setContract(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // 更新余额
  const updateBalance = async () => {
    if (contract && account) {
      const balance = await contract.balanceOf(account);
      setBalance(formatEther(balance));
    }
  };

  // 转账
  const transfer = async (to: string, amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.transfer(to, parseEther(amount));
    await tx.wait();
    await updateBalance();
    return tx.hash;
  };

  // 更新数据
  const updateData = async (tokenId: number, data: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.updateData(tokenId, data);
    await tx.wait();
    return tx.hash;
  };

  // 获取代币信息
  const getTokenInfo = async () => {
    if (!contract) return null;
    const [name, symbol, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
    ]);
    return {
      name,
      symbol,
      totalSupply: formatEther(totalSupply),
    };
  };

  return {
    account,
    balance,
    isConnecting,
    connectWallet,
    transfer,
    updateData,
    updateBalance,
    getTokenInfo,
  };
}

// 扩展 Window 类型
declare global {
  interface Window {
    ethereum?: any;
  }
}
