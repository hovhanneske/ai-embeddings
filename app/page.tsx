"use client";

import { toast } from "react-hot-toast";

import { useState, useEffect } from "react";

import ProductCard from "@/components/ProductCard";

import { getProducts } from "./services";


import type { Product } from "@/types";

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const {data} = await getProducts(useSemanticSearch, debouncedSearch);
        setProducts(data);
      } catch (error) {
        toast.error("Failed to fetch products.");
        console.error(error);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [debouncedSearch, useSemanticSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-800">Browse Products</h1>

      <div>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Search by title"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg shadow-inner focus:outline-none focus:border-green-500"
        />
      </div>

      <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <label
          htmlFor="use-semantic-search"
          className="text-gray-800 font-medium cursor-pointer select-none"
        >
          Use Semantic Search
        </label>
        <input
          id="use-semantic-search"
          type="checkbox"
          onChange={e => setUseSemanticSearch(e.target.checked)}
          className="h-5 w-5 accent-green-600 cursor-pointer rounded-md border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
        />
      </div>

      <div
        className={`${
          loading && "opacity-50"
        } grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8`}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-500">
          {loading ? "Loading..." : "No products found."}
        </p>
      )}
    </div>
  );
}
