import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Hoop Casting - Not Just Another Casting Platform",
  description: "Hoop Casting is an open casting platform for: Actors, Models, Performers, Fresh faces, and Real people with real presence.",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.variable}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>

        {/* Chatbot Configuration */}


        {/* Chatbot Loader */}

      </body>
    </html>
  );
}
