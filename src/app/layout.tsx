import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ChatBot } from "@/components/chat/ChatBot";
import { MetaPixel } from "@/components/MetaPixel";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agentsurge.co"),
  title: "AgentSurge | Recruiting Solutions",
  description: "Premium recruit tracking for life insurance agents",
  openGraph: {
    title: "AgentSurge | Recruiting Solutions",
    description: "Premium recruit tracking for life insurance agents",
    url: "https://agentsurge.co",
    siteName: "AgentSurge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentSurge | Recruiting Solutions",
    description: "Premium recruit tracking for life insurance agents",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <MetaPixel />
        <Providers>{children}</Providers>
        <ChatBot />
      </body>
    </html>
  );
}
