import { config } from './config';

// 简单的 GraphQL 查询函数，使用原生 fetch
export async function querySubgraph<T = any>(
  query: string,
  variables?: Record<string, any>,
  retries = 2
): Promise<T> {
  let lastError: Error | null = null;

  console.log(`开始查询子图: ${config.subgraphUrl}`);
  console.log('查询内容:', query);
  if (variables) {
    console.log('变量:', variables);
  }

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('请求超时，中止请求...');
        controller.abort();
      }, 15000); // 15秒超时

      console.log(`第 ${i + 1}/${retries} 次尝试...`);

      const response = await fetch(config.subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`收到响应 - 状态码: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('错误响应内容:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log('查询结果:', result);

      if (result.errors) {
        console.error('GraphQL 错误:', result.errors);
        throw new Error(result.errors[0].message);
      }

      if (!result.data) {
        throw new Error('返回数据为空');
      }

      console.log('✅ 查询成功!');
      return result.data;
    } catch (error: any) {
      lastError = error;

      // 详细的错误信息
      const errorInfo = {
        message: error.message,
        name: error.name,
        type: error.constructor.name,
      };

      if (error.name === 'AbortError') {
        console.error(`❌ 请求超时 (尝试 ${i + 1}/${retries})`, errorInfo);
      } else if (error.message.includes('Failed to fetch')) {
        console.error(`❌ 网络连接失败 (尝试 ${i + 1}/${retries})`, errorInfo);
        console.error('可能原因：');
        console.error('1. 网络不稳定或无法访问外网');
        console.error('2. The Graph API 服务暂时不可用');
        console.error('3. 防火墙或代理设置阻止了请求');
      } else {
        console.error(`❌ 查询失败 (尝试 ${i + 1}/${retries})`, errorInfo);
      }

      // 如果不是最后一次尝试，等待后重试
      if (i < retries - 1) {
        const waitTime = 2000 * (i + 1);
        console.log(`⏳ 等待 ${waitTime / 1000} 秒后重试...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // 所有重试都失败
  const errorMsg = `子图查询失败: ${lastError?.message || '未知错误'}`;
  console.error('❌ 所有重试都失败了');
  console.error('请检查：');
  console.error('1. 网络连接是否正常（能否访问外网）');
  console.error('2. The Graph Studio 子图是否在线: https://thegraph.com/studio/');
  console.error(`3. 子图 URL 是否正确: ${config.subgraphUrl}`);

  throw new Error(errorMsg);
}

// GraphQL 查询定义
export const QUERIES = {
  // 获取代币统计
  GET_TOKEN_STATS: `
    query GetTokenStats {
      tokenStats(id: "token-stats") {
        totalSupply
        totalTransfers
        totalDataUpdates
        uniqueHolders
        lastUpdateTimestamp
      }
    }
  `,

  // 获取最近的转账
  GET_RECENT_TRANSFERS: `
    query GetRecentTransfers($first: Int!) {
      transfers(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        fromAddress
        toAddress
        value
        timestamp
        transactionHash
      }
    }
  `,

  // 获取最近的数据更新
  GET_RECENT_DATA_UPDATES: `
    query GetRecentDataUpdates($first: Int!) {
      dataUpdateds(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        userAddress
        tokenId
        data
        timestamp
        transactionHash
      }
    }
  `,

  // 获取用户信息
  GET_USER: `
    query GetUser($id: ID!) {
      user(id: $id) {
        address
        balance
        totalSent
        totalReceived
        transferCount
        dataUpdateCount
        firstSeenTimestamp
        lastSeenTimestamp
      }
    }
  `,

  // 获取所有用户
  GET_ALL_USERS: `
    query GetAllUsers($first: Int!) {
      users(first: $first, orderBy: balance, orderDirection: desc) {
        id
        address
        balance
        transferCount
        dataUpdateCount
      }
    }
  `,
};
