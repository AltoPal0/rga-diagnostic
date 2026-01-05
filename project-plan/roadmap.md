# 🗺️ Roadmap Complet - RGA Diagnostic MVP

## Vue d'Ensemble du Projet

**Objectif:** Application web React pour diagnostic RGA (Retrait-Gonflement des Argiles)
**Durée estimée:** 10-15 jours
**Stack:** React + TypeScript + Vite + TailwindCSS + Zustand + Supabase
**Déploiement:** Vercel

---

## Phase 1: Setup Projet ✅ TERMINÉ

**Durée:** 1 jour | **Statut:** ✅ Complété le 5 janvier 2025

### Objectifs
Initialiser le projet avec toutes les configurations de base

### Tâches
- [x] Initialiser Vite + React + TypeScript
- [x] Installer toutes les dépendances npm
- [x] Créer la structure des dossiers (pages, components, engine, store, utils, styles)
- [x] Configurer TailwindCSS avec couleurs personnalisées
- [x] Créer les pages de base (Home, Diagnostic, Result - placeholders)
- [x] Configurer le routing React Router
- [x] Initialiser Git et pousser sur GitHub
- [x] Configurer les variables d'environnement (.env.local)
- [x] Vérifier que le build fonctionne

### Livrables
- ✅ Projet Vite fonctionnel
- ✅ 315 packages npm installés
- ✅ Structure de dossiers complète
- ✅ Build réussi (53.20 kB gzipped)
- ✅ Code sur GitHub (commit 4c96143)

---

## Phase 2: Base de Données Supabase ⏳ À FAIRE

**Durée estimée:** 1-2 jours | **Statut:** ⏳ En attente

### Objectifs
Créer le schéma de base de données pour stocker les diagnostics

### Tâches principales

#### 2.1 Création de la table `diagnostics`
- [ ] Créer migration SQL via MCP Supabase
- [ ] Définir le schéma complet:
  ```sql
  - id (UUID, PRIMARY KEY)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
  - questionnaire_version (TEXT, default 'v1.0')
  - answers (JSONB) - toutes les réponses
  - score_total (INTEGER, 0-100)
  - score_breakdown (JSONB) - {exposure, predisposition, aggravating, damage}
  - risk_level (TEXT) - faible|modere|eleve|tres_eleve
  - recommendations (JSONB)
  - user_identity (JSONB, nullable)
  - user_agent (TEXT)
  - ip_address (INET)
  - completion_time_seconds (INTEGER)
  ```
- [ ] Créer indexes pour optimisation:
  - `idx_diagnostics_created_at`
  - `idx_diagnostics_risk_level`
  - `idx_diagnostics_version`
- [ ] Créer trigger `update_updated_at_column`

#### 2.2 Configuration RLS (Row Level Security)
- [ ] Activer RLS sur la table `diagnostics`
- [ ] Créer policy "Allow anonymous INSERT" (anon peut INSERT)
- [ ] Créer policy "Deny SELECT for anon" (anon ne peut pas SELECT)
- [ ] Créer policy "Allow full access for authenticated admins"
- [ ] Accorder permissions: `GRANT INSERT ON diagnostics TO anon`

#### 2.3 Tests de connexion
- [ ] Créer `src/utils/supabase.ts` avec client Supabase
- [ ] Tester connexion depuis l'application
- [ ] Vérifier que les variables d'environnement fonctionnent
- [ ] Tester INSERT avec clé anon (doit réussir)
- [ ] Tester SELECT avec clé anon (doit échouer)

### Livrables
- [ ] Table `diagnostics` créée dans Supabase
- [ ] RLS policies configurées et testées
- [ ] Client Supabase fonctionnel dans l'app
- [ ] Migration SQL documentée

### Fichiers à créer
- `src/utils/supabase.ts`

---

## Phase 3: Moteur de Questionnaire ⏳ À FAIRE

**Durée estimée:** 3-4 jours | **Statut:** ⏳ En attente

### Objectifs
Implémenter toute la logique métier du questionnaire (27 questions, scoring, recommandations)

