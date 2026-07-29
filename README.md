# Coloc Lyon

Plateforme de recherche de logements pour un groupe de 4 étudiants à Lyon et sa métropole (colocations, appartements entiers, maisons).

## ⚠️ À lire en premier : le sujet de l'agrégation multi-sources

Ce projet **ne scrape pas** LeBonCoin, SeLoger, Bien'ici, PAP etc. — ces sites l'interdisent dans leurs CGU et ont des protections anti-bot actives. Voir **`src/scrapers/README.md`** pour le détail source par source et l'approche légale recommandée (partenariats Jinka/Studapart, flux agences, saisie manuelle). Le projet démarre avec un adaptateur "manuel" fonctionnel (import CSV) pour que tout le reste (recherche, scoring, carte, favoris, alertes) soit testable immédiatement avec de vraies données.

## Stack technique

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript, TailwindCSS
- **Backend** : API routes Next.js (Node.js)
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : Auth.js (squelette fourni, provider à configurer)
- **Carte** : Leaflet / OpenStreetMap par défaut (pas de clé API requise) ; bascule Google Maps possible
- **Tests** : Vitest
- **Déploiement cible** : Vercel (app) + une base Postgres managée (Neon, Supabase, Railway…)

## Architecture du projet

```
src/
  app/                    # Pages (App Router) + routes API
    page.tsx              # Recherche principale (liste + carte)
    listing/[id]/         # Détail d'une annonce
    favoris/               # Favoris
    comparateur/            # Comparateur de logements
    alertes/                 # Création et suivi des alertes
    dashboard/              # Statistiques agrégées
    admin/ajouter-annonce/   # Formulaire d'ajout manuel d'annonce
    api/
      listings/            # Recherche + détail (GET)
      favorites/           # Favoris (GET/POST)
      alerts/               # Alertes (GET/POST)
      admin/listings/        # Création manuelle d'annonce (POST)
      auth/[...nextauth]/    # Auth.js (Google OAuth par défaut)
    sitemap.ts / robots.ts # SEO
  components/             # Composants React réutilisables
  lib/                     # Logique métier pure (testée unitairement)
    scoring.ts             # Score qualité IA + détection d'annonces suspectes
    dedupe.ts               # Détection et clustering de doublons
    nlpSearch.ts            # Parseur de recherche en langage naturel
    db.ts                    # Client Prisma
    alertMatcher.ts          # Matching des alertes après ingestion
  scrapers/                # Ingestion des annonces (voir README dédié)
    types.ts                # Interface SourceAdapter
    adapters/                # Un fichier par source
    run.ts                    # Orchestrateur (npm run ingest)
  types/                   # Types partagés frontend/backend
prisma/
  schema.prisma            # Modèle de données complet
data/
  manual-listings.csv       # Exemple de données pour démarrer
```

## Installation

### Prérequis
- Node.js 20+
- PostgreSQL 14+ (local via Docker, ou un provider managé)

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# éditer .env : DATABASE_URL, NEXTAUTH_SECRET (openssl rand -base64 32)

# 3. Créer le schéma en base
npm run db:migrate

# 4. Générer le client Prisma
npm run db:generate

# 5. Importer les données d'exemple (adaptateur manuel → data/manual-listings.csv)
npm run ingest

# 6. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur http://localhost:3000.

### Base de données via Docker (optionnel, pour du local rapide)

```bash
docker run --name coloc-lyon-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=coloc_lyon -p 5432:5432 -d postgres:16
```

### Commandes utiles

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build + serveur de production |
| `npm run test` | Tests unitaires (scoring, dédup, NLP) |
| `npm run db:studio` | Interface graphique Prisma pour explorer la base |
| `npm run ingest` | Lance l'ingestion de toutes les sources configurées |
| `npm run typecheck` | Vérification TypeScript stricte |

## Ajouter tes propres annonces (avant d'avoir un partenariat API)

Ajoute une ligne à `data/manual-listings.csv` (même structure que les exemples fournis) puis relance `npm run ingest`. Un vrai formulaire admin (`/admin/ajouter-annonce`) est la prochaine étape naturelle pour éviter d'éditer le CSV à la main — voir "Améliorations futures".

## Déploiement (Vercel)

1. Pousser le repo sur GitHub
2. Importer le projet dans Vercel
3. Configurer les variables d'environnement (mêmes clés que `.env.example`)
4. Brancher une base Postgres managée (Neon/Supabase ont un plan gratuit compatible Vercel)
5. Ajouter `npx prisma migrate deploy` comme build command additionnelle, ou l'exécuter manuellement après le premier déploiement
6. Planifier `npm run ingest` en cron (Vercel Cron Jobs ou GitHub Actions scheduled workflow) toutes les 30 minutes

## Synchronisation automatique

