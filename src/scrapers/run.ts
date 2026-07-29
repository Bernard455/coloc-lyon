/**
 * Point d'entrée CLI — `npm run ingest`.
 * Toute la logique vit maintenant dans runIngestion.ts (réutilisée aussi
 * par le bouton admin et le cron automatique) ; ce fichier ne fait plus
 * qu'appeler cette fonction et afficher le résultat, sans rien changer au
 * comportement existant.
 */
import { prisma } from "@/lib/db";
import { runIngestion } from "./runIngestion";

runIngestion()
  .then((summary) => {
    console.log(JSON.stringify(summary, null, 2));
    return prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
