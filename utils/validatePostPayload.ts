import type { Product } from "@/types";

export const validatePostPayload = (data: Product) => {
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
