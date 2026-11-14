import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { ToastProvider } from "@/components/common/toast";
import { StoreProvider } from "@/context/store";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} font-sans antialiased`}
    >
      <body>
        <ThemeProvider>
          <StoreProvider>
            <ToastProvider>{children}</ToastProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