### Tâches principales

#### 3.1 Types TypeScript (`src/engine/types.ts`)
- [ ] Définir `Question`, `QuestionType`, `QuestionOption`
- [ ] Définir `VisibilityCondition`, `ScoringRule`
- [ ] Définir `Answers`, `ScoreBreakdown`, `RiskLevel`, `Recommendations`
- [ ] Définir `DiagnosticState`

#### 3.2 Configuration Questionnaire (`src/engine/config.ts`) ⭐ CRITIQUE
- [ ] **Section 1 - Identification (5 questions)**
  - [ ] Type de fondations (semelles/dallage/vide sanitaire/micropieux)
  - [ ] Profondeur fondations (<0.80m / 0.80-1.50m / >1.50m) - CRITIQUE pour Shield
  - [ ] Année construction (<1980 / 1980-2000 / 2000-2020 / >2020)
  - [ ] Nombre de niveaux
  - [ ] Type de bâtiment

- [ ] **Section 2 - Exposition RGA (2 questions)**
  - [ ] Niveau aléa Géorisques (Faible/Moyen/Fort) - CRITIQUE pour scoring
  - [ ] Type de sol (Argile/Limons/Sable/Mixte)

- [ ] **Section 3 - Végétation (3 questions)**
  - [ ] Présence arbres < 10m (Oui/Non)
  - [ ] Distance arbres (Conforme / 5-8m / <5m) - conditionnel si arbres
  - [ ] Écran anti-racines (Non/Partiel/Complet) - conditionnel si arbres

- [ ] **Section 4 - Eaux Pluviales (3 questions)**
  - [ ] Drainage périphérique (Oui/Non/Inconnu) - CRITIQUE
  - [ ] Descentes gouttières (Réseau / >1m / Au pied)
  - [ ] Stagnation eau (Jamais/Rare/Fréquente/Permanente)

- [ ] **Section 5 - Réseaux (1 question)**
  - [ ] Fuites réseaux (Non/Réparée/Active) - CRITIQUE si active

- [ ] **Section 6 - Désordres (2 questions)**
  - [ ] Fissures façade (Aucune / <0.2mm / 0.2-2mm / 2-5mm / >5mm) - CRITIQUE
  - [ ] Ouvertures bloquées (Non/Occasionnel/Fréquent)

- [ ] **Section 7 - Contraintes Terrain (3 questions)**
  - [ ] Terrasse collée (Oui/Non)
  - [ ] Piscine <3m (Oui/Non)
  - [ ] Accès terrain (Large/Étroit/Difficile)

- [ ] Configurer `scoringRules` pour chaque question selon knowledge/04-QUESTIONNAIRE-RGA-GUIDE-COMPLET.md
- [ ] Configurer `visibilityConditions` pour questions conditionnelles

#### 3.3 Logique de Visibilité (`src/engine/visibility.ts`)
- [ ] Implémenter `isQuestionVisible(question, answers)`
- [ ] Implémenter `getVisibleQuestions(allQuestions, answers)`
- [ ] Implémenter `getNextVisibleQuestion()`
- [ ] Implémenter `getPreviousVisibleQuestion()`
- [ ] Gérer opérateurs: equals, not_equals, in, not_in

#### 3.4 Algorithme de Scoring (`src/engine/scoring.ts`) ⭐ CRITIQUE
- [ ] Implémenter `calculateScore(answers, questions)` qui retourne `{total, breakdown}`
- [ ] Parcourir toutes les questions et appliquer scoringRules
- [ ] Calculer breakdown par catégorie:
  - **Exposure** (max 20 pts): Aléa Géorisques
  - **Predisposition** (max 30 pts): Fondations (type + profondeur) + Année construction
  - **Aggravating** (max 30 pts): Arbres + Drainage + Gouttières + Stagnation + Piscine
  - **Damage** (max 20 pts): Fissures + Ouvertures bloquées
- [ ] Appliquer les limites (0-100 total, limites par catégorie)
- [ ] Valider avec les règles dans knowledge/04-QUESTIONNAIRE-RGA-GUIDE-COMPLET.md

