import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { MeetingsProvider } from "@/components/providers/MeetingsProvider";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "Zoom Workplace Clone",
  description: "A clone of the Zoom web client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} font-sans antialiased`}>
        <MeetingsProvider>{children}</MeetingsProvider>
      </body>
    </html>
  );
}
