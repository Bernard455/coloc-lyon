import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Conditions générales d'utilisation" };

export default function CGUPage() {
  return (
    <LegalLayout title="Conditions générales d'utilisation">
      <h2>Objet</h2>
      <p>
        Ce site permet à ses utilisateurs de centraliser, comparer et partager des logements qu'ils ont trouvés sur
        d'autres plateformes, ainsi que d'ajouter leurs propres découvertes. Il n'agrège pas automatiquement le
        contenu de plateformes tierces sans autorisation — voir la page dédiée aux sources de données.
      </p>

      <h2>Compte utilisateur</h2>
      <p>
        La connexion se fait via Google. En te connectant, tu confirmes avoir l'autorisation d'utiliser l'adresse
        email associée à ce compte.
      </p>

      <h2>Contenu ajouté par les utilisateurs</h2>
      <p>En ajoutant une annonce, tu t'engages à :</p>
      <ul className="list-disc pl-5">
        <li>fournir des informations exactes et à jour, dans la mesure de tes connaissances</li>
        <li>ne pas republier en masse le contenu d'un site tiers en violation de ses conditions d'utilisation</li>
        <li>ne pas publier de contenu illégal, trompeur, diffamatoire ou frauduleux</li>
      </ul>
      <p>
        Le site se réserve le droit de retirer toute annonce ou tout compte ne respectant pas ces règles.
      </p>

      <h2>Groupes privés</h2>
      <p>
        Le créateur d'un groupe en est responsable. Les membres invités peuvent ajouter et retirer des favoris
        partagés au sein du groupe. Chaque membre peut quitter un groupe à tout moment.
      </p>

      <h2>Absence de garantie</h2>
      <p>
        Les informations affichées (prix, disponibilité, caractéristiques) proviennent de tiers ou de saisies
        manuelles et peuvent être inexactes ou obsolètes. Toute décision de location doit être vérifiée directement
        auprès du propriétaire ou de l'agence concernée.
      </p>

      <h2>Modification des présentes conditions</h2>
      <p>
        Ces conditions peuvent être mises à jour à tout moment. La date de dernière mise à jour est indiquée sur la
        page Politique de confidentialité.
      </p>
    </LegalLayout>
  );
}