#### 3.5 Interprétation Risque (`src/engine/riskTier.ts`)
- [ ] Implémenter `getRiskLevel(totalScore)`:
  - 0-20 → faible 🟢
  - 21-40 → modere 🟡
  - 41-60 → eleve 🟠
  - 61-100 → tres_eleve 🔴
- [ ] Implémenter `getRiskLabel()`, `getRiskEmoji()`, `getRiskColor()`
- [ ] Implémenter `getRiskInterpretation()` avec textes personnalisés

#### 3.6 Moteur de Recommandations (`src/engine/recommendations.ts`) ⭐ CRITIQUE
- [ ] Implémenter `generateRecommendations(answers, riskLevel, scoreBreakdown)`
- [ ] **Règle Survey**: Toujours compatible = true
- [ ] **Règle Shield**: Compatible SI profondeur fondations ≤ 1,50m
- [ ] Générer `priority_actions` selon réponses:
  - Pas de drainage → "Installer drainage périphérique"
  - Gouttières au pied → "Éloigner descentes >1m"
  - Stagnation fréquente → "Corriger problèmes stagnation"
  - Fuite active → "URGENT: Réparer fuites"
  - Arbres <5m → "Élaguer ou supprimer arbres"
  - Pas d'écran anti-racines → "Installer écran anti-racines"
  - Lézardes >5mm → "Faire expertiser par professionnel"
  - Risque élevé/très élevé → "Réaliser diagnostic TerraStab Survey"
- [ ] Générer texte d'interprétation complet

### Livrables
- [ ] 27 questions configurées avec scoring précis
- [ ] Logique conditionnelle fonctionnelle
- [ ] Scoring validé contre documentation
- [ ] Recommandations TerraStab correctes

### Fichiers à créer
- `src/engine/types.ts`
- `src/engine/config.ts` (⭐ 500+ lignes, très important)
- `src/engine/visibility.ts`
- `src/engine/scoring.ts`
- `src/engine/riskTier.ts`
- `src/engine/recommendations.ts`

---

## Phase 4: State Management ⏳ À FAIRE

**Durée estimée:** 1-2 jours | **Statut:** ⏳ En attente

### Objectifs
Gérer l'état de l'application avec Zustand et localStorage

### Tâches principales

#### 4.1 Store Zustand (`src/store/useDiagnosticStore.ts`)
- [ ] Définir interface `DiagnosticStore` avec:
  - State: `answers`, `currentQuestionIndex`, `score`, `totalScore`, `riskLevel`, `recommendations`, `startedAt`, `completedAt`
  - Actions: `setAnswer()`, `nextQuestion()`, `previousQuestion()`, `setScore()`, `setRiskLevel()`, `setRecommendations()`, `complete()`, `reset()`
- [ ] Implémenter store avec middleware `persist` de Zustand
- [ ] Configurer clé localStorage: `rga-diagnostic-storage`
- [ ] Configurer version: 1

#### 4.2 Utilitaires localStorage (`src/utils/storage.ts`)
- [ ] Implémenter `saveDiagnostic(data)`
- [ ] Implémenter `loadDiagnostic()` qui retourne `StoredDiagnostic | null`
- [ ] Implémenter `clearDiagnostic()`
- [ ] Implémenter `hasSavedDiagnostic()` pour afficher "Reprendre"
- [ ] Définir interface `StoredDiagnostic`

#### 4.3 Client Supabase (`src/utils/supabase.ts`)
- [ ] Créer client Supabase avec URL et ANON_KEY depuis env
- [ ] Implémenter `submitDiagnostic(data)` qui:
  - Insère dans table `diagnostics`
  - Retourne `{success: boolean, error?: string, id?: string}`
  - Gère les erreurs proprement
- [ ] Implémenter `testSupabaseConnection()` pour vérification
- [ ] Définir interface `DiagnosticSubmission`

### Livrables
- [ ] Store Zustand fonctionnel avec persistence
- [ ] localStorage sauvegarde/restaure correctement
- [ ] Client Supabase prêt pour soumission

