## 🚀 DÉPLOIEMENT — INTÉGRATION VERCEL (CONTRAINTE FORTE)

Le site TerraStab principal est actuellement déployé **depuis la racine du repository GitHub** et **ne doit en aucun cas être modifié**.

### Règles impératives
- ❌ Ne PAS déplacer le code existant du site TerraStab
- ❌ Ne PAS modifier la configuration du projet Vercel existant
- ❌ Ne PAS changer le Root Directory du projet Vercel principal
- ❌ Ne PAS partager de variables d’environnement entre projets

### Stratégie validée
- ✅ Conserver le site TerraStab **à la racine du repository**
- ✅ Ajouter la nouvelle application dans un **sous-dossier dédié**
- ✅ Créer un **nouveau projet Vercel distinct** pointant vers ce sous-dossier

### Structure cible du repository
/
├── (site TerraStab existant — racine, inchangé)
└── apps
    └── rga-diagnostic   ← nouvelle application React (ce projet)

### Déploiement
- Le projet Vercel existant continue de déployer la racine `/`
- Le nouveau projet Vercel déploie uniquement `/apps/rga-diagnostic`
- Chaque projet possède :
  - son propre pipeline de build
  - ses propres variables d’environnement

⚠️ Toute modification impactant le projet Vercel principal est strictement interdite dans le cadre de ce projet.

### Coding Preferences
- **Fallbacks**: IMPORTANT - Never use fallbacks. If it fails, proper error needs to be displayed as we are in development
- **Git Push Policy**: CRITICAL - ALWAYS ask user permission before pushing to remote repository. Never run `git push` without explicit user approval.
- **State Management**: Use CustomerJourneyContext for customer journey state, props for component-local state
- **Type Safety**: All API responses must have TypeScript types defined
- **Error Handling**: Display user-friendly errors, log technical details to console

## 🤖 DIRECTIVE 

- Utiliser le MCP Supabase pour toute proposition liée :
  - au schéma de base de données
  - aux politiques RLS
  - aux Edge Functions
- Ne pas supposer l’existence d’un backend applicatif séparé
- Considérer Supabase comme l’unique backend de production

## 🤖 DIRECTIVES EXPLICITES POUR CLAUDE CODE

- Toujours considérer le projet Supabase `terrastab` (ref: sddrgyovjahxigysblra) comme EXISTANT
- Ne jamais supposer une base vide
- Vérifier l’existant avant toute proposition SQL
- Ne proposer QUE des ajouts non destructifs
- Ne jamais hardcoder de clés ou secrets