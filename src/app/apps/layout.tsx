import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Apps | BringID App Manager",
};

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
