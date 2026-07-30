"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-sm text-gray-400">…</span>;
  }

  if (session?.user) {
    return (
      <button onClick={() => signOut()} className="btn-secondary flex items-center gap-2 text-sm">
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="h-5 w-5 rounded-full" />
        )}
        {session.user.name || session.user.email} · Déconnexion
      </button>
    );
  }

  return (
    <button onClick={() => signIn("google")} className="btn-primary text-sm">
      Se connecter avec Google
    </button>
  );
}
