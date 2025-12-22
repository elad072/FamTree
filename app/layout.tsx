import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
    subsets: ["hebrew", "latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    variable: "--font-assistant",
});

export const metadata: Metadata = {
    title: "עץ משפחה - מורשת דיגיטלית",
    description: "ניהול ותצוגה של ההיסטוריה המשפחתית שלך במראה מודרני וחם",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="he" dir="rtl" className={`${assistant.variable}`}>
            <body className="antialiased font-assistant">
                {children}
            </body>
        </html>
    );
}
