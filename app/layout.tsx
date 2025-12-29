import type { Metadata } from "next";
import { Assistant, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";

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
                {children}
            </body>
        </html>
    );
}
