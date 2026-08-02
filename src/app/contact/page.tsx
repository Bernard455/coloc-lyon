"use client";

import { useState } from "react";

const MOTIFS = [
  "Question générale",
  "Signaler une annonce",
  "Proposer une amélioration",
  "Signaler un bug",
  "Demande de partenariat",
  "Presse",
  "Publicité",
  "Assistance technique",
  "Autre"
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message")
        })
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 text-center">
        <a href="/" className="mb-6 inline-block text-sm text-brand-600 hover:underline">← Retour à l'accueil</a>
        <p className="text-2xl">✅</p>
        <h1 className="mt-2 text-xl font-bold">Message envoyé</h1>
        <p className="mt-2 text-gray-500">Merci, ton message a bien été enregistré. On te répond dès que possible.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <a href="/" className="mb-6 inline-block text-sm text-brand-600 hover:underline">← Retour à l'accueil</a>
      <h1 className="mb-2 text-2xl font-bold">Nous contacter</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Une question, un bug à signaler, une annonce suspecte ? Écris-nous.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm font-medium">
            Prénom *
            <input name="firstName" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>
          <label className="text-sm font-medium">
            Nom *
            <input name="lastName" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>
        </div>

        <label className="block text-sm font-medium">
          Email *
          <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </label>

        <label className="block text-sm font-medium">
          Motif *
          <select name="subject" required defaultValue="" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
            <option value="" disabled>Choisir un motif</option>
            {MOTIFS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Message *
          <textarea name="message" required rows={5} minLength={10} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </label>

        <p className="text-xs text-gray-400">
          En envoyant ce message, tu acceptes notre{" "}
          <a href="/confidentialite" className="underline">politique de confidentialité</a>.
        </p>

        {status === "error" && <p className="text-sm text-red-600">Une erreur est survenue, réessaie dans un instant.</p>}

        <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:opacity-60">
          {status === "sending" ? "Envoi…" : "Envoyer"}
        </button>
      </form>
    </main>
  );
}
