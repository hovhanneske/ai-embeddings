import { PRODUCTS_KEY } from "@/constants";

import type { Product } from "@/types";
import type { CreateRedisClientReturnType } from "@/utils/createRedisClient";

export const saveProductsInRedis = async (
  redisClient: Awaited<CreateRedisClientReturnType>,
  products: Product[]
) => {
  if (redisClient) {
    await redisClient.set(PRODUCTS_KEY, JSON.stringify(products));
  }
};
