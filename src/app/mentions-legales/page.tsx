import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales">
      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
        Les champs marqués [À compléter] doivent être remplis avant toute mise en production réelle — ce sont des
        informations personnelles que je ne peux pas deviner à ta place.
      </p>

      <h2>Éditeur du site</h2>
      <p>
        Ce site est édité à titre personnel et non professionnel par [À compléter — ton nom complet].
        <br />
        Adresse : [À compléter — ton adresse, ou une adresse de correspondance]
        <br />
        Email de contact : [À compléter — voir aussi la page Contact]
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
