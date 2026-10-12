"use client";

import { useEffect, useState } from "react";
import { ROLES, ROLE_LABELS, type AppRole } from "@/lib/roles";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  createdAt: string;
  isEnvAdmin: boolean;
}

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users ?? []);
        setCurrentUserId(data.currentUserId ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(userId: string, role: AppRole) {
    setSavingId(userId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Une erreur est survenue." });
      } else {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
        setMessage({ type: "ok", text: "Rôle mis à jour." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau, réessaie dans un instant." });
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-500">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-2 text-2xl font-bold">👤 Utilisateurs et rôles</h1>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Un utilisateur doit s'être connecté au moins une fois pour apparaître dans cette liste. Les changements
        sont appliqués immédiatement.
      </p>

      <div className="card mb-6 space-y-1 p-4 text-sm">
        <p><span className="font-semibold">Administrateur</span> : accès complet (contenu du site, synchronisation, rôles, messages, annonces).</p>
        <p><span className="font-semibold">Modérateur</span> : messages et ajout d'annonces uniquement.</p>
        <p><span className="font-semibold">Utilisateur</span> : aucun accès à l'espace admin.</p>
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
      )}

      {users.length === 0 && <p className="text-sm text-gray-400">Aucun utilisateur pour l'instant.</p>}

      <div className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const locked = isSelf || user.isEnvAdmin;
          return (
            <div key={user.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name || "Sans nom"}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {isSelf && <span className="badge badge-success">C'est toi</span>}
                  {user.isEnvAdmin && <span className="badge badge-warning">Admin via ADMIN_EMAILS</span>}
                </div>
              </div>
              <select
                value={user.isEnvAdmin ? "ADMIN" : user.role}
                disabled={locked || savingId === user.id}
                onChange={(e) => changeRole(user.id, e.target.value as AppRole)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </main>
  );
}