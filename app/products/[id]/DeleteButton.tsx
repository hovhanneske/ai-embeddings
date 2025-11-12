"use client"

import {toast} from "react-hot-toast";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
}

export default function DeleteButton({ id }: Props) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const handleDelete = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/products?id=${id}`, {
            method: "DELETE",
          });
          if(response.ok) {
            toast.success("Product deleted successfully");
            startTransition(() => {
              router.refresh();
              router.push("/");
            });
          } else {
            toast.error("Failed to delete product");
          }
        } catch (error) {
          toast.error("Error deleting product");
          console.error(error);
        }
      };

    return (
        <button onClick={handleDelete} className="mt-8 w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200">
          Delete
        </button>
    )
}