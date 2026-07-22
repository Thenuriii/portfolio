import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Portfolio", description: "Developer Portfolio Website",
};
export default function RootLayout({
  children,
}: { children: React.ReactNode; }) {
  return (<html lang="en">
    <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-co l">
      {children}
    </body>
  </html>
  );
}