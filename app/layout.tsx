import type { Metadata } from "next";
import "./globals.css";
import { ApiProvider } from "@/hooks/ApiProvider";
import { HabitTrackerThemeProvider } from "@/hooks/ThemeProvider";
import { KeycloakProvider } from "@/hooks/KeycloakProvider";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track and manage your daily habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HabitTrackerThemeProvider>
          <KeycloakProvider>
            <ApiProvider>{children}</ApiProvider>
          </KeycloakProvider>
        </HabitTrackerThemeProvider>
      </body>
    </html>
  );
}
