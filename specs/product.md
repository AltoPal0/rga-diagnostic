# 🧠 SPEC — Diagnostic RGA interactif (MVP Web Mobile)

## Statut
VALIDÉ — à implémenter tel quel  
Frontend-first, calcul local, persistance Supabase, déploiement Vercel

---

## 🎯 OBJECTIF PRODUIT

Créer un **diagnostic RGA interactif**, utilisable sur **téléphone via navigateur web**, permettant :

- de guider un utilisateur à travers un questionnaire structuré
- d’afficher uniquement les questions pertinentes (logique conditionnelle)
- de calculer un **score RGA sur 100**
- d’interpréter ce score (faible → très élevé)
- de recommander les solutions TerraStab (Survey / Shield)
- d’enregistrer le diagnostic dans Supabase

---

## 🧭 PRINCIPES STRUCTURANTS

1. **Calcul 100 % frontend**
   - Le scoring et la logique métier sont exécutés dans le navigateur
   - Le backend ne fait que persister les résultats

2. **Questionnaire piloté par configuration**
   - Aucune logique métier codée dans les composants UI
   - Le questionnaire est défini dans un fichier de config structuré

3. **Mobile-first**
   - UX type wizard
   - 1 question (ou 1 bloc logique) par écran
   - Progression claire et persistée

4. **MVP simple, évolutif**
   - Pas d’admin
   - Pas de PDF
   - Pas d’auth utilisateur obligatoire

---

## 🧱 STACK TECHNIQUE (corrigé)

### Frontend
- React + Vite
- TypeScript
- TailwindCSS
- State management léger (Zustand ou équivalent)
- Validation : Zod

### Backend (Supabase uniquement)
- Supabase (plateforme unique)
  - Postgres (stockage diagnostics)
  - Row Level Security (RLS)
  - Auth (optionnel MVP)
  - Edge Functions (optionnel, uniquement si besoin)
- Aucune application backend séparée (pas de serveur Node/Bun à déployer)

### Déploiement
- Frontend : Vercel
- Backend : Supabase (géré)
- Variables d’environnement : URL + ANON KEY Supabase côté Vercel

## 🧩 SUPABASE — PROJET EXISTANT (CONTRAINTE FORTE)

L’application DOIT utiliser un projet Supabase existant.

### Projet
- Nom : terrastab
- Project ref : sddrgyovjahxigysblra

### Contraintes impératives
- ❌ Ne PAS créer de nouveau projet Supabase
- ❌ Ne PAS modifier ou supprimer des tables existantes sans validation explicite
- ✅ Ajouter de nouvelles tables est autorisé (ex: `diagnostics`)
- ✅ Ajouter des Edge Functions est autorisé
- ✅ Ajouter ou ajuster des policies RLS est autorisé (sur les nouvelles tables)

### Accès
- Le frontend (Vercel) utilisera :
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
- Aucune clé service-role côté frontend

### Rôle du MCP Supabase
Un serveur MCP Supabase est disponible et connecté à ce projet.

Claude Code peut et doit l’utiliser pour :
- inspecter le schéma existant
- proposer des tables compatibles
- définir des policies RLS sûres
- éviter toute collision avec l’existant

## 🔐 Décisions sécurité (Supabase-only)

1) En MVP, on écrit dans Supabase avec la clé ANON + RLS
- Table `diagnostics` accessible en INSERT uniquement
- Aucune lecture publique nécessaire

2) Si on a besoin de logique sensible (email, anti-spam, déduplication, quotas)
- On ajoute une Supabase Edge Function
- Le frontend appelle la Function au lieu d’écrire directement en DB

---

## 🗂️ STRUCTURE DES ÉCRANS

### `/`
**Landing**
- Texte court
- CTA : “Démarrer le diagnostic”
- Mention durée (~10 minutes)

---

### `/diagnostic`
**Wizard questionnaire**
- Navigation séquentielle
- Barre de progression
- Boutons :
  - Suivant
  - Précédent
  - “Je ne sais pas” (si applicable)

Fonctionnalités :
- affichage conditionnel des questions
- sauvegarde automatique (local + Supabase en fin)
- reprise de session locale

