import type { Metadata } from "next";
import { Assistant, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NextTopLoader from 'nextjs-toploader';

const assistant = Assistant({
    subsets: ["hebrew", "latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    variable: "--font-assistant",
});

const frankRuhl = Frank_Ruhl_Libre({
    subsets: ["hebrew", "latin"],
    weight: ["300", "400", "500", "700", "900"],
    variable: "--font-serif",
});

export const metadata: Metadata = {
    title: "שורשים - ארכיון משפחתי",
    description: "שימור המורשת והסיפור המשפחתי לדורות הבאים",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="he" dir="rtl" className={`${assistant.variable} ${frankRuhl.variable}`}>
            <body className="antialiased font-assistant bg-stone-50 text-stone-900">
                <NextTopLoader
                    color="#1a365d"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px #1a365d,0 0 5px #1a365d"
                />
                <Navbar />
                {children}
            </body>
        </html>
    );
}
