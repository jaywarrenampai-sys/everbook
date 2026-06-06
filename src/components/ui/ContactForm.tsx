"use client";

import { useState } from "react";
import { contact } from "@/lib/content";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO Session 6+: wire to a real backend / email service
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-stone-800">{contact.form.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        required
        placeholder={contact.form.namePlaceholder}
        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
      />
      <input
        type="email"
        required
        placeholder={contact.form.emailPlaceholder}
        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
      />
      <textarea
        required
        rows={4}
        placeholder={contact.form.messagePlaceholder}
        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
      />
      <button
        type="submit"
        className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 rounded-full transition-colors"
      >
        {contact.form.submit}
      </button>
    </form>
  );
}
