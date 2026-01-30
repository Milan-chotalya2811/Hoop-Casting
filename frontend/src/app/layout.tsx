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
