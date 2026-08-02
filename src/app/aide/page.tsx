import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Aide & FAQ" };

const FAQ = [
  {
    q: "Comment ajouter une annonce que j'ai trouvée sur LeBonCoin ou PAP ?",
    a: "Depuis l'accueil, clique sur \"Ajouter une annonce\". Recopie les infos et colle le lien vers l'annonce originale — l'adresse est localisée automatiquement, et un score qualité est calculé."
  },
  {
    q: "Le site va-t-il chercher les annonces tout seul ?",
    a: "Pas depuis les grandes plateformes (LeBonCoin, SeLoger…) — leurs conditions d'utilisation l'interdisent. Le site centralise ce que toi et ton groupe ajoutez, plus d'éventuelles sources partenaires légales."
  },
  {
    q: "Comment fonctionne un groupe privé ?",
    a: "Crée un groupe depuis \"Groupes\", partage le code d'invitation à tes futurs colocataires. Chacun peut ensuite partager ses favoris dans le groupe, avec une note, et vous comparez ensemble."
  },
  {
    q: "Qu'est-ce que le badge \"Compatible N colocataires\" ?",
    a: "Il indique si un logement de N-1 chambres a un espace (salon, pièce supplémentaire) pouvant accueillir un colocataire de plus, selon les infos que tu as renseignées."
  },
  {
    q: "Comment fonctionne le score qualité ?",
    a: "Calculé automatiquement à partir du prix par rapport au marché local, du type de logement, des transports, du DPE, du quartier et de la qualité de l'annonce elle-même. Clique sur le score pour voir le détail."
  },
  {
    q: "Puis-je retirer un favori partagé dans un groupe ?",
    a: "Oui, n'importe quel membre du groupe peut le retirer depuis la page du groupe — pas seulement la personne qui l'a ajouté."
  }
];

export default function AidePage() {
  return (
    <LegalLayout title="Aide & FAQ">
      <div className="space-y-5">
        {FAQ.map((item) => (
          <div key={item.q}>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{item.q}</p>
            <p className="mt-1">{item.a}</p>
          </div>
        ))}
      </div>
      <p className="mt-8">
        Une autre question ? <a href="/contact" className="underline">Contacte-nous</a>.
      </p>
    </LegalLayout>
  );
}
