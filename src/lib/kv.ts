import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { Redis } from "@upstash/redis";

// In-memory fallback storage
const localStore = new Map<string, FrameNotificationDetails>();

// Use Redis if KV env vars are present, otherwise use in-memory
const useRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const redis = useRedis ? new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
}) : null;

function getUserNotificationDetailsKey(fid: number): string {
  return `${process.env.NEXT_PUBLIC_FRAME_NAME}:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  const key = getUserNotificationDetailsKey(fid);
  if (redis) {
    return await redis.get<FrameNotificationDetails>(key);
  }
  return localStore.get(key) || null;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  const key = getUserNotificationDetailsKey(fid);
  if (redis) {
    await redis.set(key, notificationDetails);
  } else {
    localStore.set(key, notificationDetails);
  }
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  const key = getUserNotificationDetailsKey(fid);
  if (redis) {
    await redis.del(key);
  } else {
    localStore.delete(key);
  }
}

// In-memory fallback for rate limits and one-time flags
const localCounters = new Map<string, { count: number; expiresAt: number }>();

/**
 * Fixed-window rate limiter. Returns true if the call is allowed.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<boolean> {
  const fullKey = `${process.env.NEXT_PUBLIC_FRAME_NAME}:ratelimit:${key}`;

  if (redis) {
    const count = await redis.incr(fullKey);
    if (count === 1) {
      await redis.expire(fullKey, windowSec);
    }
    return count <= limit;
  }

  const now = Date.now();
  const entry = localCounters.get(fullKey);
  if (!entry || entry.expiresAt <= now) {
    localCounters.set(fullKey, { count: 1, expiresAt: now + windowSec * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/**
 * Sets a flag if it doesn't exist yet. Returns true only for the first caller.
 */
export async function setOnce(key: string): Promise<boolean> {
  const fullKey = `${process.env.NEXT_PUBLIC_FRAME_NAME}:once:${key}`;

  if (redis) {
    const result = await redis.set(fullKey, 1, { nx: true });
    return result === "OK";
  }

  if (localCounters.has(fullKey)) return false;
  localCounters.set(fullKey, { count: 1, expiresAt: Infinity });
  return true;
}
