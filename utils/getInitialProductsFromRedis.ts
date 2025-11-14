import { PRODUCTS_KEY } from "@/constants";

import type { Product } from "@/types";
import type { CreateRedisClientReturnType } from "@/utils/createRedisClient";

export const getInitialProductsFromRedis = async (
  redisClient: Awaited<CreateRedisClientReturnType>
): Promise<Product[]> => {
  let products: Product[] = [];
  if (redisClient) {
    try {
      const data = await redisClient.get(PRODUCTS_KEY);
      if (data) {
        products = JSON.parse(data);
      }
    } catch (error) {
      console.error("Redis Initial Connection Error:", error);
    }
  }

  return products;
};
