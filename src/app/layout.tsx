import type { Metadata } from "next";
import { Nunito, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Linux Quiz Master",
  description: "Test your Linux knowledge with interactive quizzes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${nunito.variable} ${sourceCodePro.variable} font-sans antialiased text-slate-100 min-h-screen`}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </body>
    </html>
  );
}
