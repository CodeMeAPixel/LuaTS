import "@/styles/globals.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "katex/dist/katex.css";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LuaTS",
    default: "A TypeScript library for parsing, formatting, and providing type interfaces for Lua and Luau code.",
  },
  icons: {
    icon: "https://luats.lol/logo.svg",
    shortcut: "https://luats.lol/logo.svg",
    apple: "https://luats.lol/logo.svg",
  },
  openGraph: {
    title: "LuaTS - A TypeScript library for parsing, formatting, and providing type interfaces for Lua and Luau code.",
    url: "https://luats.lol",
    siteName: "LuaTS | Docs",
    images: {
      url: "https://luats.lol/banner.png",
      width: 1200,
      height: 630,
      alt: "LuaTS - A TypeScript library for parsing, formatting, and providing type interfaces for Lua and Luau code.",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#fff" },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.className} dark`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
