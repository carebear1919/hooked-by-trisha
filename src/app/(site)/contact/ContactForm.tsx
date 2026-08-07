"use client";

import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";
import { submitContactForm } from "./actions";

const FAQS = [
  {
    question: "How long does shipping take?",
    answer:
      "For in-stock items, orders are typically processed and shipped within 3-5 business days. Custom pieces vary by complexity and current waitlist, usually ranging from 2-4 weeks. All packages are sent via carbon-neutral shipping.",
  },
  {
    question: "Do you accept custom orders?",
    answer:
      "Yes, I love creating unique pieces tailored to your space or style. Please reach out via the contact form with your vision, and we can discuss yarn choices, sizing, and pricing for your bespoke heirloom.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Because each piece is handmade with care, returns are accepted within 14 days of receipt for store credit or exchange only. Items must be in their original, unused condition.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept GCash, BPI online bank transfer, and Card payments (Visa/Mastercard) securely processed via PayMongo. For larger custom commissions, we also offer flexible payment plans — simply ask about them in your inquiry.",
  },
];

const SOCIAL_PATHS: Record<string, string> = {
  Instagram:
    "M12 2c-2.72 0-3.06.01-4.12.06-1.06.05-1.78.22-2.41.46a4.87 4.87 0 0 0-1.76 1.15A4.87 4.87 0 0 0 2.52 5.43c-.24.63-.41 1.35-.46 2.41C2.01 8.9 2 9.24 2 12s.01 3.1.06 4.16c.05 1.06.22 1.78.46 2.41.25.65.6 1.2 1.15 1.76.55.55 1.11.9 1.76 1.15.63.24 1.35.41 2.41.46C8.94 22 9.28 22 12 22s3.06-.01 4.12-.06c1.06-.05 1.78-.22 2.41-.46a4.87 4.87 0 0 0 1.76-1.15c.55-.55.9-1.11 1.15-1.76.24-.63.41-1.35.46-2.41.05-1.06.06-1.4.06-4.16s-.01-3.1-.06-4.16c-.05-1.06-.22-1.78-.46-2.41a4.87 4.87 0 0 0-1.15-1.76A4.87 4.87 0 0 0 18.94 2.5c-.63-.24-1.35-.41-2.41-.46C15.47 2.01 15.13 2 12.37 2Zm0 1.8c2.67 0 2.99.01 4.04.06.98.04 1.5.2 1.86.34.47.18.8.4 1.15.75.35.35.57.68.75 1.15.14.36.3.88.34 1.86.05 1.05.06 1.37.06 4.04s-.01 2.99-.06 4.04c-.04.98-.2 1.5-.34 1.86-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.36.14-.88.3-1.86.34-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06c-.98-.04-1.5-.2-1.86-.34a3.1 3.1 0 0 1-1.15-.75 3.1 3.1 0 0 1-.75-1.15c-.14-.36-.3-.88-.34-1.86C3.81 14.99 3.8 14.67 3.8 12s.01-2.99.06-4.04c.04-.98.2-1.5.34-1.86.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.36-.14.88-.3 1.86-.34C9.01 3.81 9.33 3.8 12 3.8Zm0 3.05a5.15 5.15 0 1 0 0 10.3 5.15 5.15 0 0 0 0-10.3Zm0 8.5a3.35 3.35 0 1 1 0-6.7 3.35 3.35 0 0 1 0 6.7Zm5.35-8.7a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z",
  Facebook:
    "M13.5 21v-7.75h2.6l.39-3.02h-3v-1.93c0-.87.24-1.47 1.5-1.47H16.6V3.63C16.3 3.59 15.3 3.5 14.13 3.5c-2.44 0-4.11 1.49-4.11 4.22v2.35H7.4v3.02h2.62V21h3.48Z",
  TikTok: "M16.6 2h-3.2v13.3a2.9 2.9 0 1 1-2.06-2.78v-3.3a6.1 6.1 0 1 0 5.26 6.05V8.9a7.5 7.5 0 0 0 4.4 1.4V7.1a4.3 4.3 0 0 1-4.4-4.1V2Z",
};

