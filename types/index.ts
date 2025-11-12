export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
}

export interface ProductFormState {
  title: string;
  description: string;
  price: string; // Use string for input value to handle decimals easily
  image: string;
}
