import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { querySubgraph, QUERIES } from './graphql';
import { config } from './config';
import './App.css';

function App() {
  const web3 = useWeb3();
  const [tokenStats, setTokenStats] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [dataUpdates, setDataUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 表单状态
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [dataTokenId, setDataTokenId] = useState('1');
  const [dataContent, setDataContent] = useState('');

  // 加载子图数据
  const loadSubgraphData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, transfersData, dataUpdatesData] = await Promise.all([
        querySubgraph(QUERIES.GET_TOKEN_STATS),
        querySubgraph(QUERIES.GET_RECENT_TRANSFERS, { first: 10 }),
        querySubgraph(QUERIES.GET_RECENT_DATA_UPDATES, { first: 10 }),
      ]);

      setTokenStats(statsData.tokenStats);
      setTransfers(transfersData.transfers);
      setDataUpdates(dataUpdatesData.dataUpdateds);
    } catch (err: any) {
      setError('加载数据失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadSubgraphData();
  }, []);

  // 处理转账
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!web3.account) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const txHash = await web3.transfer(transferTo, transferAmount);
      setSuccess(`转账成功! 交易哈希: ${txHash}`);
      setTransferTo('');
      setTransferAmount('');

      // 等待几秒让子图索引
      setTimeout(() => {
        loadSubgraphData();
        web3.updateBalance();
      }, 3000);
    } catch (err: any) {
      setError('转账失败: ' + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 处理数据更新
  const handleUpdateData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!web3.account) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const txHash = await web3.updateData(parseInt(dataTokenId), dataContent);
      setSuccess(`数据更新成功! 交易哈希: ${txHash}`);
      setDataContent('');

      // 等待几秒让子图索引
      setTimeout(() => {
        loadSubgraphData();
      }, 3000);
    } catch (err: any) {
      setError('数据更新失败: ' + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString('zh-CN');
  };

  // 格式化地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 格式化数量
  const formatValue = (value: string) => {
    return (parseInt(value) / 1e18).toFixed(2);
  };

  // 打开 Etherscan
  const openEtherscan = (hash: string) => {
    window.open(`${config.blockExplorer}/tx/${hash}`, '_blank');
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1>🚀 Simple Token - The Graph Demo</h1>
        <div className="wallet-info">
          {web3.account ? (
            <div className="account-info">
              <div className="address">{formatAddress(web3.account)}</div>
              <div className="balance">余额: {parseFloat(web3.balance).toFixed(4)} STKN</div>
            </div>
          ) : (
            <button onClick={web3.connectWallet} disabled={web3.isConnecting}>
              {web3.isConnecting ? '连接中...' : '连接 MetaMask'}
            </button>
          )}
          <button onClick={loadSubgraphData} className="refresh-button">
            刷新数据
          </button>
        </div>
      </div>

      {/* 消息提示 */}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="content">
        {/* 代币统计 */}
        <div className="card">
          <h2>📊 代币统计</h2>
          {loading && !tokenStats ? (
            <div className="loading">加载中...</div>
          ) : tokenStats ? (
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">总供应量</div>
                <div className="stat-value">{formatValue(tokenStats.totalSupply)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">持有者</div>
                <div className="stat-value">{tokenStats.uniqueHolders}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">总转账</div>
                <div className="stat-value">{tokenStats.totalTransfers}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">数据更新</div>
                <div className="stat-value">{tokenStats.totalDataUpdates}</div>
              </div>
            </div>
          ) : (
            <div>暂无数据</div>
          )}
        </div>

        {/* 转账表单 */}
        <div className="card">
          <h2>💸 转账代币</h2>
          <form onSubmit={handleTransfer}>
            <div className="form-group">
              <label>接收地址</label>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
                required
                disabled={!web3.account || loading}
              />
            </div>
            <div className="form-group">
              <label>数量</label>
              <input
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="100"
                required
                disabled={!web3.account || loading}
              />
            </div>
            <button type="submit" disabled={!web3.account || loading}>
              {loading ? '处理中...' : '发送'}
            </button>
          </form>
        </div>

        {/* 数据更新表单 */}
        <div className="card">
          <h2>📝 更新数据</h2>
          <form onSubmit={handleUpdateData}>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={dataTokenId}
                onChange={(e) => setDataTokenId(e.target.value)}
                placeholder="1"
                required
                disabled={!web3.account || loading}
              />
            </div>
            <div className="form-group">
              <label>数据内容</label>
              <textarea
                value={dataContent}
                onChange={(e) => setDataContent(e.target.value)}
                placeholder="输入要存储的数据..."
                required
                disabled={!web3.account || loading}
              />
            </div>
            <button type="submit" disabled={!web3.account || loading}>
              {loading ? '处理中...' : '更新'}
            </button>
          </form>
        </div>

        {/* 最近转账 */}
        <div className="card">
          <h2>🔄 最近转账</h2>
          <div className="transaction-list">
            {transfers.length > 0 ? (
              transfers.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="item-row">
                    <span className="item-label">从</span>
                    <span className="item-value">{formatAddress(tx.fromAddress)}</span>
                  </div>
                  <div className="item-row">
                    <span className="item-label">到</span>
                    <span className="item-value">{formatAddress(tx.toAddress)}</span>
                  </div>
                  <div className="item-row">
                    <span className="item-label">数量</span>
                    <span className="item-value">{formatValue(tx.value)} STKN</span>
                  </div>
                  <div className="item-row">
                    <span className="item-label">时间</span>
                    <span className="item-value">{formatTimestamp(tx.timestamp)}</span>
                  </div>
                  <div className="item-row">
                    <span className="item-hash" onClick={() => openEtherscan(tx.transactionHash)}>
                      查看交易 →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="loading">暂无转账记录</div>
            )}
          </div>
        </div>

        {/* 最近数据更新 */}
        <div className="card">
          <h2>📋 最近数据更新</h2>
          <div className="transaction-list">
            {dataUpdates.length > 0 ? (
              dataUpdates.map((update) => (
                <div key={update.id} className="data-item">
                  <div className="item-row">
                    <span className="item-label">用户</span>
                    <span className="item-value">{formatAddress(update.userAddress)}</span>
                  </div>
                  <div className="item-row">
                    <span className="item-label">Token ID</span>
                    <span className="item-value">{update.tokenId}</span>
                  </div>
                  <div className="item-row">
                    <span className="item-label">数据</span>
                    <span className="item-value">{update.data}</span>
                  </div>
                  <div className="item-row">
                    <span className="item-label">时间</span>
                    <span className="item-value">{formatTimestamp(update.timestamp)}</span>
                  </div>
                  <div className="item-row">
                    <span className="item-hash" onClick={() => openEtherscan(update.transactionHash)}>
                      查看交易 →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="loading">暂无数据更新记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
