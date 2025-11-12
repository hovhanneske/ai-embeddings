import Image from "next/image";

import type { Product } from "@/types";


async function getProduct(id: string) {
  const res = await fetch("http://localhost:3000/api/products");
  const products: Product[] = await res.json();
  return products.find((p) => p.id.toString() === id);
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const {id} = await params;
  const product = await getProduct(id);

  if (!product) {
    return <div className="text-center p-10 text-xl text-red-500">Product not found.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-white shadow-xl rounded-xl">
      <div className="w-full md:w-1/2 relative h-96 bg-gray-100 rounded-lg overflow-hidden">
        <Image 
          src={product.image || "/images/default.jpg"} 
          alt={product.title} 
          fill 
          style={{ objectFit: "contain" }} 
        />
      </div>
      <div className="w-full md:w-1/2">
        <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
        <p className="text-3xl font-extrabold text-green-700 mb-6">${product.price.toFixed(2)}</p>
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Description</h2>
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
        
        <button className="mt-8 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200">
          Add to Cart
        </button>
      </div>
    </div>
  );
}