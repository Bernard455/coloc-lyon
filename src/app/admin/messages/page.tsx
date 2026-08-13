"use client";

import { useEffect, useState } from "react";

interface Message {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  function load() {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateMessage(id: string, patch: Partial<Message>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    await fetch(`/api/admin/messages/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  }

  const visible = messages.filter((m) => (showArchived ? m.archived : !m.archived));
  const unreadCount = messages.filter((m) => !m.read && !m.archived).length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à l'accueil</a>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          📬 Messages {unreadCount > 0 && <span className="badge badge-warning ml-2">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</span>}
        </h1>
        <div className="flex overflow-hidden rounded-full border border-gray-200 text-sm dark:border-gray-700">
          <button onClick={() => setShowArchived(false)} className={`px-4 py-1.5 ${!showArchived ? "bg-brand-500 text-white" : ""}`}>Boîte de réception</button>
          <button onClick={() => setShowArchived(true)} className={`px-4 py-1.5 ${showArchived ? "bg-brand-500 text-white" : ""}`}>Archivés</button>
        </div>
      </div>

      {loading && <p className="text-gray-500">Chargement…</p>}
      {!loading && visible.length === 0 && (
        <p className="text-gray-500">{showArchived ? "Aucun message archivé." : "Aucun message pour l'instant."}</p>
      )}

      <div className="space-y-3">
        {visible.map((m) => (
          <div key={m.id} className={`card p-4 ${!m.read && !m.archived ? "border-brand-300 dark:border-brand-700" : ""}`}>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {m.firstName} {m.lastName} · <span className="text-gray-500">{m.subject}</span>
                </p>
                <p className="text-xs text-gray-400">
                  <a href={`mailto:${m.email}`} className="underline">{m.email}</a> ·{" "}
                  {new Date(m.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="flex gap-2">
                {!m.archived && (
                  <button onClick={() => updateMessage(m.id, { read: !m.read })} className="btn-secondary px-3 py-1 text-xs">
                    {m.read ? "Marquer non lu" : "Marquer lu"}
                  </button>
                )}
                <button onClick={() => updateMessage(m.id, { archived: !m.archived })} className="btn-secondary px-3 py-1 text-xs">
                  {m.archived ? "Désarchiver" : "Archiver"}
                </button>
              </div>
            </div>
            <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">{m.message}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
