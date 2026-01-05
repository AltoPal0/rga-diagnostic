/**
 * RGA Diagnostic Questionnaire Configuration
 *
 * This file contains the complete questionnaire structure, scoring rules,
 * and visibility conditions. All business logic is data-driven from this config.
 *
 * References:
 * - knowledge/03-QUESTIONNAIRE-RGA-LISTE-QUESTIONS.md
 * - knowledge/04-QUESTIONNAIRE-RGA-GUIDE-COMPLET.md
 */

import { Question, Section } from './types'

/**
 * Questionnaire version
 */
export const QUESTIONNAIRE_VERSION = 'v1.0'

/**
 * Sections of the questionnaire
 */
export const sections: Section[] = [
  { id: 'identification', name: 'Identification', order: 1 },
  { id: 'exposure', name: 'Exposition RGA', order: 2 },
  { id: 'vegetation', name: 'Végétation', order: 3 },
  { id: 'rainwater', name: 'Eaux Pluviales', order: 4 },
  { id: 'networks', name: 'Réseaux', order: 5 },
  { id: 'damage', name: 'Désordres', order: 6 },
  { id: 'site', name: 'Contraintes Terrain', order: 7 },
]

/**
 * Complete questionnaire - 27 questions
 * Based on CEREMA recommendations and DTU 13.12
 */