### Fichiers à créer
- `src/store/useDiagnosticStore.ts`
- `src/utils/storage.ts`
- `src/utils/supabase.ts` (si pas déjà créé en Phase 2)

---

## Phase 5: Pages & Composants UI ⏳ À FAIRE

**Durée estimée:** 3-4 jours | **Statut:** ⏳ En attente

### Objectifs
Créer toutes les pages et composants d'interface utilisateur

### Tâches principales

#### 5.1 Page Landing (`src/pages/Home.tsx`)
- [ ] Remplacer placeholder par design complet
- [ ] Hero section avec titre accrocheur
- [ ] Description claire du diagnostic RGA
- [ ] CTA principal "Démarrer le diagnostic"
- [ ] Mention durée (~10 minutes)
- [ ] Vérifier `hasSavedDiagnostic()` et afficher bouton "Reprendre" si applicable
- [ ] Design responsive mobile-first

#### 5.2 Page Wizard Questionnaire (`src/pages/Diagnostic.tsx`) ⭐ CRITIQUE
- [ ] Implémenter logique wizard complète:
  - Récupérer questions visibles via `getVisibleQuestions()`
  - Afficher question courante
  - Gérer navigation Précédent/Suivant
  - Valider réponses requises
  - Calculer progression (%)
- [ ] Intégrer QuestionRenderer pour afficher questions
- [ ] Intégrer ProgressBar
- [ ] Implémenter sauvegarde auto dans store
- [ ] À la dernière question, calculer:
  - Score total + breakdown via `calculateScore()`
  - Niveau risque via `getRiskLevel()`
  - Recommandations via `generateRecommendations()`
- [ ] Marquer comme complété et rediriger vers `/resultat`
- [ ] Navigation fixe en bas (mobile-friendly)

#### 5.3 Page Résultats (`src/pages/Result.tsx`)
- [ ] Afficher score total (grand, centré)
- [ ] Afficher badge risque avec emoji 🟢🟡🟠🔴
- [ ] Afficher breakdown des scores:
  - Exposition / 20
  - Prédisposition / 30
  - Facteurs aggravants / 30
  - Désordres / 20
- [ ] Afficher texte d'interprétation
- [ ] Section "Solutions TerraStab":
  - ✅ Survey (toujours compatible)
  - ✅/❌ Shield (selon profondeur fondations)
  - Raison incompatibilité Shield si applicable
- [ ] Afficher liste actions prioritaires
- [ ] Auto-soumission Supabase au chargement:
  - Appeler `submitDiagnostic()`
  - Afficher statut (submitting/success/error)
- [ ] Bouton "Faire un nouveau diagnostic" (reset + redirect /)
- [ ] Design cards avec TailwindCSS

#### 5.4 Composant QuestionRenderer (`src/components/QuestionRenderer.tsx`)
- [ ] Gérer type `single-choice`:
  - Afficher options comme boutons
  - Highlight sélection
  - Descriptions optionnelles
- [ ] Gérer type `multi-choice`:
  - Checkboxes pour sélection multiple
  - Gérer array de values
- [ ] Gérer type `text`:
  - Input text simple
- [ ] Gérer type `info`:
  - Bloc informatif (pas interactif)
- [ ] Props: `question`, `value`, `onChange`
- [ ] Design mobile-friendly (touch targets ≥44px)

#### 5.5 Composants Utilitaires
- [ ] **QuestionCard** (`src/components/QuestionCard.tsx`):
  - Wrapper avec titre + description + children
  - Card style avec shadow
- [ ] **ProgressBar** (`src/components/ProgressBar.tsx`):
  - Barre horizontale 0-100%
  - Animation smooth
  - Couleur TerraStab blue
- [ ] **RiskBadge** (`src/components/RiskBadge.tsx`):
  - Affiche emoji + label
  - Couleurs conditionnelles (vert/jaune/orange/rouge)
  - Props: `level: RiskLevel`
- [ ] **Button** (`src/components/Button.tsx`):
  - Variants: primary, secondary
  - États: disabled, loading
  - Styles consistants

