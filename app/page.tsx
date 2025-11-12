"use client";

import {toast} from "react-hot-toast";

import { useState, useEffect } from "react";

import ProductCard from "@/components/ProductCard";

import type { Product } from "@/types";

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/products?search=" + encodeURIComponent(debouncedSearch));
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        toast.error("Failed to fetch products.");
        console.error(error);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-800">Browse Products</h1>
      
      <input
        type="text"
        placeholder="Search by title or description..."
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-4 border-2 border-gray-300 rounded-lg shadow-inner focus:outline-none focus:border-green-500"
      />

      <div className={`${loading && "opacity-50"} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8`}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && <p className="text-center text-gray-500">No products found.</p>}
    </div>
  );
}