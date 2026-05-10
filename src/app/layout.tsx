import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FishLog – Twój dziennik wędkarski",
    template: "%s · FishLog",
  },
  description:
    "Rejestruj wyjazdy wędkarskie, zapisuj złowione ryby, śledź statystyki. Aplikacja dla wędkarzy.",
  applicationName: "FishLog",
  authors: [{ name: "FishLog" }],
};

export const viewport: Viewport = {
  themeColor: "#1a3c34",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