export default function ContactForm({
  contactEmail,
  socialLinks,
}: {
  contactEmail: string;
  socialLinks: { href: string; label: string }[];
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await submitContactForm({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        message: String(formData.get("message") ?? ""),
      });
      setSubmitted(true);
      toast("Message sent!", "success");
    } catch {
      setError("Something went wrong sending your message. Please try again.");
      toast("Something went wrong sending your message.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Page Header */}
      <section className="max-w-[1280px] mx-auto px-container-padding pt-16 md:pt-24 text-center">
        <h1 className="font-headline text-headline-lg md:text-display-lg text-primary mb-4">Get in Touch</h1>
        <p className="font-body text-body-lg text-on-surface-variant max-w-xl mx-auto">
          Whether you&apos;re curious about a piece, seeking a custom heirloom, or just want to share your creative
          journey, I&apos;d love to hear from you.
        </p>
      </section>

      {/* Contact Two-Column Layout */}
      <section className="max-w-[1280px] mx-auto px-container-padding py-section-gap grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Left: Contact Form */}
        <div className="md:col-span-7 bg-surface-container-low p-8 md:p-12 rounded-xl shadow-sm border border-surface-variant/30">
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-12">
              <span className="material-symbols-outlined text-primary text-5xl" aria-hidden>
                check_circle
              </span>
              <h2 className="font-headline text-headline-sm text-primary">Message Sent!</h2>
              <p className="font-body text-body-md text-on-surface-variant max-w-sm">
                Thank you for reaching out — we&apos;ll get back to you as soon as we can.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 font-body text-label-md text-primary underline underline-offset-2 hover:opacity-80"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="name" className="block font-body text-label-md text-on-surface-variant uppercase">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full bg-surface px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-primary-container transition-all placeholder:text-on-surface-variant/40"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block font-body text-label-md text-on-surface-variant uppercase">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="hello@example.com"
                  className="w-full bg-surface px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-primary-container transition-all placeholder:text-on-surface-variant/40"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="block font-body text-label-md text-on-surface-variant uppercase">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="How can I help you today?"
                  className="w-full bg-surface px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-primary-container transition-all placeholder:text-on-surface-variant/40 resize-none"
                />
              </div>
              {error && <p className="font-body text-label-md text-error">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-10 py-4 bg-primary-container text-on-primary-container rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>

        {/* Right: Info Card & Visuals */}
        <div className="md:col-span-5 flex flex-col gap-8">
          <div className="bg-secondary-container p-8 rounded-xl flex flex-col gap-6">
            <h2 className="font-headline text-headline-sm text-primary">Connection Details</h2>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary-container" aria-hidden>
                mail
              </span>
              <div>
                <p className="font-body text-label-md text-on-secondary-container uppercase">Email</p>
                <a
                  className="font-body text-body-md hover:text-primary-container transition-colors"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </a>
              </div>
            </div>
            {socialLinks.length > 0 && (
              <div className="space-y-4">
                <p className="font-body text-label-md text-on-secondary-container uppercase">Social Media</p>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-surface transition-all duration-300"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                        <path d={SOCIAL_PATHS[social.label]} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Decorative Image */}
          <div className="relative rounded-xl overflow-hidden aspect-4/3 shadow-sm">
            <Image
              className="object-cover"
              alt="Organic cotton yarn in sage and cream tones resting next to polished wooden crochet hooks on a linen surface."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlYqumj7CkgZumsbsNJg8ctI4JaIiA_kfLrx0ZJGGqHr1N-hkR2cKf8B1K_WN8NXXkS8-nkbDMcFZOau1unsxXBsnpXbhVsabSokYWbGRfrl9NxX5uiIO1hzOtCU5xWOuqDsmEv-ieAP3zqcFVqtZ9kslDeu8Dg-u762ApPwgfpwCvv4KzKVQ4rmqotUWNEuuhcwwLP20wyHdyi4JXK0vIVsDmu--rRzPYqhmFT5Y1T_I4wf8GG5u5XbxsyWI59v0_pRFOBiEHhpA"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-[1280px] mx-auto px-container-padding py-section-gap">
        <div className="text-center mb-16">
          <h2 className="font-headline text-headline-md text-primary mb-2">Common Questions</h2>
          <div aria-hidden className="w-12 h-0.5 bg-primary-container mx-auto" />
        </div>
        <div className="max-w-3xl mx-auto space-y-2">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={faq.question} className="border-b border-surface-container-highest">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex justify-between items-center gap-4 py-6 text-left group"
                >
                  <h3 className="font-headline text-[20px] text-on-surface group-hover:text-primary transition-colors">
                    {faq.question}
                  </h3>
                  <span
                    className={`material-symbols-outlined shrink-0 transition-transform duration-300 text-on-surface-variant ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <p className="font-body text-body-md text-on-surface-variant pb-6 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