### Livrables
- [ ] Page Home complète et attractive
- [ ] Wizard questionnaire fonctionnel (navigation, validation, calcul)
- [ ] Page Résultats complète avec toutes les infos
- [ ] Tous les composants réutilisables créés
- [ ] Design mobile-first validé

### Fichiers à créer/modifier
- `src/pages/Home.tsx` (remplacer)
- `src/pages/Diagnostic.tsx` (remplacer)
- `src/pages/Result.tsx` (remplacer)
- `src/components/QuestionRenderer.tsx`
- `src/components/QuestionCard.tsx`
- `src/components/ProgressBar.tsx`
- `src/components/RiskBadge.tsx`
- `src/components/Button.tsx`

---

## Phase 6: Styling & Polish ⏳ À FAIRE

**Durée estimée:** 1-2 jours | **Statut:** ⏳ En attente

### Objectifs
Peaufiner le design, optimiser mobile, améliorer UX

### Tâches principales

#### 6.1 Design Mobile-First
- [ ] Tester sur iPhone (Safari)
- [ ] Tester sur Android (Chrome)
- [ ] Vérifier touch targets (≥44px)
- [ ] Vérifier scrolling fluide
- [ ] Tester clavier virtuel (ne cache pas inputs)
- [ ] Safe areas pour notch iPhone

#### 6.2 Améliorations UI/UX
- [ ] Transitions CSS smooth
- [ ] Loading states
- [ ] Feedback visuel sur actions (hover, active)
- [ ] Messages d'erreur user-friendly
- [ ] Tooltips si nécessaire
- [ ] Animations subtiles (fade-in, slide)

#### 6.3 Accessibilité
- [ ] Labels ARIA
- [ ] Navigation clavier
- [ ] Contraste couleurs (WCAG AA minimum)
- [ ] Focus visible

#### 6.4 Performance
- [ ] Images optimisées (si ajoutées)
- [ ] Lazy loading si nécessaire
- [ ] Code splitting par route (déjà fait par Vite)
- [ ] Vérifier bundle size (<500KB gzipped)

### Livrables
- [ ] Design cohérent sur tous les écrans
- [ ] Mobile parfaitement utilisable
- [ ] Accessibilité de base respectée
- [ ] Performance optimale

---

## Phase 7: Déploiement Vercel ⏳ À FAIRE

**Durée estimée:** 1 jour | **Statut:** ⏳ En attente

### Objectifs
Déployer l'application en production sur Vercel

### Tâches principales

#### 7.1 Configuration Vercel
- [ ] Créer `vercel.json`:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- [ ] Committer et pousser sur GitHub

