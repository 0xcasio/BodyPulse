import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/navigation/NavBar";

export const metadata: Metadata = {
  title: "InBody Scan Analyzer",
  description: "Understand your body composition with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
