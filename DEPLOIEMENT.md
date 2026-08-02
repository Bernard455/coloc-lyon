# Obtenir un lien public — guide pas à pas

Ce projet a besoin d'un backend (routes API Next.js) et d'une vraie base
PostgreSQL : il ne peut pas tourner comme un simple fichier statique. Le
chemin le plus rapide et gratuit vers un vrai lien `https://...` est
Vercel (qui héberge Next.js) + Neon (Postgres gratuit) — environ 10 minutes,
aucune carte bancaire requise.

## 1. Créer la base de données (2 min)

1. Va sur https://neon.tech, crée un compte gratuit
2. Crée un nouveau projet → copie la "Connection string" (commence par `postgresql://`)

## 2. Mettre le code sur GitHub (2 min)

```bash
cd coloc-lyon
git init
git add .
git commit -m "Premier commit — Coloc Lyon"
```

Crée un dépôt vide sur https://github.com/new, puis :

```bash
git remote add origin https://github.com/TON-COMPTE/coloc-lyon.git
git branch -M main
git push -u origin main
```

## 3. Déployer sur Vercel (3 min)

1. Va sur https://vercel.com, connecte-toi avec ton compte GitHub
2. "Add New Project" → sélectionne le dépôt `coloc-lyon`
3. Dans "Environment Variables", ajoute au minimum :
   - `DATABASE_URL` = la connection string Neon de l'étape 1
   - `NEXTAUTH_URL` = `https://<le-nom-que-vercel-te-donne>.vercel.app` (tu peux le laisser vide au premier déploiement et le renseigner ensuite une fois l'URL connue)
   - `NEXTAUTH_SECRET` = génère-en un avec `openssl rand -base64 32` en local
4. Clique "Deploy"

Au premier déploiement, l'app se lance mais la base est vide (pas encore de tables). Deux options :

**Option A — en local, une seule fois :**
```bash
# avec le même DATABASE_URL que sur Vercel, dans ton .env local
npm run db:migrate
npm run ingest   # importe les 3 annonces d'exemple de data/manual-listings.csv
```

**Option B — via le terminal Vercel (CLI) :**
```bash
npm i -g vercel
vercel env pull .env.local   # récupère les variables d'env depuis Vercel
npm run db:migrate
npm run ingest
```

## 4. Ton lien

Vercel te donne une URL du type `https://coloc-lyon-tonpseudo.vercel.app` —
c'est ton vrai lien partageable, avec HTTPS, hébergé 24/7 gratuitement sur
le plan Hobby de Vercel.

## Ensuite

- Planifie `npm run ingest` en cron (Vercel Cron Jobs, gratuit sur le plan Hobby jusqu'à 2 jobs) pour rafraîchir les annonces automatiquement
- Ajoute tes propres annonces via `/admin/ajouter-annonce` une fois le site en ligne
- Un nom de domaine personnalisé (ex: `coloc-lyon.vercel.app`) peut être branché gratuitement depuis les réglages du projet Vercel si tu en achètes un (OVH, Gandi…)
