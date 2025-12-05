# BRANDIUM FRONTEND - Récapitulatif Complet du Projet

> Document généré le 4 décembre 2025

## 📋 Vue d'ensemble

**Brandium** est un outil de personal branding propulsé par l'IA qui génère des posts personnalisés pour les réseaux sociaux. Cette application frontend est construite avec Next.js 16 (App Router) et s'intègre avec une API backend séparée.

---

## 🛠 Stack Technique

| Technologie | Version | Description |
|-------------|---------|-------------|
| Next.js | 16.0.7 | Framework React (App Router) |
| React | 19.2.0 | Bibliothèque UI |
| TypeScript | 5.x | Typage statique (strict mode) |
| Tailwind CSS | 4.x | Framework CSS utility-first |
| shadcn/ui | - | Composants UI réutilisables |
| React Hook Form | 7.54.2 | Gestion des formulaires |
| Zod | 3.24.1 | Validation de schémas |
| Vitest | - | Framework de tests |

---

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Routes d'authentification
│   │   ├── login/         # Page de connexion
│   │   └── register/      # Page d'inscription
│   └── (dashboard)/       # Routes protégées
│       ├── dashboard/     # Tableau de bord
│       ├── generate/      # Génération IA
│       ├── profiles/      # Gestion des profils
│       ├── projects/      # Gestion des projets
│       ├── platforms/     # Gestion des plateformes
│       └── posts/         # Gestion des posts
├── components/
│   ├── ui/                # Composants shadcn/ui (21 composants)
│   ├── forms/             # Formulaires (5 composants)
│   ├── layout/            # Layout (6 composants)
│   └── features/          # Composants métier (20+ composants)
├── lib/
│   ├── api/               # Client API (7 modules)
│   ├── hooks/             # Hooks React (6 hooks)
│   ├── services/          # Logique métier
│   ├── utils/             # Utilitaires (5 modules)
│   └── providers/         # Providers React (2)
├── types/                 # Définitions TypeScript (8 fichiers)
└── config/                # Configuration (2 fichiers)
```

---

## 🔐 Authentification

### Flux d'authentification
1. Vérification de l'état d'authentification au chargement
2. Redirection automatique vers le dashboard si connecté
3. Stockage du token JWT dans localStorage
4. Gestion automatique des erreurs 401/403

### Fonctionnalités
- ✅ Connexion (email/mot de passe)
- ✅ Inscription avec confirmation de mot de passe
- ✅ Déconnexion
- ✅ Protection des routes
- ✅ Auto-chargement de l'utilisateur au démarrage

---

## 📄 Pages Implémentées

### Pages Publiques
| Route | Description |
|-------|-------------|
| `/` | Landing page marketing avec CTA |
| `/login` | Formulaire de connexion |
| `/register` | Formulaire d'inscription |

### Pages Dashboard (Protégées)
| Route | Description |
|-------|-------------|
| `/dashboard` | Tableau de bord avec statistiques |
| `/generate` | Interface de génération IA |
| `/profiles` | Liste des profils |
| `/profiles/new` | Création de profil |
| `/profiles/[id]` | Édition de profil |
| `/projects` | Liste des projets |
| `/projects/new` | Création de projet |
| `/projects/[id]` | Édition de projet |
| `/platforms` | Liste des plateformes |
| `/platforms/new` | Création de plateforme |
| `/platforms/[id]` | Édition de plateforme |
| `/posts` | Liste des posts avec filtres |
| `/posts/[id]` | Détail d'un post |

---

## 🧩 Composants UI (shadcn/ui)

### Composants de base
- `button` - Boutons avec variantes
- `input` - Champs de saisie
- `label` - Labels accessibles
- `textarea` - Zone de texte
- `card` - Conteneur carte
- `badge` - Badges de statut
- `avatar` - Avatars utilisateur
- `skeleton` - Placeholders de chargement

### Composants interactifs
- `dialog` - Modales
- `alert-dialog` - Dialogues de confirmation
- `dropdown-menu` - Menus déroulants
- `select` - Sélecteurs
- `tabs` - Onglets
- `tooltip` - Info-bulles
- `sheet` - Panneaux latéraux

### Composants de navigation
- `pagination` - Pagination
- `scroll-area` - Zone scrollable
- `separator` - Séparateurs
- `progress` - Barres de progression
- `sonner` - Notifications toast

---

## 📝 Formulaires

### Formulaires implémentés

| Formulaire | Fichier | Fonctionnalités |
|------------|---------|-----------------|
| Auth | `auth-form.tsx` | Login/Register avec validation |
| Profile | `profile-form.tsx` | Nom, description, tons, règles |
| Project | `project-form.tsx` | Nom, description, messages clés |
| Platform | `platform-form.tsx` | Nom, limite caractères |
| Generate | `generate-form.tsx` | Sélection entités, objectif, idée |

### Validation Zod
- Schémas de validation pour tous les formulaires
- Messages d'erreur personnalisés
- Validation croisée (ex: confirmation mot de passe)
- Champs dynamiques (tableaux de règles/messages)

---

## 🪝 Hooks Personnalisés

| Hook | Description |
|------|-------------|
| `useAuth` | État d'authentification et méthodes |
| `useProfiles` | CRUD profils + état |
| `useProfile(id)` | Profil unique avec refetch |
| `useProjects` | CRUD projets + état |
| `useProject(id)` | Projet unique avec refetch |
| `usePlatforms` | CRUD plateformes + état |
| `usePlatform(id)` | Plateforme unique avec refetch |
| `usePosts` | Liste posts avec filtres et pagination |
| `usePost(id)` | Post unique avec refetch |
| `useGenerate` | Génération IA + rate limiting |

### Pattern commun des hooks
```typescript
const {
  items,           // Données
  isLoading,       // État de chargement
  error,           // Erreur éventuelle
  createItem,      // Créer
  updateItem,      // Mettre à jour
  deleteItem,      // Supprimer
  refetch,         // Recharger
} = useFeature();
```

---

## 🌐 API Client

### Structure
```
lib/api/
├── client.ts      # ApiClient class (GET, POST, PUT, DELETE)
├── auth.ts        # Login, Register, getCurrentUser
├── profiles.ts    # CRUD Profils
├── projects.ts    # CRUD Projets
├── platforms.ts   # CRUD Plateformes
├── posts.ts       # Liste, Détail, Suppression posts
├── generate.ts    # Génération IA + Rate limit
└── index.ts       # Exports publics
```

### Fonctionnalités
- ✅ Gestion automatique du token Bearer
- ✅ Normalisation des réponses backend
- ✅ Gestion des erreurs API
- ✅ Support TypeScript complet

---

## 🎨 Design System

### Couleurs
- **Primary**: `blue-600` (#2563EB)
- **Background**: blanc/gris selon thème
- **Text**: gris foncé/blanc selon thème

### Typographie
- **Font**: Geist Sans & Geist Mono
- **Sizes**: Système Tailwind standard

### Thèmes
- ✅ Mode clair (défaut)
- ✅ Mode sombre
- ✅ Détection préférence système

### Layouts
- **Desktop**: Sidebar fixe (256px) + contenu
- **Mobile**: Menu hamburger + contenu pleine largeur

---

## 🔄 Features Métier

### Profils
- Création/édition/suppression de profils
- Gestion des tons de voix (suggestions prédéfinies)
- Règles de communication personnalisées
- Liste avec pagination

### Projets
- Création/édition/suppression de projets
- Messages clés multiples
- Association avec les générations

### Plateformes
- Création/édition/suppression de plateformes
- Suggestions: LinkedIn, X (Twitter), Instagram, TikTok, etc.
- Limite de caractères configurable

### Génération IA
- Sélection profil, projet, plateforme
- Objectif et idée brute
- Affichage du résultat avec métadonnées
- Régénération possible
- **Rate limiting**: suivi des appels restants

### Posts
- Liste de tous les posts générés
- **Filtres**: recherche, plateforme, profil, projet
- **Pagination** complète
- Copie du contenu
- Suppression avec confirmation
- Détail complet du post

---

## 📊 Statistiques du Projet

| Métrique | Valeur |
|----------|--------|
| Routes/Pages | 22 |
| Composants | 50+ |
| Hooks personnalisés | 10 |
| Modules API | 7 |
| Fichiers de types | 8 |
| Utilitaires | 5 |

---

## ✅ Fonctionnalités Implémentées

### Authentification
- [x] Connexion utilisateur
- [x] Inscription utilisateur
- [x] Déconnexion
- [x] Protection des routes
- [x] Persistance de session

### CRUD Complet
- [x] Profils (Create, Read, Update, Delete)
- [x] Projets (Create, Read, Update, Delete)
- [x] Plateformes (Create, Read, Update, Delete)
- [x] Posts (Read, Delete)

### Génération IA
- [x] Formulaire de génération
- [x] Affichage du résultat
- [x] Régénération
- [x] Rate limiting avec countdown

### UX/UI
- [x] Design responsive
- [x] Mode sombre/clair
- [x] Notifications toast
- [x] États de chargement (skeletons)
- [x] États vides avec CTA
- [x] Error boundaries
- [x] Accessibilité (skip links, ARIA)

### Filtrage & Pagination
- [x] Recherche textuelle
- [x] Filtres par entité
- [x] Pagination complète
- [x] Reset des filtres

---

## 🧪 Tests

### Configuration
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Environnement**: jsdom

### Commandes
```bash
pnpm test              # Mode watch
pnpm test:run          # Exécution unique
pnpm test:coverage     # Avec couverture
```

---

## 🚀 Commandes de Développement

```bash
# Développement
pnpm dev              # Serveur dev (localhost:3000)

