"use client";

import { useState } from "react";
import { ProductFormState } from "@/types";
import ProductForm from "@/components/ProductForm"; // Import the new component

export default function AdminAddProductPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmission = async (formData: ProductFormState) => {
    setIsLoading(true);
    setMessage("Submitting...");
    
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsLoading(false);

    if (res.ok) {
      setMessage("Product added successfully!");
      return true; // Indicate success to the child component
    } else {
      setMessage("Failed to add product. Please try again.");
      return false; // Indicate failure
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Product (Admin)</h1>
      
      <ProductForm 
        onSubmit={handleFormSubmission} 
        isLoading={isLoading} 
      />

      {message && (
        <p className={`mt-4 text-center font-medium ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}