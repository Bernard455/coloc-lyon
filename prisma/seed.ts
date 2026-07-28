/**
 * Seed minimal — la vraie source de données de démarrage est
 * data/manual-listings.csv, importée via `npm run ingest`
 * (voir src/scrapers/run.ts et src/scrapers/adapters/manual.ts).
 *
 * Ce script sert uniquement à vérifier que la connexion à la base
 * fonctionne et à afficher un rappel des prochaines étapes.
 */
import { prisma } from "../src/lib/db";

async function main() {
  const count = await prisma.listing.count();
  console.log(`[seed] Connexion OK — ${count} annonce(s) actuellement en base.`);
  console.log("[seed] Pour importer les données d'exemple : npm run ingest");
}

main()
  .catch((err) => {
    console.error("[seed] Erreur de connexion à la base — vérifie DATABASE_URL dans .env", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
