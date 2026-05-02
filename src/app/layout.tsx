import type { Metadata } from "next";
import { Epilogue, Lexend, Space_Grotesk } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  style: ["normal", "italic"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pitch Elite | Football Player Bio",
  description: "High-performance link-in-bio for football players.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${epilogue.variable} ${lexend.variable} ${spaceGrotesk.variable} h-full antialiased dark`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#121414] text-[#e2e2e2]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
