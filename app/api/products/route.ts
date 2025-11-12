import { createClient, type RedisClientType } from "redis";
import { NextResponse, NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";

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

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  let search = request.nextUrl.searchParams.get("search");
  let products = await getProducts();

  if (id) {
    const product = products.find((p) => p.id.toString() === id);
    return NextResponse.json(product);
  }

  if (!search?.trim()) {
    return NextResponse.json(products);
  }

  search = search.toLowerCase();
  products = products.filter((p) => {
    const { title, description } = p;
    return (
      title.toLowerCase().startsWith(search) ||
      description.toLowerCase().startsWith(search)
    );
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const data: Product = await request.json();

    const products = await getProducts();

    // edit
    if (data.id) {
      const pruductIndex = products.findIndex((p) => p.id === data.id);
      if (pruductIndex === -1) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: StatusCodes.NOT_FOUND }
        );
      }

      products[pruductIndex] = { ...products[pruductIndex], ...data };

      if (redisClient) {
        await redisClient.set(PRODUCTS_KEY, JSON.stringify(products));
      }

      return NextResponse.json(products[pruductIndex], {
        status: StatusCodes.OK,
      });
    }

    // add new
    const newId = products.length
      ? Math.max(...products.map((p) => p.id)) + 1
      : 1;

    data.id = newId;

    const newProduct: Product = {
      ...data,
      id: newId,
    };

    products.push(newProduct);

    if (redisClient) {
      await redisClient.set(PRODUCTS_KEY, JSON.stringify(products));
    }

    return NextResponse.json(newProduct, { status: StatusCodes.CREATED });
  } catch (error) {
    console.error("Redis Write Error:", error);
    return NextResponse.json(
      { message: "Error adding product" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, status: StatusCodes.NOT_FOUND });
  }
  let products = await getProducts();
  products = products.filter((p) => p.id.toString() !== id);

  if (redisClient) {
    await redisClient.set(PRODUCTS_KEY, JSON.stringify(products));
  }

  return NextResponse.json({ success: true, status: StatusCodes.NO_CONTENT });
}
