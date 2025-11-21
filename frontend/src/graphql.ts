import { config } from './config';

// 简单的 GraphQL 查询函数，使用原生 fetch
export async function querySubgraph<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const response = await fetch(config.subgraphUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
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
