"use client"

import {toast} from "react-hot-toast";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteProduct } from "@/app/services";

interface Props {
  id: string;
}

export default function DeleteButton({ id }: Props) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const handleDelete = async () => {
        try {
          await deleteProduct(id);
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
        <button onClick={handleDelete} className="mt-8 w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200">
          Delete
        </button>
    )
}