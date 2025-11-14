"use client";

import { toast } from "react-hot-toast";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteProduct } from "@/app/services";

interface Props {
  id: string;
}

export default function DeleteButton({ id }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!password.trim()) {
      toast.error("Password is required to delete product");
      return;
    }

    try {
      await deleteProduct(id, password);
      toast.success("Product deleted successfully");
      startTransition(() => {
        router.refresh();
        router.push("/");
      });
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    }
  };

  return (
    <>
      <div className="mt-8">
        <label htmlFor="password" className="block">
          Admin Password to delete item
        </label>
        <input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        onClick={handleDelete}
        className="mt-4 w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200"
      >
        Delete
      </button>
    </>
  );
}