# Production
pnpm build            # Build production
pnpm start            # Serveur production

# Qualité
pnpm lint             # Linting ESLint
pnpm typecheck        # Vérification TypeScript
```

---

## 📦 Dépendances Principales

### Core
- `next` - Framework
- `react` / `react-dom` - UI
- `typescript` - Typage

### UI
- `tailwindcss` - Styles
- `lucide-react` - Icônes
- `sonner` - Toasts
- `@radix-ui/*` - Composants accessibles

### Formulaires
- `react-hook-form` - Gestion formulaires
- `zod` - Validation
- `@hookform/resolvers` - Bridge RHF/Zod

### Utilitaires
- `clsx` / `tailwind-merge` - Classes dynamiques
- `date-fns` - Manipulation dates
- `next-themes` - Thèmes

---

## 🏗 Architecture & Patterns

### Séparation des préoccupations
| Type de logique | Emplacement |
|-----------------|-------------|
| Appels API | `lib/api/*.ts` |
| Logique métier | `lib/services/*.ts` |
| Gestion d'état | `lib/hooks/*.ts` |
| Transformation données | `lib/utils/*.ts` |
| Validation | `lib/utils/validation.ts` |
| Rendu UI | `components/**/*.tsx` |

### Pattern Hook
Tous les hooks de données suivent le même pattern:
- Fetch au montage
- États loading/error
- Opérations CRUD
- Notifications toast
- Auto-refetch

### Normalisation API
Les réponses backend sont normalisées dans les modules API:
- `toneTags` → `tone`
- `generatedText` → `content`

---

## 🔮 Évolutions Possibles

- [ ] Tests unitaires complets
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Optimisations performance (memoization)
- [ ] Code splitting avancé
- [ ] Recherche avancée avec suggestions
- [ ] Opérations en masse
- [ ] Planification de posts
- [ ] Intégration analytics
- [ ] Publication directe sur réseaux sociaux
- [ ] Fonctionnalités collaboration

---

## 📄 Fichiers de Configuration

| Fichier | Description |
|---------|-------------|
| `package.json` | Dépendances et scripts |
| `next.config.ts` | Configuration Next.js |
| `tailwind.config.ts` | Configuration Tailwind |
| `tsconfig.json` | Configuration TypeScript |
| `vitest.config.ts` | Configuration tests |
| `components.json` | Configuration shadcn/ui |
| `CLAUDE.md` | Instructions pour Claude Code |

---

*Ce document représente l'état complet du frontend Brandium à la date de génération.*
