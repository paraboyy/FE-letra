import type { Metadata } from "next";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Letra Studio",
    default: "Letra Studio — Premium Photography Studio",
  },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
