import "./globals.css";

import {Toaster} from "react-hot-toast";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({ children } : { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right"/>
        <Header />
        <main className="container mx-auto p-4 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}