#### 7.2 Import Projet dans Vercel
- [ ] Aller sur https://vercel.com/new
- [ ] Importer `AltoPal0/rga-diagnostic`
- [ ] Configurer:
  - Framework Preset: **Vite**
  - Root Directory: **/**
  - Build Command: **npm run build**
  - Output Directory: **dist**
  - Install Command: **npm install**

#### 7.3 Variables d'Environnement
- [ ] Dans Vercel Dashboard, ajouter:
  - `VITE_SUPABASE_URL` = https://sddrgyovjahxigysblra.supabase.co
  - `VITE_SUPABASE_ANON_KEY` = [clé]
- [ ] Configurer pour tous les environnements (Production, Preview, Development)

#### 7.4 Déploiement Initial
- [ ] Lancer premier déploiement
- [ ] Attendre build (devrait réussir)
- [ ] Vérifier URL assignée (ex: rga-diagnostic.vercel.app)
- [ ] Tester application en production

#### 7.5 Tests Post-Déploiement
- [ ] Tester routing (toutes les pages)
- [ ] Tester questionnaire complet
- [ ] Vérifier soumission Supabase
- [ ] Tester sur mobile (URL réelle)
- [ ] Vérifier variables env chargées
- [ ] Tester performance (Lighthouse)

### Livrables
- [ ] Application live sur Vercel
- [ ] URL de production fonctionnelle
- [ ] Variables env configurées
- [ ] Build automatique sur push GitHub

---

## Phase 8: Tests & Validation Finale ⏳ À FAIRE

**Durée estimée:** 1-2 jours | **Statut:** ⏳ En attente

### Objectifs
Valider que tout fonctionne correctement selon specs

### Tâches principales

#### 8.1 Tests Fonctionnels

##### Flow Complet
- [ ] Landing → Start → Questions → Résultats
- [ ] Reprendre diagnostic sauvegardé
- [ ] Navigation Précédent/Suivant
- [ ] Questions conditionnelles apparaissent/disparaissent
- [ ] Retour en arrière et modification réponses
- [ ] Progression sauvegardée dans localStorage
- [ ] Refresh page mid-questionnaire (reprend au bon endroit)

##### Scoring
- [ ] Tester cas "Risque Faible" (score 0-20)
- [ ] Tester cas "Risque Modéré" (score 21-40)
- [ ] Tester cas "Risque Élevé" (score 41-60)
- [ ] Tester cas "Risque Très Élevé" (score 61-100)
- [ ] Valider règles de scoring contre knowledge/04-QUESTIONNAIRE-RGA-GUIDE-COMPLET.md:
  - [ ] Fondations <0.80m = +8pts
  - [ ] Aléa fort = +20pts
  - [ ] Arbres <5m = +10pts
  - [ ] Pas de drainage = +8pts
  - [ ] Fuite active = +10pts
  - [ ] Lézardes >5mm = +10pts
- [ ] Vérifier breakdown (max: 20+30+30+20 = 100)

##### Recommandations
- [ ] Survey toujours compatible (tous les cas)
- [ ] Shield compatible si fondations ≤1.50m
- [ ] Shield incompatible si fondations >1.50m (vérifier message raison)
- [ ] Shield incompatible si fondations inconnues
- [ ] Actions prioritaires générées correctement:
  - [ ] Drainage si absence
  - [ ] Gouttières si au pied
  - [ ] Arbres si trop proches
  - [ ] Fuites si actives
  - [ ] Fissures si >5mm

##### Persistance
- [ ] localStorage sauvegarde answers
- [ ] Supabase INSERT réussit
- [ ] Diagnostic ID retourné
- [ ] Vérifier données dans Supabase Dashboard
- [ ] Tester sans network (localStorage fonctionne, Supabase échoue gracieusement)

#### 8.2 Tests Mobile
- [ ] iPhone (Safari iOS)
- [ ] Android (Chrome)
- [ ] Tablette iPad
- [ ] Touch interactions fluides
- [ ] Pas de zoom involontaire
- [ ] Clavier ne cache pas inputs
- [ ] Scroll smooth

#### 8.3 Tests Cross-Browser
- [ ] Chrome desktop
- [ ] Safari desktop
- [ ] Firefox desktop
- [ ] Edge desktop

#### 8.4 Tests Performance
- [ ] Lighthouse audit:
  - [ ] Performance >90
  - [ ] Accessibility >90
  - [ ] Best Practices >90
  - [ ] SEO >90
- [ ] Bundle size <500KB gzipped
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <3s

#### 8.5 Tests Edge Cases
- [ ] Répondre "Inconnu" à toutes les questions optionnelles
- [ ] Très rapide (<1 min) - vérifier completion_time
- [ ] Très lent (>1h) - vérifier pas de timeout localStorage
- [ ] Soumettre 2x le même diagnostic
- [ ] Clear localStorage mid-questionnaire
- [ ] Désactiver JavaScript (erreur gracieuse)

#### 8.6 Validation Documentation
- [ ] Toutes les 27 questions présentes
- [ ] Questions correspondent à knowledge/03-QUESTIONNAIRE-RGA-LISTE-QUESTIONS.md
- [ ] Scoring correspond à knowledge/04-QUESTIONNAIRE-RGA-GUIDE-COMPLET.md
- [ ] Risk tiers correspondent à knowledge/02-QUESTIONNAIRE-RGA-RESUME-1PAGE.md
- [ ] Version questionnaire = v1.0

### Livrables
- [ ] Checklist complète validée
- [ ] Bugs critiques corrigés
- [ ] Performance optimale
- [ ] Documentation à jour

---

## Critères de Succès Globaux

### Technique
- [x] Build sans erreurs TypeScript ✅
- [ ] Bundle <500KB gzipped
- [ ] Lighthouse score >90 (tous critères)
- [ ] Fonctionne offline (sauf submission)
- [ ] Mobile responsive parfait

### Fonctionnel
- [ ] 27 questions complètes et fonctionnelles
- [ ] Logique conditionnelle correcte
- [ ] Scoring précis (validé contre docs)
- [ ] Recommandations TerraStab correctes
- [ ] Persistence localStorage OK
- [ ] Submission Supabase OK

### Déploiement
- [x] Code sur GitHub ✅
- [ ] Déployé sur Vercel
- [ ] Variables env configurées
- [ ] SSL actif
- [ ] Pas d'erreurs console

### Business
- [ ] Tous les critères knowledge/01-LireEnPremier.md respectés
- [ ] Shield compatible uniquement si fondations ≤1.50m
- [ ] Survey toujours compatible
- [ ] Questionnaire version v1.0
- [ ] Temps moyen 8-12 minutes

---

## Fichiers Clés à Créer (Récapitulatif)

### Configuration (Phase 1) ✅
- [x] package.json
- [x] tsconfig.json
- [x] vite.config.ts
- [x] tailwind.config.js
- [x] .env.local

### Utilitaires (Phases 2 & 4)
- [ ] src/utils/supabase.ts
- [ ] src/utils/storage.ts

### Engine (Phase 3) ⭐ CRITIQUE
- [ ] src/engine/types.ts
- [ ] src/engine/config.ts (⭐ très important, 500+ lignes)
- [ ] src/engine/visibility.ts
- [ ] src/engine/scoring.ts
- [ ] src/engine/riskTier.ts
- [ ] src/engine/recommendations.ts

### State (Phase 4)
- [ ] src/store/useDiagnosticStore.ts

### Pages (Phase 5)
- [ ] src/pages/Home.tsx (à compléter)
- [ ] src/pages/Diagnostic.tsx (à compléter)
- [ ] src/pages/Result.tsx (à compléter)

### Components (Phase 5)
- [ ] src/components/QuestionRenderer.tsx
- [ ] src/components/QuestionCard.tsx
- [ ] src/components/ProgressBar.tsx
- [ ] src/components/RiskBadge.tsx
- [ ] src/components/Button.tsx

### Déploiement (Phase 7)
- [ ] vercel.json

---

## Notes Importantes

### Contraintes à Respecter
- ❌ Ne PAS toucher aux tables Supabase existantes
- ❌ Ne PAS modifier le site TerraStab principal
- ✅ Application 100% indépendante
- ✅ Calcul frontend (pas de backend)
- ✅ MVP scope (pas d'auth, pas de PDF, pas d'admin)

### Décisions Techniques Clés
1. **Data-driven questionnaire** - Toute la logique dans config.ts
2. **Frontend scoring** - Calcul côté client pour vitesse et simplicité
3. **Zustand + localStorage** - State management léger avec persistence
4. **Supabase write-only** - INSERT uniquement, pas de SELECT public
5. **Mobile-first** - Design pensé pour téléphone en priorité

### Références Métier
- `knowledge/01-LireEnPremier.md` - Vue d'ensemble
- `knowledge/02-QUESTIONNAIRE-RGA-RESUME-1PAGE.md` - Synthèse scoring
- `knowledge/03-QUESTIONNAIRE-RGA-LISTE-QUESTIONS.md` - Liste questions
- `knowledge/04-QUESTIONNAIRE-RGA-GUIDE-COMPLET.md` - Règles détaillées ⭐
- `specs/product.md` - Spécifications techniques

---

**Document créé:** 5 janvier 2025
**Version:** 1.0
**Dernière mise à jour:** Phase 1 complétée
