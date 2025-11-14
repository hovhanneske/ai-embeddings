import { createClient } from "redis";

export const createRedisClient = async () => {
  try {
    const redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Redis Initial Connection Error:", error);
    return null;
  }
};

export type CreateRedisClientReturnType = ReturnType<typeof createRedisClient>;
