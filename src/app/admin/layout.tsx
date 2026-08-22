import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "../globals.css";
import { ToastProvider } from "@/lib/toast-context";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin | Handmade Crochet Co.",
  description: "Shop management dashboard for Handmade Crochet Co.",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-surface text-on-surface">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
