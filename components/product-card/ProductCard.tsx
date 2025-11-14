import Link from "next/link";
import Image from "next/image";

import type { Product } from "@/types";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.id}`} className="block border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative w-full h-48 bg-gray-100"
           data-has-embeddings={product.embeddings?.length ? "true" : "false"}>
        <Image 
          src={product.image} 
          alt={product.title}
          loading="eager"
          fill
          sizes="(max-width: 575px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
          style={{ objectFit: "cover" }} 
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-1 truncate">{product.title}</h2>
        <p className="text-gray-600 line-clamp-2 mb-2">{product.description}</p>
        <p className="text-2xl font-bold text-green-600">${Number(product.price).toFixed(2)}</p>
      </div>
    </Link>
  );
}