import { NextResponse, NextRequest } from "next/server";
import cosineSimilarity from "compute-cosine-similarity";
import { StatusCodes } from "http-status-codes";

// UTILS
import { createRedisClient } from "@/utils/createRedisClient";
import { getInitialProductsFromRedis } from "@/utils/getInitialProductsFromRedis";
import { saveProductsInRedis } from "@/utils/saveProductsInRedis";
import { generateEmbedding } from "@/utils/generateEmbedding";
import { checkPassword } from "@/utils/checkPassword";
import { validatePostPayload } from "@/utils/validatePostPayload";

// CONSTANTS
import { THREASHOLD } from "@/constants";

// TYPES
import { Product } from "@/types";

const redisClient = await createRedisClient();

let products = await getInitialProductsFromRedis(redisClient);

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const useSemanticSearch =
    request.nextUrl.searchParams.get("useSemanticSearch");
  let search = request.nextUrl.searchParams.get("search");

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

    const filteredProducts = products.filter((p) => {
      const title = p.title;
      if (!p.embeddings) {
        similarities[title] = null;
        return false;
      }
      const similarity = cosineSimilarity(p.embeddings, semanticSearch);
      similarities[title] = similarity;
      return similarity && similarity > THREASHOLD;
    });

    return NextResponse.json({ products: filteredProducts, similarities });
  }

  // use regular search if embedding
  search = search.toLowerCase();
  const filteredProducts = products.filter((p) => {
    return p.title.toLowerCase().startsWith(search);
  });

  return NextResponse.json({ products: filteredProducts });
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

      await saveProductsInRedis(redisClient, products);

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

    await saveProductsInRedis(redisClient, products);

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

  products = products.filter((p) => p.id.toString() !== id);

  await saveProductsInRedis(redisClient, products);

  return NextResponse.json({ success: true, status: StatusCodes.NO_CONTENT });
}
