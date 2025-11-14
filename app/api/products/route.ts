import { createClient, type RedisClientType } from "redis";
import { GoogleGenAI } from "@google/genai";
import cosineSimilarity from "compute-cosine-similarity";
import bcrypt from "bcrypt";
import { NextResponse, NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";

import { Product } from "@/types";

if (!process.env.ADMIN_PASSWORD_HASH) {
  throw new Error("ADMIN_PASSWORD_HASH env variable is required.");
}
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH.replaceAll(
  "_DOLLAR_",
  "$"
);

const ai = new GoogleGenAI({});
const EMBEDDING_MODEL = "gemini-embedding-001";
const THREASHOLD = 0.7;

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
      model: EMBEDDING_MODEL,
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

const checkPassword = async (password: string) => {
  return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
};

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
    return NextResponse.json({ product: product });
  }

  if (!search?.trim()) {
    return NextResponse.json({ products });
  }

  const semanticSearch =
    useSemanticSearch === "true" ? await generateEmbedding(search) : false;

  if (semanticSearch) {
    const similarities: { [key: string]: number | null } = {};

    products = products.filter((p) => {
      const title = p.title;
      if (!p.embeddings) {
        similarities[title] = null;
        return false;
      }
      const similarity = cosineSimilarity(p.embeddings, semanticSearch);
      similarities[title] = similarity;
      return similarity && similarity > THREASHOLD;
    });

    return NextResponse.json({ products, similarities });
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
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  try {
    const {
      product,
      password,
    }: {
      product: Product;
      password: string;
    } = await request.json();

    const isAdmin = await checkPassword(password);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Invalid Password" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const { isValid, errors } = validatePostPayload(product);
    if (!isValid) {
      return NextResponse.json(
        { message: "Product not found", errors },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const products = await getProducts();

    // edit
    if (product.id) {
      const pruductIndex = products.findIndex((p) => p.id === product.id);
      if (pruductIndex === -1) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: StatusCodes.NOT_FOUND }
        );
      }

      // generate new embedding when title changed
      if (products[pruductIndex].title !== product.title) {
        products[pruductIndex].embeddings = await generateEmbedding(
          product.title
        );
      }

      // embeddings don't come with request
      product.embeddings = products[pruductIndex].embeddings;
      products[pruductIndex] = { ...products[pruductIndex], ...product };

      await saveProductsInRedis(products);

      return NextResponse.json(products[pruductIndex], {
        status: StatusCodes.OK,
      });
    }

    // add new
    const newId = products.length
      ? Math.max(...products.map((p) => p.id)) + 1
      : 1;

    product.id = newId;

    const embeddings = await generateEmbedding(product.title);

    const newProduct: Product = {
      ...product,
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
