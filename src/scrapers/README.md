# Ingestion des annonces — ce qui est réellement possible

Ce dossier définit une interface commune (`SourceAdapter`) pour brancher
n'importe quelle source d'annonces. **Avant d'activer une source, vérifie
son statut légal ci-dessous** — c'est ce qui détermine si tu écris un vrai
scraper, si tu utilises une API/un flux partenaire, ou si tu passes par une
saisie manuelle.

| Source | Statut | Approche recommandée |
|---|---|---|
| **LeBonCoin** | Scraping interdit par les CGU + protections anti-bot actives (rate limiting, fingerprinting). | Ne pas scraper. Alternative : import manuel d'annonces individuelles collées par l'utilisateur (voir `adapters/manual.ts`), ou partenariat API officiel si disponible pour ton usage. |
| **SeLoger / Logic-Immo** (groupe Groupe SeLoger) | Pas d'API publique ouverte. CGU restrictives sur l'extraction automatisée. | Idem : saisie manuelle, ou négociation d'un accès data officiel. |
| **Bien'ici** | Diffuse un flux de données vers des partenaires (agences), pas d'API publique grand public. | Vérifier un partenariat "diffuseur" si tu deviens un site partenaire agences. |
| **PAP (Particulier à Particulier)** | CGU restrictives sur la réutilisation automatisée du contenu. | Saisie manuelle, ou contact PAP pour un accès data. |
| **Studapart** | Plateforme B2B pensée pour les écoles partenaires — a un vrai programme de partenariat. | **Le plus prometteur** : contacter Studapart pour un accès partenaire école/résidence — c'est leur modèle économique. |
| **La Carte des Colocs** | Petite plateforme communautaire, CGU à vérifier au cas par cas. | Contact direct + accord explicite avant toute automatisation. |
| **LocService** | Fonctionne par abonnement propriétaires ; a déjà proposé des accès API à des partenaires par le passé. | Contacter LocService pour un accès "partenaire". |
| **Jinka** | **Est lui-même un agrégateur légal** (deals avec les sources en amont). | Le plus simple : si Jinka propose un accès API/partenaire, l'utiliser pour bénéficier de leur travail d'agrégation déjà légalisé, plutôt que ré-agréger soi-même. |
| **Logic-Immo** | Voir SeLoger (même groupe). | Idem SeLoger. |
| **Agences immobilières locales** | Beaucoup ont un flux XML/CSV standard (format "Fichier LMNP", "SeLogerPro export", etc.) fourni à leurs partenaires diffuseurs. | Contact direct agence par agence pour un flux structuré — c'est une pratique courante et légale du secteur. |
| **Résidences étudiantes** (ex: Nexity Studéa, Cardinal Campus) | Ont des API ou flux de disponibilité pour les partenaires (écoles, CROUS). | Contact direct + demande d'accès partenaire. |

## Ce que ce projet fournit réellement

1. **`types.ts`** — l'interface `SourceAdapter` que toute source doit implémenter, qu'elle soit une vraie API, un flux CSV, ou une saisie manuelle.
2. **`adapters/manual.ts`** — un adaptateur fonctionnel qui importe des annonces saisies/collées à la main (formulaire admin) ou via un fichier CSV. C'est la source la plus fiable pour démarrer sans dépendre d'aucun tiers.
3. **`adapters/jinka.example.ts`** et **`adapters/studapart.example.ts`** — templates prêts à brancher sur une vraie clé API dès qu'un partenariat est signé. Ils ne fonctionnent pas "out of the box" (pas de clé fournie), mais montrent où brancher l'authentification et le mapping de données.
4. **`run.ts`** — l'orchestrateur qui appelle tous les adaptateurs actifs, déduplique (`lib/dedupe.ts`) et sauve en base.

## Pourquoi ne pas juste scraper quand même ?

Techniquement possible à court terme, mais :
- Ça casse à chaque changement de DOM ou déploiement d'une protection anti-bot — coût de maintenance élevé pour un projet solo.
- Risque de blocage d'IP / compte, et risque juridique réel (violation CGU = base légale pour une action, cf. jurisprudence CNIL/affaires LeBonCoin vs agrégateurs).
- Un agrégateur déjà légal comme **Jinka** a déjà résolu ce problème — s'appuyer dessus est la voie la plus rapide et la plus robuste.

**Recommandation concrète pour démarrer vite** : lance le site avec l'adaptateur `manual` (toi ou un petit groupe d'utilisateurs colle les annonces trouvées sur les plateformes), pendant que tu négocies en parallèle un accès Jinka/Studapart.
