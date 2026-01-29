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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/chatbot/chatbot-style.css" />
      </head>
      <body className={`${outfit.variable} ${inter.variable}`}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
        {/* Chatbot Integration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.HOOP_CHAT_OPTIONS = {
                chatEndpoint: 'https://hoopcasting.com/php_backend/api/chatbot/chat.php',
                historyEndpoint: 'https://hoopcasting.com/php_backend/api/chatbot/get_history.php',
                logoUrl: '/logo.png',
                title: 'Hoop Casting Assistant',
                primaryColor: '#ff4757'
              };
            `,
          }}
        />
        <script src="/chatbot/chatbot-loader.js" defer></script>
      </body>
    </html>
  );
}
