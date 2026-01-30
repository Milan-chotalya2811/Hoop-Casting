import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Monkey Casting - Premier Talent Management",
  description: "Connect with the best talent in the industry.",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable}`}>
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
