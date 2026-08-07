"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/newsletter-actions";
import { useToast } from "@/lib/toast-context";

export default function NewsletterForm({
  idPrefix,
  inputClassName,
  buttonClassName,
  formClassName,
}: {
  idPrefix: string;
  inputClassName: string;
  buttonClassName: string;
  formClassName: string;
}) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const inputId = `${idPrefix}-newsletter-email`;

  return (
    <form
      className={formClassName}
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting) return;
        const form = e.currentTarget;
        const email = String(new FormData(form).get("email") ?? "");
        setSubmitting(true);
        try {
          const result = await subscribeNewsletter(email);
          toast(result.message, result.ok ? "success" : "error");
          if (result.ok) form.reset();
        } catch {
          toast("Something went wrong. Please try again.", "error");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        name="email"
        type="email"
        required
        placeholder="Enter your email"
        className={inputClassName}
      />
      <button type="submit" disabled={submitting} className={`${buttonClassName} disabled:opacity-60`}>
        {submitting ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
