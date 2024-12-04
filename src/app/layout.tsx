import type { Metadata } from "next";
import Head from "next/head";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Today Notes",
  description:
    "Today Notes is a lightweight, daily task management web application built with Next.js, React, TailwindCSS, Prisma, and SQLite. It features task expiration, light/dark modes, real-time notifications, and more for a seamless user experience.",
  keywords:
    "task management, daily tasks, task app, nextjs, react, tailwindcss, prisma, sqlite, task reminders, light/dark mode, optimistic UI, toast notifications, frontend development, full-stack development, web application, task tracker, productivity app, react hooks, web app design, real-time notifications, next.js project",
  authors: [{ name: "Keyyard" }],
};

export const viewport =
  "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <Head>
        {/* Web App Meta Tags */}
        <meta name="viewport" content={viewport} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Today Notes" />
        {/* Light theme status bar */}
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/120.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/76.png" />
        {/* Splash Screen */}
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
