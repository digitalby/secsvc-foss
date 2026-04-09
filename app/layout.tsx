import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "secsvc-foss",
  description: "1Password Connect-compatible proxy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
