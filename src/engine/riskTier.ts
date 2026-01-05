/**
 * Risk Tier Interpretation
 *
 * Converts numerical scores into risk levels and provides
 * human-readable labels and interpretations.
 *
 * Risk levels based on total score:
 * - Faible (Low): 0-20 points 🟢
 * - Modéré (Moderate): 21-40 points 🟡
 * - Élevé (High): 41-60 points 🟠
 * - Très élevé (Very High): 61-100 points 🔴
 *
 * Reference: knowledge/02-QUESTIONNAIRE-RGA-RESUME-1PAGE.md
 */

import { RiskLevel } from './types'

/**
 * Get risk level from total score
 *
 * @param totalScore - Total score (0-100)
 * @returns Risk level
 */
export function getRiskLevel(totalScore: number): RiskLevel {
  if (totalScore <= 20) return 'faible'
  if (totalScore <= 40) return 'modere'
  if (totalScore <= 60) return 'eleve'
  return 'tres_eleve'
}

/**
 * Get French label for risk level
 *
 * @param level - Risk level
 * @returns French label
 */
export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    faible: 'Faible',
    modere: 'Modéré',
    eleve: 'Élevé',
    tres_eleve: 'Très élevé',
  }
  return labels[level]
}

/**
 * Get emoji for risk level
 *
 * @param level - Risk level
 * @returns Emoji character
 */
export function getRiskEmoji(level: RiskLevel): string {
  const emojis: Record<RiskLevel, string> = {
    faible: '🟢',
    modere: '🟡',
    eleve: '🟠',
    tres_eleve: '🔴',
  }
  return emojis[level]
}

/**
 * Get color name for risk level (for CSS classes)
 *
 * @param level - Risk level
 * @returns Color name
 */
export function getRiskColor(level: RiskLevel): 'green' | 'yellow' | 'orange' | 'red' {
  const colors: Record<RiskLevel, 'green' | 'yellow' | 'orange' | 'red'> = {
    faible: 'green',
    modere: 'yellow',
    eleve: 'orange',
    tres_eleve: 'red',
  }
  return colors[level]
}

/**
 * Get score range for a risk level
 *
 * @param level - Risk level
 * @returns Score range as string
 */
export function getScoreRange(level: RiskLevel): string {
  const ranges: Record<RiskLevel, string> = {
    faible: '0-20',
    modere: '21-40',
    eleve: '41-60',
    tres_eleve: '61-100',
  }
  return ranges[level]
}

/**
 * Get detailed interpretation text for risk level
 *
 * @param level - Risk level
 * @returns Detailed interpretation in French
 */
export function getRiskInterpretation(level: RiskLevel): string {
  const interpretations: Record<RiskLevel, string> = {
    faible: 'Votre maison présente un **risque faible** face au retrait-gonflement des argiles. Les conditions actuelles sont favorables, mais une surveillance préventive reste recommandée pour maintenir cette situation.',

    modere: 'Votre maison présente un **risque modéré**. Certains facteurs de vulnérabilité ont été identifiés. Des mesures préventives ciblées permettront d\'éviter l\'apparition ou l\'aggravation de désordres.',

    eleve: 'Votre maison présente un **risque élevé**. Plusieurs facteurs de vulnérabilité importants ont été détectés. Des travaux préventifs sont fortement recommandés pour protéger votre habitation contre les mouvements de terrain.',

    tres_eleve: '⚠️ **ATTENTION** : Votre maison présente un **risque très élevé**. Les conditions sont critiques et nécessitent une intervention rapide pour éviter des dommages structurels importants. Un diagnostic professionnel est impératif.',
  }
  return interpretations[level]
}

/**
 * Get action recommendation based on risk level
 *
 * @param level - Risk level
 * @returns Action recommendation in French
 */
export function getActionRecommendation(level: RiskLevel): string {
  const actions: Record<RiskLevel, string> = {
    faible: 'Surveillance visuelle régulière de votre habitation.',

    modere: 'Prévention ciblée sur les facteurs identifiés. Diagnostic TerraStab Survey recommandé.',

    eleve: 'Travaux prioritaires à engager rapidement. Diagnostic TerraStab Survey + Shield recommandés.',

    tres_eleve: 'URGENCE : Intervention immédiate nécessaire. Diagnostic TerraStab Survey + Shield impératifs.',
  }
  return actions[level]
}

/**
 * Check if risk level requires immediate action
 *
 * @param level - Risk level
 * @returns true if immediate action required
 */
export function requiresImmediateAction(level: RiskLevel): boolean {
  return level === 'eleve' || level === 'tres_eleve'
}

/**
 * Get all information for a risk level
 *
 * @param level - Risk level
 * @returns Complete risk information
 */
export function getRiskInfo(level: RiskLevel) {
  return {
    level,
    label: getRiskLabel(level),
    emoji: getRiskEmoji(level),
    color: getRiskColor(level),
    scoreRange: getScoreRange(level),
    interpretation: getRiskInterpretation(level),
    actionRecommendation: getActionRecommendation(level),
    requiresImmediateAction: requiresImmediateAction(level),
  }
}
