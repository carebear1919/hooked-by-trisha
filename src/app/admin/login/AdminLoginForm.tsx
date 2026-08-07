"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function AdminLoginForm({ supportEmail }: { supportEmail: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-surface p-container-padding">
      {/* Decorative organic shape accent — allowed on this screen only */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-[43%_57%_70%_30%/30%_45%_55%_70%] bg-secondary-container blur-3xl opacity-40"
      />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-surface-container-lowest shadow-[0_16px_48px_-12px_rgba(28,28,25,0.12)] rounded-xl p-10 md:p-12 flex flex-col items-center">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span aria-hidden className="material-symbols-outlined text-primary text-2xl">
                spa
              </span>
              <span className="font-headline text-headline-sm text-primary">Hooked by Trisha</span>
            </div>
            <h1 className="font-headline text-headline-md text-on-surface mb-2">Welcome Back</h1>
            <p className="font-body text-body-md text-on-surface-variant">
              Enter your email and we&apos;ll send you a secure login link. No password needed.
            </p>
          </div>

          {status === "sent" ? (
            <div className="w-full text-center space-y-3 py-4">
              <span aria-hidden className="material-symbols-outlined text-primary text-4xl">
                mark_email_read
              </span>
              <p className="font-body text-body-md text-on-surface">
                If that email is registered, a login link is on its way. Check your inbox — it
                expires in 15 minutes.
              </p>
            </div>
          ) : (
            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="font-body text-label-md text-on-surface-variant uppercase tracking-wider"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-transparent focus:border-primary rounded-t-lg outline-none transition-all text-on-surface placeholder:text-outline-variant"
                />
              </div>

              {status === "error" && (
                <p className="text-error font-body text-label-md">
                  Something went wrong. Try again in a moment.
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-body text-label-md uppercase tracking-widest hover:opacity-90 transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
                >
                  {status === "sending" ? "Sending..." : "Send Login Link"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-surface-container w-full text-center">
            <p className="font-body text-label-md text-on-surface-variant">
              Internal use only. Need help?{" "}
              <a href={`mailto:${supportEmail}`} className="text-primary font-bold ml-1">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-on-surface-variant opacity-60">
          <p className="font-body text-[12px] uppercase tracking-[0.2em]">
            © 2026 Hooked by Trisha • Admin
          </p>
        </div>
      </div>
    </main>
  );
}