export const questions: Question[] = [
  // ========================================================================
  // SECTION 1: IDENTIFICATION
  // ========================================================================

  {
    id: 'q1_foundation_type',
    section: 'identification',
    text: 'Quel est le type de fondations de votre maison ?',
    description: 'Information sur le système de fondation. Si inconnu, sélectionnez "Inconnu".',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'semelles', label: 'Semelles superficielles' },
      { value: 'dallage', label: 'Dallage' },
      { value: 'vide_sanitaire', label: 'Vide sanitaire' },
      { value: 'micropieux', label: 'Micropieux' },
      { value: 'inconnu', label: 'Inconnu' },
    ],
    scoringRules: [
      {
        category: 'predisposition',
        conditions: [
          { value: 'semelles', points: 10 },
          { value: 'dallage', points: 10 },
          { value: 'vide_sanitaire', points: 5 },
          { value: 'micropieux', points: 0 },
          { value: 'inconnu', points: 5 }, // Conservative estimate
        ],
      },
    ],
  },

  {
    id: 'q2_foundation_depth',
    section: 'identification',
    text: 'Quelle est la profondeur des fondations ?',
    description: 'Information critique pour la compatibilité TerraStab Shield (≤1,50m requis)',
    type: 'single-choice',
    required: true,
    visibilityConditions: [
      {
        questionId: 'q1_foundation_type',
        operator: 'not_equals',
        value: 'inconnu',
      },
    ],
    options: [
      { value: '<0.80', label: 'Moins de 0,80 m' },
      { value: '0.80-1.50', label: 'Entre 0,80 et 1,50 m' },
      { value: '>1.50', label: 'Plus de 1,50 m' },
      { value: 'inconnu', label: 'Inconnu' },
    ],
    scoringRules: [
      {
        category: 'predisposition',
        conditions: [
          { value: '<0.80', points: 8 },     // Zone d'influence RGA ≈ 1,50m
          { value: '0.80-1.50', points: 5 },
          { value: '>1.50', points: 0 },     // Hors zone d'influence
          { value: 'inconnu', points: 5 },
        ],
      },
    ],
  },

  {
    id: 'q3_construction_year',
    section: 'identification',
    text: 'Année de construction de la maison',
    description: 'Les constructions récentes intègrent généralement mieux les normes anti-RGA',
    type: 'single-choice',
    required: true,
    options: [
      { value: '<1980', label: 'Avant 1980' },
      { value: '1980-2000', label: '1980-2000' },
      { value: '2000-2020', label: '2000-2020' },
      { value: '>2020', label: 'Après 2020' },
    ],
    scoringRules: [
      {
        category: 'predisposition',
        conditions: [
          { value: '<1980', points: 5 },     // Moins de sensibilisation au RGA
          { value: '1980-2000', points: 3 },
          { value: '2000-2020', points: 1 },
          { value: '>2020', points: 0 },     // Normes RGA intégrées
        ],
      },
    ],
  },

  {
    id: 'q4_building_levels',
    section: 'identification',
    text: 'Nombre de niveaux du bâtiment',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'rdc', label: 'RDC seul' },
      { value: 'rdc+1', label: 'RDC + 1 étage' },
      { value: 'rdc+2plus', label: 'RDC + 2 étages ou plus' },
      { value: 'sous-sol', label: 'Avec sous-sol ou vide sanitaire' },
    ],
    scoringRules: [
      {
        category: 'predisposition',
        conditions: [
          { value: 'rdc', points: 2 },
          { value: 'rdc+1', points: 3 },
          { value: 'rdc+2plus', points: 4 },  // Plus de poids sur fondations
          { value: 'sous-sol', points: 1 },    // Fondations généralement plus profondes
        ],
      },
    ],
  },

  {
    id: 'q5_building_type',
    section: 'identification',
    text: 'Type de bâtiment',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'maison_individuelle', label: 'Maison individuelle' },
      { value: 'mitoyenne', label: 'Maison mitoyenne' },
      { value: 'extension', label: 'Extension ou garage' },
    ],
  },

  // ========================================================================
  // SECTION 2: EXPOSITION RGA
  // ========================================================================

  {
    id: 'q6_georisques_level',
    section: 'exposure',
    text: 'Niveau d\'aléa RGA selon Géorisques',
    description: 'Consultez georisques.gouv.fr avec votre adresse pour connaître le niveau d\'aléa',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'faible', label: 'Aléa faible' },
      { value: 'moyen', label: 'Aléa moyen' },
      { value: 'fort', label: 'Aléa fort' },
      { value: 'inconnu', label: 'Je ne sais pas' },
    ],
    scoringRules: [
      {
        category: 'exposure',
        conditions: [
          { value: 'faible', points: 0 },
          { value: 'moyen', points: 10 },
          { value: 'fort', points: 20 },     // Maximum pour cette catégorie
          { value: 'inconnu', points: 10 },  // Conservative
        ],
      },
    ],
  },

  {
    id: 'q7_soil_type',
    section: 'exposure',
    text: 'Type de sol (si connu)',
    description: 'Cette information est optionnelle mais aide à affiner le diagnostic',
    type: 'single-choice',
    required: false,
    options: [
      { value: 'argile', label: 'Argile', description: 'Sol très sensible au RGA' },
      { value: 'limons', label: 'Limons', description: 'Sol moyennement sensible' },
      { value: 'sable', label: 'Sable', description: 'Sol peu sensible au RGA' },
      { value: 'mixte', label: 'Mixte' },
      { value: 'inconnu', label: 'Inconnu' },
    ],
    // Informational only - no scoring
  },

  // ========================================================================
  // SECTION 3: VÉGÉTATION
  // ========================================================================

  {
    id: 'q8_trees_present',
    section: 'vegetation',
    text: 'Y a-t-il des arbres ou haies à moins de 10m de la maison ?',
    description: 'Les racines peuvent assécher le sol et aggraver le RGA',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'oui', label: 'Oui' },
      { value: 'non', label: 'Non' },
    ],
  },

  {
    id: 'q9_trees_distance',
    section: 'vegetation',
    text: 'Distance des arbres par rapport aux fondations',
    description: 'Distance réglementaire = 1,5 × hauteur adulte de l\'arbre',
    type: 'single-choice',
    required: true,
    visibilityConditions: [
      {
        questionId: 'q8_trees_present',
        operator: 'equals',
        value: 'oui',
      },
    ],
    options: [
      {
        value: 'conforme',
        label: 'Conforme (>1,5 × hauteur)',
        description: 'Distance respectée selon la réglementation',
      },
      {
        value: '5-8m',
        label: 'Non conforme (5-8m)',
        description: 'Trop proche, risque modéré',
      },
      {
        value: '<5m',
        label: 'Très proche (<5m)',
        description: 'Risque élevé d\'assèchement du sol',
      },
    ],
    scoringRules: [
      {
        category: 'aggravating',
        conditions: [
          { value: 'conforme', points: 0 },
          { value: '5-8m', points: 8 },
          { value: '<5m', points: 10 },
        ],
      },
    ],
  },

  {
    id: 'q10_root_barrier',
    section: 'vegetation',
    text: 'Écran anti-racines installé ?',
    description: 'Un écran anti-racines protège les fondations',
    type: 'single-choice',
    required: true,
    visibilityConditions: [
      {
        questionId: 'q8_trees_present',
        operator: 'equals',
        value: 'oui',
      },
    ],
    options: [
      { value: 'non', label: 'Non' },
      { value: 'partiel', label: 'Partiel' },
      { value: 'complet', label: 'Complet' },
    ],
    scoringRules: [
      {
        category: 'aggravating',
        conditions: [
          { value: 'non', points: 0 },
          { value: 'partiel', points: -2 },   // Bonus
          { value: 'complet', points: -5 },   // Bonus
        ],
      },
    ],
  },

  // ========================================================================
  // SECTION 4: EAUX PLUVIALES
  // ========================================================================

  {
    id: 'q11_drainage',
    section: 'rainwater',
    text: 'Système de drainage périphérique',
    description: 'Un drainage autour des fondations évacue les eaux et stabilise l\'humidité du sol',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'oui', label: 'Oui, fonctionnel' },
      { value: 'non', label: 'Non' },
      { value: 'inconnu', label: 'Inconnu' },
    ],
    scoringRules: [
      {
        category: 'aggravating',
        conditions: [
          { value: 'oui', points: 0 },
          { value: 'non', points: 8 },        // Facteur aggravant majeur
          { value: 'inconnu', points: 4 },
        ],
      },
    ],
  },

  {
    id: 'q12_gutters',
    section: 'rainwater',
    text: 'Descentes de gouttières',
    description: 'L\'évacuation des eaux pluviales doit être éloignée des fondations',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'reseau', label: 'Raccordées au réseau' },
      { value: '>1m', label: 'Rejet à plus d\'1m des fondations' },
      { value: 'pied', label: 'Rejet au pied des fondations' },
    ],
    scoringRules: [
      {
        category: 'aggravating',
        conditions: [
          { value: 'reseau', points: 0 },
          { value: '>1m', points: 0 },
          { value: 'pied', points: 5 },       // Infiltration près des fondations
        ],
      },
    ],
  },

  {
    id: 'q13_water_stagnation',
    section: 'rainwater',
    text: 'Stagnation d\'eau près des fondations',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'jamais', label: 'Jamais' },
      { value: 'rare', label: 'Rare (après fortes pluies)' },
      { value: 'frequente', label: 'Fréquente' },
      { value: 'permanente', label: 'Permanente' },
    ],
    scoringRules: [
      {
        category: 'aggravating',
        conditions: [
          { value: 'jamais', points: 0 },
          { value: 'rare', points: 2 },
          { value: 'frequente', points: 5 },
          { value: 'permanente', points: 8 },
        ],
      },
    ],
  },

  // ========================================================================
  // SECTION 5: RÉSEAUX
  // ========================================================================

  {
    id: 'q14_network_leaks',
    section: 'networks',
    text: 'Fuites de réseaux (eau, assainissement)',
    description: 'Une fuite active crée des variations d\'humidité importantes',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'non', label: 'Aucune fuite connue' },
      { value: 'reparee', label: 'Fuite réparée' },
      { value: 'active', label: 'Fuite active non réparée' },
    ],
    scoringRules: [
      {
        category: 'aggravating',
        conditions: [
          { value: 'non', points: 0 },
          { value: 'reparee', points: 2 },
          { value: 'active', points: 10 },    // Facteur aggravant majeur
        ],
      },
    ],
  },

  // ========================================================================
  // SECTION 6: DÉSORDRES
  // ========================================================================

  {
    id: 'q15_facade_cracks',
    section: 'damage',
    text: 'Fissures sur les façades',
    description: 'Largeur maximale observée. Les lézardes >5mm indiquent des mouvements importants.',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'aucune', label: 'Aucune fissure visible' },
      { value: '<0.2mm', label: 'Microfissures (<0,2mm)', description: 'Faïençage normal' },
      { value: '0.2-2mm', label: 'Fissures fines (0,2-2mm)', description: 'À surveiller' },
      { value: '2-5mm', label: 'Fissures (2-5mm)', description: 'Attention requise' },
      { value: '>5mm', label: 'Lézardes (>5mm)', description: 'Désordre important' },
    ],
    scoringRules: [
      {
        category: 'damage',
        conditions: [
          { value: 'aucune', points: 0 },
          { value: '<0.2mm', points: 0 },     // Normal
          { value: '0.2-2mm', points: 3 },
          { value: '2-5mm', points: 6 },
          { value: '>5mm', points: 10 },      // Désordre majeur
        ],
      },
    ],
  },

  {
    id: 'q16_blocked_openings',
    section: 'damage',
    text: 'Portes ou fenêtres difficiles à ouvrir/fermer',
    description: 'Signe de déformations de la structure',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'non', label: 'Non, tout fonctionne normalement' },
      { value: 'occasionnel', label: 'Occasionnel (variations saisonnières)' },
      { value: 'frequent', label: 'Fréquent ou permanent' },
    ],
    scoringRules: [
      {
        category: 'damage',
        conditions: [
          { value: 'non', points: 0 },
          { value: 'occasionnel', points: 3 },
          { value: 'frequent', points: 7 },
        ],
      },
    ],
  },

  // ========================================================================
  // SECTION 7: CONTRAINTES TERRAIN
  // ========================================================================

  {
    id: 'q17_terrace',
    section: 'site',
    text: 'Terrasse collée à la maison',
    description: 'Information logistique pour l\'intervention TerraStab',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'non', label: 'Non' },
      { value: 'oui', label: 'Oui' },
    ],
    // No scoring - logistical info only
  },

  {
    id: 'q18_pool',
    section: 'site',
    text: 'Piscine à moins de 3m de la maison',
    description: 'Peut créer des infiltrations d\'eau',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'non', label: 'Non' },
      { value: 'oui', label: 'Oui' },
    ],
    scoringRules: [
      {
        category: 'aggravating',
        conditions: [
          { value: 'non', points: 0 },
          { value: 'oui', points: 5 },        // Potentielle infiltration
        ],
      },
    ],
  },

  {
    id: 'q19_access',
    section: 'site',
    text: 'Accès au terrain',
    description: 'Information logistique pour l\'intervention TerraStab',
    type: 'single-choice',
    required: true,
    options: [
      { value: 'large', label: 'Large (>2m)' },
      { value: 'etroit', label: 'Étroit (<2m)' },
      { value: 'difficile', label: 'Très difficile' },
    ],
    // No scoring - logistical info only
  },
]

/**
 * Get questions by section
 */
export function getQuestionsBySection(sectionId: string): Question[] {
  return questions.filter(q => q.section === sectionId)
}

/**
 * Get a specific question by ID
 */
export function getQuestionById(questionId: string): Question | undefined {
  return questions.find(q => q.id === questionId)
}

/**
 * Get total number of questions
 */
export function getTotalQuestions(): number {
  return questions.length
}
