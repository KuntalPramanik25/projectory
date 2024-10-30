import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

import { Toaster } from "sonner";

import { QueryProvider } from "@/components/query-provider";


const InterFont = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Projectory",
    description: "A modern touch for organized teamwork.",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body className={cn(InterFont.className, "antialiased min-h-screen")}>
                <QueryProvider>
                    <Toaster />
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}
