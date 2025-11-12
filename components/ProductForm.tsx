"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { ProductFormState } from "@/types";

interface ProductFormProps {
  onSubmit: (data: ProductFormState) => Promise<boolean>;
  isLoading: boolean;
}

export default function ProductForm({ onSubmit, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormState>({ title: "", description: "", price: "", image: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);

    if (success) {
      // Clear form only on successful submission from parent
      setFormData({ title: "", description: "", price: "", image: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Product Title</span>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" />
        </label>
        
        <label className="block">
          <span className="text-gray-700">Description</span>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
        </label>
        
        <label className="block">
          <span className="text-gray-700">Price ($)</span>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" />
        </label>
        
        <label className="block">
          <span className="text-gray-700">Image URL / Path</span>
          <input type="text" name="image" value={formData.image} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" />
        </label>

        <button type="submit" className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200">
          Submit Product
        </button>
      </form>
  );
}