import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Prathmik Kumarshala - School Management System",
  description: "Modern school management system with admin and student portals",
  manifest: '/manifest',
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "32x32" },
      { url: "/favicon.png?v=3", type: "image/png" },
    ],
    apple: [{ url: "/logo.jpeg?v=3" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=3" />
        <link rel="icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.jpeg?v=3" />
      </head>
      <body className={poppins.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