Ajoutée sans toucher à l'existant : le pipeline d'ingestion (`npm run ingest`) a été extrait dans `src/scrapers/runIngestion.ts` pour être réutilisable par trois déclencheurs différents, qui font exactement la même chose :

1. **CLI** — `npm run ingest` (inchangé)
2. **Bouton admin** — page `/admin/synchronisation`, bouton "Lancer une synchronisation maintenant"
3. **Cron automatique** — `src/app/api/cron/sync/route.ts`, planifié dans `vercel.json`

Nouveautés du pipeline :
- Les annonces d'une source qui ne réapparaissent plus dans un run réussi passent automatiquement au statut `EXPIRED` (au lieu de rester actives indéfiniment)
- La fréquence (toutes les heures / 6h / 1 jour) se configure depuis `/admin/synchronisation` et est stockée en base (`SyncSettings`)

**Limite du plan gratuit Vercel** : les Cron Jobs sur le plan Hobby ne peuvent se déclencher qu'une fois par jour — `vercel.json` est donc réglé sur `"0 4 * * *"` (4h du matin) par défaut. Pour une fréquence plus élevée sans passer sur un plan payant Vercel, utilise un workflow GitHub Actions planifié qui appelle `GET https://ton-site.vercel.app/api/cron/sync` (avec le header `Authorization: Bearer <CRON_SECRET>` si tu as configuré cette variable d'environnement) :

```yaml
# .github/workflows/sync.yml
name: Sync listings
on:
  schedule:
    - cron: "0 * * * *" # toutes les heures
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - run: curl -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" https://ton-site.vercel.app/api/cron/sync
```

La route elle-même vérifie la fréquence configurée avant de relancer quoi que ce soit — appeler `/api/cron/sync` plus souvent que nécessaire ne déclenche pas de synchronisations en trop.

## Ce qui vient d'être ajouté

- **Géocodage automatique** (`src/lib/geocoding.ts`) : convertit une adresse en latitude/longitude via l'API Adresse du gouvernement français (gratuite, sans clé, précise pour la France) avec repli automatique sur Nominatim/OpenStreetMap. Le formulaire admin n'exige plus de saisir les coordonnées à la main — bouton "Localiser l'adresse" avec confirmation visuelle. L'import CSV (`adapters/manual.ts`) géocode aussi automatiquement les lignes sans coordonnées.
- **Formulaire admin** (`/admin/ajouter-annonce`) pour ajouter une annonce manuellement sans toucher au CSV, avec liste d'URLs de photos
- **Auth.js configuré** avec provider Google (`src/app/api/auth/[...nextauth]/route.ts`) + modèles `Account`/`Session`/`VerificationToken` ajoutés au schéma Prisma — `getCurrentUserId()` lit désormais la vraie session
- **Page de gestion des alertes** (`/alertes`) : création + liste des alertes actives, branchée sur l'API existante

Pour activer l'auth : créer des identifiants OAuth sur https://console.cloud.google.com/apis/credentials, renseigner `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` dans `.env`, puis relancer `npm run db:migrate` (nouveaux modèles `Account`/`Session`/`VerificationToken`).

## Améliorations futures possibles

- **Vrais partenariats data** : Studapart (programme écoles), Jinka (agrégateur légal), agences locales (flux XML/CSV standard du secteur), résidences étudiantes (Nexity Studéa, Cardinal Campus…)
- **Upload de photos** direct (au lieu de coller des URLs) via un provider de stockage (S3, Cloudinary, Vercel Blob)
- **Calcul réel des distances/temps de trajet** vers les écoles cibles (API d'itinéraires : GraphHopper, Google Directions, ou OSRM auto-hébergé)
- **Notifications email** réelles (Resend/SendGrid) et **push navigateur** (Web Push + service worker) pour les alertes — points d'intégration déjà marqués dans `src/lib/alertMatcher.ts`
- **Détection IA plus poussée** : résumé automatique de la description via LLM, analyse d'image pour vérifier la cohérence des photos, OCR sur les diagnostics DPE scannés
- **Recherche NLP enrichie** : fallback vers un appel LLM pour les formulations non couvertes par les règles actuelles
- **PostGIS** pour le dédoublonnage géographique et les filtres de distance à grande échelle, plutôt que le calcul en mémoire actuel
- **Cache** (Redis ou cache Next.js `revalidate`) sur les résultats de recherche les plus fréquents
- **Tests end-to-end** (Playwright) en complément des tests unitaires actuels
- **Mode "recherche collaborative à 4"** : partage d'un espace de favoris/vote entre les 4 futurs colocataires

## Notes de conformité

- Le RGPD s'applique aux données de contact stockées (propriétaires/agences) et aux comptes utilisateurs — prévoir une politique de confidentialité et une base légale claire avant mise en production réelle.
- Voir `src/scrapers/README.md` pour le détail légal de chaque source d'annonces.
