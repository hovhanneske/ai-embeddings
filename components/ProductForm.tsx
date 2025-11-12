"use client";

import { toast } from "react-hot-toast";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useParams } from "next/navigation";

import { ProductFormState } from "@/types";

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormState>({
    title: "",
    description: "",
    price: "",
    image: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    if (isLoading) return;
    e.preventDefault();
    const success = await handleFormSubmission(formData);

    if (success) {
      setFormData({ title: "", description: "", price: "", image: "" });
    }
  };

  const handleFormSubmission = async (formData: ProductFormState) => {
    setIsLoading(true);
    setMessage("Submitting...");

    const payload = {
      ...formData,
      id: Number(id),
      price: parseFloat(formData.price),
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsLoading(false);

    if (res.ok) {
      const message = `Product ${id ? "edited" : "added"} successfully!`;
      toast.success(message);
      setMessage(message);
      return true;
    } else {
      const message = `Failed to ${
        id ? "edit" : "add"
      } product. Please try again.`;
      toast.error(message);
      setMessage(message);
      return false;
    }
  };

  useEffect(() => {
    if (!id) return;

    const getProductData = async () => {
      try {
        const response = await fetch(`/api/products?id=${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.title || "",
            description: data.description || "",
            price: data.price ? data.price.toString() : "",
            image: data.image || "",
          });
        } else {
          toast.error("Failed to fetch product data");
        }
      } catch (error) {
        toast.error("Error fetching product data");
        console.error(error);
      }
    };
    getProductData();
  }, [id]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {id ? "Edit Pruduct" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Product Title</span>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Description</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Price ($)</span>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Image URL / Path</span>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <button
          disabled={isLoading}
          type="submit"
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200"
        >
          {id ? "Save Changes" : "Submit Product"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center font-medium ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
