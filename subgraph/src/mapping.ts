import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Transfer as TransferEvent,
  DataUpdated as DataUpdatedEvent,
} from "../generated/SimpleToken/SimpleToken";
import {
  Transfer,
  DataUpdated,
  User,
  TokenStats,
  DailyStats,
} from "../generated/schema";

// 常量
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const TOKEN_STATS_ID = "token-stats";

/**
 * 获取或创建用户实体
 */
function getOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let user = User.load(address.toHexString());

  if (user == null) {
    user = new User(address.toHexString());
    user.address = address;
    user.balance = BigInt.fromI32(0);
    user.totalSent = BigInt.fromI32(0);
    user.totalReceived = BigInt.fromI32(0);
    user.transferCount = BigInt.fromI32(0);
    user.dataUpdateCount = BigInt.fromI32(0);
    user.firstSeenTimestamp = timestamp;
    user.lastSeenTimestamp = timestamp;
    user.save();

    // 更新持币地址数量
    let stats = getOrCreateTokenStats();
    stats.uniqueHolders = stats.uniqueHolders.plus(BigInt.fromI32(1));
    stats.save();
  } else {
    user.lastSeenTimestamp = timestamp;
  }

  return user;
}

/**
 * 获取或创建代币统计实体
 */
function getOrCreateTokenStats(): TokenStats {
  let stats = TokenStats.load(TOKEN_STATS_ID);

  if (stats == null) {
    stats = new TokenStats(TOKEN_STATS_ID);
    stats.totalSupply = BigInt.fromI32(0);
    stats.totalTransfers = BigInt.fromI32(0);
    stats.totalDataUpdates = BigInt.fromI32(0);
    stats.uniqueHolders = BigInt.fromI32(0);
    stats.lastUpdateTimestamp = BigInt.fromI32(0);
    stats.save();
  }

  return stats;
}

/**
 * 获取或创建每日统计实体
 */
function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  // 计算日期 ID (YYYY-MM-DD)
  let dayTimestamp = timestamp.toI32() - (timestamp.toI32() % 86400);
  let dayId = dayTimestamp.toString();

  let stats = DailyStats.load(dayId);

  if (stats == null) {
    stats = new DailyStats(dayId);
    let date = new Date(dayTimestamp * 1000);
    stats.date = date.toISOString().split("T")[0];
    stats.transferCount = BigInt.fromI32(0);
    stats.dataUpdateCount = BigInt.fromI32(0);
    stats.uniqueUsers = BigInt.fromI32(0);
    stats.volume = BigInt.fromI32(0);
    stats.save();
  }

  return stats;
}

/**
 * 处理 Transfer 事件
 */
export function handleTransfer(event: TransferEvent): void {
  // 更新发送方用户信息（排除铸造）
  let fromUser: User;
  if (event.params.from.toHexString() != ZERO_ADDRESS) {
    fromUser = getOrCreateUser(event.params.from, event.block.timestamp);
    fromUser.balance = fromUser.balance.minus(event.params.value);
    fromUser.totalSent = fromUser.totalSent.plus(event.params.value);
    fromUser.transferCount = fromUser.transferCount.plus(BigInt.fromI32(1));
    fromUser.save();
  } else {
    fromUser = getOrCreateUser(event.params.from, event.block.timestamp);
  }

  // 更新接收方用户信息（排除销毁）
  let toUser: User;
  if (event.params.to.toHexString() != ZERO_ADDRESS) {
    toUser = getOrCreateUser(event.params.to, event.block.timestamp);
    toUser.balance = toUser.balance.plus(event.params.value);
    toUser.totalReceived = toUser.totalReceived.plus(event.params.value);
    toUser.transferCount = toUser.transferCount.plus(BigInt.fromI32(1));
    toUser.save();
  } else {
    toUser = getOrCreateUser(event.params.to, event.block.timestamp);
  }

  // 创建 Transfer 实体
  let id =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let transfer = new Transfer(id);

  transfer.from = fromUser.id;
  transfer.fromAddress = event.params.from;
  transfer.to = toUser.id;
  transfer.toAddress = event.params.to;
  transfer.value = event.params.value;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.transactionHash = event.transaction.hash;
  transfer.save();

  // 更新全局统计
  let stats = getOrCreateTokenStats();
  stats.totalTransfers = stats.totalTransfers.plus(BigInt.fromI32(1));
  stats.lastUpdateTimestamp = event.block.timestamp;

  // 如果是铸造，增加总供应量
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    stats.totalSupply = stats.totalSupply.plus(event.params.value);
  }

  // 如果是销毁，减少总供应量
  if (event.params.to.toHexString() == ZERO_ADDRESS) {
    stats.totalSupply = stats.totalSupply.minus(event.params.value);
  }

  stats.save();

  // 更新每日统计
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.transferCount = dailyStats.transferCount.plus(BigInt.fromI32(1));
  dailyStats.volume = dailyStats.volume.plus(event.params.value);
  dailyStats.save();
}

/**
 * 处理 DataUpdated 事件
 */
export function handleDataUpdated(event: DataUpdatedEvent): void {
  // 更新用户信息
  let user = getOrCreateUser(event.params.user, event.block.timestamp);
  user.dataUpdateCount = user.dataUpdateCount.plus(BigInt.fromI32(1));
  user.save();

  // 创建 DataUpdated 实体
  let id =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let dataUpdated = new DataUpdated(id);

  dataUpdated.user = user.id;
  dataUpdated.userAddress = event.params.user;
  dataUpdated.tokenId = event.params.tokenId;
  dataUpdated.data = event.params.data;
  dataUpdated.timestamp = event.params.timestamp;
  dataUpdated.blockNumber = event.block.number;
  dataUpdated.transactionHash = event.transaction.hash;
  dataUpdated.save();

  // 更新全局统计
  let stats = getOrCreateTokenStats();
  stats.totalDataUpdates = stats.totalDataUpdates.plus(BigInt.fromI32(1));
  stats.lastUpdateTimestamp = event.block.timestamp;
  stats.save();

  // 更新每日统计
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.dataUpdateCount = dailyStats.dataUpdateCount.plus(
    BigInt.fromI32(1)
  );
  dailyStats.save();
}
