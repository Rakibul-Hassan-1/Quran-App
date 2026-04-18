import { SettingsProvider } from "@/app/context/SettingsContext";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quran - Read the Holy Quran",
  description:
    "Read the Quran with Arabic text, translations, and search functionality",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
