"use client";

import { toast } from "react-hot-toast";

import Link from "next/link";
import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useParams } from "next/navigation";

import { ProductFormInput } from "./input/input";

import { createOrEditProduct, getProductById } from "@/app/services";

import { ProductFormState } from "@/types";

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormState>({
    title: "",
    description: "",
    price: "",
    image: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams<{ id: string }>();

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
      setFormData({
        title: "",
        description: "",
        price: "",
        image: "",
        password: "",
      });
    }
  };

  const handleFormSubmission = async (formData: ProductFormState) => {
    setIsLoading(true);
    setMessage("Submitting...");

    try {
      await createOrEditProduct(formData, id);
      const message = `Product ${id ? "edited" : "added"} successfully!`;
      toast.success(message);
      setMessage(message);
      return true;
    } catch (error) {
      console.log(error);
      const message = `Failed to ${
        id ? "edit" : "add"
      } product. Please try again.`;
      toast.error(message);
      setMessage(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const getProductData = async () => {
      try {
        const { data } = await getProductById(Number(id));
        setFormData({ ...data.product, password: "" });
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch product data");
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
        <ProductFormInput
          label="Product Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <ProductFormInput
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          isTextarea
        />

        <ProductFormInput
          label="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          type="number"
          required
        />

        <ProductFormInput
          label="Image URL"
          name="image"
          value={formData.image}
          onChange={handleChange}
          required
        />

        <ProductFormInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          type="password"
        />

        <button
          disabled={isLoading}
          type="submit"
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200"
        >
          {id ? "Save Changes" : "Submit Product"}
        </button>

        <Link
          href="/"
          className="flex justify-center w-full py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Cancel
        </Link>
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
