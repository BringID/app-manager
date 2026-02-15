import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Score Explorer | BringID App Manager",
};

export default function ScoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
