"use client";

import Link from "next/link";
import { useEffect } from "react";

export interface ToastState {
  message: string;
  href?: string;
  linkLabel?: string;
}

/**
 * Notification de confirmation en bas d'écran, cliquable si `href` est
 * fourni (ex: "Ajouté aux favoris → Voir mes favoris"). Se ferme seule
 * après quelques secondes.
 */
export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const content = (
    <div className="flex items-center gap-3 rounded-full bg-gray-900 px-5 py-3 text-sm text-white shadow-cardHover dark:bg-gray-100 dark:text-gray-900">
      <span>{toast.message}</span>
      {toast.href && <span className="font-semibold underline">{toast.linkLabel ?? "Voir →"}</span>}
    </div>
  );

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fadeIn">
      {toast.href ? (
        <Link href={toast.href} onClick={onDismiss}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
