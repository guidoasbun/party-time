import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import { WebVitalsReporter } from "@/components/analytics/WebVitalsReporter";
import { AnalyticsWrapper } from "@/components/analytics/AnalyticsWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Party-Time",
  description: "Event planning made easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WebVitalsReporter />
        <ThemeProvider defaultTheme="system" storageKey="party-time-theme">
          <QueryProvider>
            <AuthProvider>
              <KeyboardShortcutsProvider>
                <AnalyticsWrapper>{children}</AnalyticsWrapper>
              </KeyboardShortcutsProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
