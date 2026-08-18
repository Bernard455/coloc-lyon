import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { getSiteContent } from "@/lib/siteContent";

export const metadata: Metadata = { title: "Mentions légales" };

// Cette page lit désormais des données en base (coordonnées éditables
// depuis /admin/contenu) : on force le rendu dynamique pour ne jamais
// servir une version mise en cache et périmée après une modification admin.
export const dynamic = "force-dynamic";

export default async function MentionsLegalesPage() {
  const content = await getSiteContent();
  const isIncomplete = !content.ownerName || !content.ownerAddress || !content.ownerEmail;

  return (
    <LegalLayout title="Mentions légales">
      {isIncomplete && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Certains champs ci-dessous sont encore [À compléter] — renseigne-les depuis{" "}
          <a href="/admin/contenu" className="underline">/admin/contenu</a> avant toute mise en production réelle.
        </p>
      )}
      <h2>Éditeur du site</h2>
      <p>
        Ce site est édité à titre personnel et non professionnel par {content.ownerName || "[À compléter — ton nom complet]"}.
        <br />
        Adresse : {content.ownerAddress || "[À compléter — ton adresse, ou une adresse de correspondance]"}
        <br />
        Email de contact : {content.ownerEmail || "[À compléter — voir aussi la page Contact]"}
        {content.ownerPhone && (
          <>
            <br />
            Téléphone : {content.ownerPhone}
          </>
        )}
      </p>
      <h2>Hébergement</h2>
      <p>
        Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
        <br />
        La base de données est hébergée par Neon Inc.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        La structure et le code de ce site sont la propriété de son éditeur. Les annonces affichées proviennent soit
        de saisies manuelles par les utilisateurs (avec lien vers la source originale), soit de partenaires
        d'agrégation de données légalement autorisés — voir la page dédiée pour le détail des sources.
      </p>
      <h2>Responsabilité</h2>
      <p>
        Ce site centralise des informations sur des logements trouvées par ses utilisateurs sur d'autres plateformes.
        Il ne garantit pas l'exactitude, la disponibilité ou l'exhaustivité de ces informations, qui doivent être
        vérifiées directement auprès de l'annonceur ou du propriétaire avant toute décision.
      </p>
    </LegalLayout>
  );
}