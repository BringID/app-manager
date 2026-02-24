import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create App | BringID App Manager",
};

export default function NewAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
