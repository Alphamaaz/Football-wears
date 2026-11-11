import type { Metadata } from "next";
import { InfoDocument } from "@/components/InfoDocument";

export const metadata: Metadata = {
  title: "About Us | Football Wears",
  description: "Learn how Football Wears brings authentic football kits, retro classics, and pro match gear to players and fans.",
};

export default function AboutPage() {
  return (
    <InfoDocument
      source="about.md"
      label="About Football Wears"
      summary="A dedicated personal football shop created by a kit collector and player to bring authentic 2024/25 jerseys, retro classics, and pro boots directly to you."
    />
  );
}
