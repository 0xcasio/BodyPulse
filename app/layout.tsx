import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/navigation/NavBar";

export const metadata: Metadata = {
  title: "Body Pulse",
  description: "Understand your body composition with AI-powered insights",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="min-h-screen overflow-x-hidden">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
