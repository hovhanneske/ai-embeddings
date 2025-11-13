import { createClient, type RedisClientType } from "redis";
import { GoogleGenAI } from "@google/genai";
import cosineSimilarity from "compute-cosine-similarity";
import { NextResponse, NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";

import { Product } from "@/types";

const ai = new GoogleGenAI({});
const embeddingModel = "gemini-embedding-001";

const PRODUCTS_KEY = "products:catalog";

let products: Product[] = [];
let redisClient: RedisClientType | null = null;

const saveProductsInRedis = async (products: Product[]) => {
  if (redisClient) {
    await redisClient.set(PRODUCTS_KEY, JSON.stringify(products));
  }
};

const generateEmbedding = async (text: string): Promise<number[] | null> => {
  try {
    const response = await ai.models.embedContent({
      model: embeddingModel,
      contents: text,
    });

    if (!response.embeddings?.[0]?.values?.length) {
      return null;
    }

    const values = response.embeddings[0].values;
    return values;
  } catch (error) {
    console.error("Embedding Generation Error:", error);
    return null;
  }
};

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

const validatePostPayload = (data: Product) => {
  let isValid = true;
  const errors: { [key: string]: string } = {};

  ["title", "description", "price", "image"].forEach((field) => {
    const value = data[field as keyof Product];
    if (!value) {
      isValid = false;
      errors[field] = `${field} is required`;
    }
  });

  return { isValid, errors };
};

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const useSemanticSearch =
    request.nextUrl.searchParams.get("useSemanticSearch");
  let search = request.nextUrl.searchParams.get("search");
  let products = await getProducts();

  if (id) {
    const product = products.find((p) => p.id.toString() === id);
    return NextResponse.json(product);
  }

  if (!search?.trim()) {
    return NextResponse.json(products);
  }

  const semanticSearch =
    useSemanticSearch === "true" ? await generateEmbedding(search) : false;

  if (semanticSearch) {
    products = products.filter((p) => {
      if (!p.embeddings) return false;
      const similarity = cosineSimilarity(p.embeddings, semanticSearch);
      return similarity && similarity > 0.75;
    });

    return NextResponse.json(products);
  }

  // use regular search if embedding
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

    const { isValid, errors } = validatePostPayload(data);
    if (!isValid) {
      return NextResponse.json(
        { message: "Product not found", errors },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

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

      // generate new embedding when title changed
      if (products[pruductIndex].title !== data.title) {
        products[pruductIndex].embeddings = await generateEmbedding(data.title);
      }

      products[pruductIndex] = { ...products[pruductIndex], ...data };

      await saveProductsInRedis(products);

      return NextResponse.json(products[pruductIndex], {
        status: StatusCodes.OK,
      });
    }

    // add new
    const newId = products.length
      ? Math.max(...products.map((p) => p.id)) + 1
      : 1;

    data.id = newId;

    const embeddings = await generateEmbedding(data.title);

    const newProduct: Product = {
      ...data,
      id: newId,
      embeddings,
    };

    products.push(newProduct);

    await saveProductsInRedis(products);

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

  await saveProductsInRedis(products);

  return NextResponse.json({ success: true, status: StatusCodes.NO_CONTENT });
}
