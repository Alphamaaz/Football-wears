import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { ContactSupportForm } from "@/components/ContactSupportForm";

export const metadata: Metadata = {
  title: "Contact Store | Football Wears",
  description: "Get in touch with Football Wears kit specialist for size advice, jersey customization, or order updates.",
};

const SUPPORT_EMAIL = "support@footballwears.shop";

export default function ContactPage() {
  return (
    <article className="info-page contact-page">
      <div className="info-page-back">
        <Link href="/">
          <ArrowLeft /> Back to Shop
        </Link>
      </div>
      <header className="info-page-hero">
        <h1>Contact Football Wears</h1>
        <p>
          Need sizing advice, custom nameset printing, or have a question about an order? Send us a message or chat with Hamad directly on WhatsApp.
        </p>
      </header>

      <ContactSupportForm />

      <section className="contact-grid" aria-label="Contact options">
        <article className="contact-card">
          <div className="contact-card-icon">
            <MessageCircle />
          </div>
          <div>
            <p className="contact-card-label">WhatsApp Quick Chat</p>
            <h2>Instant Kit Consultation</h2>
            <p>
              Message our kit specialist directly for live photos of shirts, badge options, or custom player nameset mockups.
            </p>
            <a
              className="contact-email text-primary font-bold"
              href="https://wa.me/2348031234567?text=Hello%20Football%20Wears%2C%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
            >
              +234 803 123 4567 (WhatsApp)
            </a>
          </div>
        </article>

        <article className="contact-card">
          <div className="contact-card-icon contact-card-icon-security">
            <Mail />
          </div>
          <div>
            <p className="contact-card-label">Email Support</p>
            <h2>Orders, Exchanges &amp; Team Orders</h2>
            <p>
              For bulk team orders, size exchanges, or shipment tracking inquiries, our email support is monitored daily.
            </p>
            <a className="contact-email" href={`mailto:${SUPPORT_EMAIL}?subject=Football%20Wears%20Inquiry`}>
              {SUPPORT_EMAIL}
            </a>
          </div>
        </article>
      </section>

      <section className="contact-help">
        <div>
          <ShieldCheck />
        </div>
        <div>
          <h2>Our Promise to You</h2>
          <p>
            Every football shirt is inspected for authentic tags and stitching before dispatch. We respond to all inquiries within 2 hours during normal dispatch hours (8:00 AM – 8:00 PM West Africa Time).
          </p>
        </div>
      </section>
    </article>
  );
}
