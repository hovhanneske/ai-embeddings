import axios from "axios";

import type { Product, ProductFormState } from "@/types";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

if (!DOMAIN) {
  throw new Error("Domain is not defined");
}

const BASE_URL = DOMAIN + "/api/products";

export const getProducts = async (
  useSemanticSearch: boolean,
  search: string
) => {
  return axios.get<{ products: Product[] }>(
    `${BASE_URL}?useSemanticSearch=${useSemanticSearch}&search=${encodeURIComponent(
      search
    )}`
  );
};

export const getProductById = async (id: number) => {
  return axios.get<{ product: Product }>(`${BASE_URL}?id=${id}`);
};

export const createOrEditProduct = async (
  formData: ProductFormState,
  id: string
) => {
  const { title, description, price, image, password } = formData;
  const product = {
    id: Number(id),
    title,
    description,
    price,
    image,
  };

  const payload = {
    password,
    product,
  };
  return axios.post(BASE_URL, payload);
};

export const deleteProduct = async (id: string) => {
  return axios.delete(`${BASE_URL}?id=${id}`);
};
