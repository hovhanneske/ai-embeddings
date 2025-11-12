import { createClient, type RedisClientType } from "redis";
import { NextResponse, NextRequest } from "next/server";

import { Product } from "@/types";

const PRODUCTS_KEY = "products:catalog";

let products: Product[] = [];
let redisClient: RedisClientType | null = null;

try {
  redisClient = createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
  const data = await redisClient.get(PRODUCTS_KEY);
  if (data) {
    products = JSON.parse(data);
  }
} catch (error) {
  console.error("Redis Initial Connection Error:", error);
}

async function getProducts(): Promise<Product[]> {
  if (redisClient) {
    try {
      const data = await redisClient.get(PRODUCTS_KEY);
      if (data) {
        products = JSON.parse(data);
      }
    } catch (error) {
      console.error("Redis Error:", error);
    }
  }

  return products;
}

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const newProductData = (await request.json()) as Omit<Product, "id">;

    const products = await getProducts();

    const newId = products.length
      ? Math.max(...products.map((p) => p.id)) + 1
      : 1;

    const productWithId: Product = {
      id: newId,
      ...newProductData,
      price: parseFloat(newProductData.price as unknown as string),
    };

    products.push(productWithId);

    if (redisClient) {
      await redisClient.set(PRODUCTS_KEY, JSON.stringify(products));
    }

    return NextResponse.json(productWithId, { status: 201 });
  } catch (error) {
    console.error("Redis Write Error:", error);
    return NextResponse.json(
      { message: "Error adding product" },
      { status: 500 }
    );
  }
}