---

### `/resultat`
**Résultats**
- Score global /100
- Niveau de risque (🟢🟡🟠🔴)
- Synthèse textuelle
- Recommandations :
  - Survey / Shield
  - Travaux prioritaires
- CTA :
  - “Recevoir le diagnostic par email” (optionnel MVP)

---

## 🧠 MOTEUR DE QUESTIONNAIRE (FRONTEND)

### 1. Configuration (data-driven)

Un fichier unique de configuration contient :

- sections
- questions
- options de réponse
- règles de visibilité conditionnelle
- règles de scoring
- règles de recommandation

Aucune logique métier ne doit être écrite dans les composants UI.

---

### 2. Types de questions supportées (MVP)

- single-choice (radio)
- multi-choice (checkbox)
- text (coordonnées)
- info (texte non interactif)

---

### 3. Règles de visibilité

Chaque question peut définir :
- des conditions d’affichage
- basées sur une ou plusieurs réponses précédentes

Exemples :
- afficher “Profondeur fondations” si type fondations ≠ inconnu
- afficher questions végétation si arbres présents

---

### 4. Calcul du score

Fonction pure :
- input : réponses utilisateur
- output :
  - score total (0–100)
  - sous-scores par catégorie :
    - Exposition
    - Prédisposition
    - Facteurs aggravants
    - Désordres

Le scoring est strictement basé sur :
- le `QUESTIONNAIRE-RGA-GUIDE-COMPLET.md`

---

### 5. Interprétation du score

| Score | Risque |
|------|-------|
| 0–20 | Faible 🟢 |
| 21–40 | Modéré 🟡 |
| 41–60 | Élevé 🟠 |
| 61–100 | Très élevé 🔴 |

---

### 6. Règles de recommandation TerraStab

- **Survey**
  - Toujours compatible

- **Shield**
  - Compatible uniquement si :
    - profondeur fondations ≤ 1,50 m

Les recommandations doivent inclure :
- justification courte
- priorités de travaux si score ≥ 40

---

## 💾 PERSISTANCE DES DONNÉES

### Local (immédiat)
- localStorage :
  - answers
  - currentStep
  - questionnaireVersion
  - timestamp

### Supabase (fin de diagnostic)

Insertion dans une table `diagnostics` :
- id
- created_at
- questionnaire_version
- answers (JSON)
- score_total
- score_breakdown (JSON)
- risk_level
- recommendations (JSON)
- user_identity (JSON, nullable)

Aucune lecture Supabase nécessaire en MVP.

---

## 🗃️ STRUCTURE DES DOSSIERS (FRONT)

src/
pages/
Home.tsx
Diagnostic.tsx
Result.tsx

components/
QuestionRenderer.tsx
QuestionCard.tsx
ProgressBar.tsx

engine/
config.ts
visibility.ts
scoring.ts
recommendations.ts
riskTier.ts
types.ts

store/
useDiagnosticStore.ts

utils/
storage.ts
supabase.ts

---

## 🔐 SÉCURITÉ & CONSISTENCE

- Versionner le questionnaire (`questionnaire_version`)
- Ne jamais recalculer côté backend
- Le frontend est source de vérité du diagnostic

---

## 🚧 HORS SCOPE MVP

- Auth utilisateur
- Paiement
- Génération PDF
- Back-office admin
- Multi-langue
- Synchronisation cross-device

---

## 🚀 ÉVOLUTIONS PRÉVUES (NON MVP)

- Admin pour éditer le questionnaire
- PDF export
- Email automatisé
- Partage assureur / expert
- Historique multi-diagnostics

---

## 📌 RÉFÉRENCES FONCTIONNELLES

- `LIRE-MOI-DABORD.md`
- `QUESTIONNAIRE-RGA-RESUME-1PAGE.md`
- `QUESTIONNAIRE-RGA-GUIDE-COMPLET.md`
- `QUESTIONNAIRE-RGA-LISTE-QUESTIONS.md`

Ces documents sont la **source métier officielle**.

---

FIN DE SPEC