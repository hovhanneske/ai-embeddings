import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-green-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          E-Commerce Search
        </Link>
        <nav>
          <Link href="/admin/add" className="ml-4 hover:underline">
            Add Product
          </Link>
        </nav>
      </div>
    </header>
  );
}