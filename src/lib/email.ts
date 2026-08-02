/**
 * Envoi d'email via Resend (https://resend.com) — appel HTTP direct plutôt
 * que leur SDK, pour éviter une dépendance supplémentaire.
 *
 * Fonctionne "à vide" (log console, pas d'erreur) si RESEND_API_KEY n'est
 * pas configuré, pour que le site continue de fonctionner (le message
 * reste enregistré en base) même sans email configuré.
 */

interface ContactNotificationInput {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactNotification(input: ContactNotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    console.log("[email] RESEND_API_KEY ou CONTACT_NOTIFICATION_EMAIL non configuré — email non envoyé (message quand même enregistré en base).");
    return;
  }

  // onboarding@resend.dev fonctionne sans vérification de domaine — pratique
  // pour démarrer. Une fois un domaine vérifié sur Resend, remplacer
  // EMAIL_FROM par une adresse sur ce domaine (ex: contact@ton-domaine.fr).
  const from = process.env.EMAIL_FROM || "Comparo <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email, // répondre directement à la personne depuis ta messagerie habituelle
        subject: `[Comparo] ${input.subject} — ${input.firstName} ${input.lastName}`,
        text: `${input.message}\n\n---\nDe : ${input.firstName} ${input.lastName} <${input.email}>`
      })
    });

    if (!res.ok) {
      console.error("[email] Échec de l'envoi Resend :", await res.text());
    }
  } catch (err) {
    console.error("[email] Erreur réseau lors de l'envoi", err);
  }
}
