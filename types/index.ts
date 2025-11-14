export interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  embeddings: number[] | null;
}

export interface ProductFormState {
  title: string;
  description: string;
  price: string;
  image: string;
  password: string;
}
