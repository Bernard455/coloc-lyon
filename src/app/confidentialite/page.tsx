import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { getSiteContent, formatLegalUpdatedAt } from "@/lib/siteContent";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export const dynamic = "force-dynamic";

export default async function ConfidentialitePage() {
  const { legalUpdatedAt } = await getSiteContent();

  return (
    <LegalLayout title="Politique de confidentialité">
      <p>Dernière mise à jour : {formatLegalUpdatedAt(legalUpdatedAt)}.</p>

      <h2>Données collectées</h2>
      <p>Lorsque tu te connectes avec Google, nous recevons et conservons :</p>
      <ul className="list-disc pl-5">
        <li>ton nom et ton adresse email (fournis par Google)</li>
        <li>ta photo de profil Google, si tu en as une</li>
      </ul>
      <p>En utilisant le site, tu peux aussi créer :</p>
      <ul className="list-disc pl-5">
        <li>des favoris (liés à ton compte, personnels ou partagés dans un groupe)</li>
        <li>des groupes privés et leur liste de membres</li>
        <li>des alertes de recherche (critères de logement, pas de données sensibles)</li>
        <li>des annonces que tu ajoutes manuellement (adresse, prix, contact du propriétaire/agence)</li>
      </ul>

      <h2>Utilisation des données</h2>
      <p>
        Ces données servent uniquement au fonctionnement du site : afficher tes favoris, gérer tes groupes, envoyer
        les alertes que tu as configurées. Elles ne sont ni vendues, ni partagées avec des tiers à des fins
        commerciales.
      </p>

      <h2>Conservation</h2>
      <p>
        Tes données sont conservées tant que ton compte existe. Tu peux demander leur suppression à tout moment en
        écrivant à l'adresse indiquée sur la page Contact.
      </p>

      <h2>Hébergement et sécurité</h2>
      <p>
        Les données sont stockées sur une base PostgreSQL hébergée par Neon Inc., elle-même hébergée sur
        l'infrastructure Vercel. L'authentification passe par Google (OAuth) — nous ne stockons jamais ton mot de
        passe Google.
      </p>

      <h2>Cookies</h2>
      <p>
        Ce site utilise un cookie de session technique nécessaire pour te garder connecté après authentification
        Google. Aucun cookie publicitaire ou de tracking tiers n'est utilisé à ce jour.
      </p>

      <h2>Tes droits</h2>
      <p>
        Conformément au RGPD, tu peux demander l'accès, la rectification ou la suppression de tes données en
        écrivant à l'adresse indiquée sur la page Contact.
      </p>
    </LegalLayout>
  );
}