/**
 * Recommendations Engine
 *
 * Generates TerraStab product recommendations and priority actions
 * based on user answers and calculated risk level.
 *
 * Key rules:
 * - TerraStab Survey: ALWAYS compatible (all foundation types)
 * - TerraStab Shield: Compatible ONLY if foundation depth ≤ 1.50m
 *
 * Reference: knowledge/02-QUESTIONNAIRE-RGA-RESUME-1PAGE.md
 */

import { Answers, Recommendations, RiskLevel } from './types'
import { getRiskInterpretation } from './riskTier'

/**
 * Generate complete recommendations based on diagnostic results
 *
 * @param answers - User answers
 * @param riskLevel - Calculated risk level
 * @returns Complete recommendations
 */
export function generateRecommendations(
  answers: Answers,
  riskLevel: RiskLevel
): Recommendations {
  // Determine Shield compatibility based on foundation depth
  const foundationDepth = answers['q2_foundation_depth'] as string
  const shieldCompatible = isShieldCompatible(foundationDepth)

  // Generate priority actions based on answers and risk level
  const priorityActions = generatePriorityActions(answers, riskLevel)

  // Generate complete interpretation text
  const interpretation = generateInterpretation(riskLevel, shieldCompatible)

  return {
    survey_compatible: true, // Always compatible
    shield_compatible: shieldCompatible,
    shield_reason: shieldCompatible
      ? undefined
      : getShieldIncompatibilityReason(foundationDepth),
    priority_actions: priorityActions,
    interpretation,
  }
}

/**
 * Check if TerraStab Shield is compatible
 * Shield is only compatible if foundation depth ≤ 1.50m
 *
 * @param foundationDepth - Foundation depth answer
 * @returns true if Shield is compatible
 */
function isShieldCompatible(foundationDepth: string | undefined): boolean {
  if (!foundationDepth || foundationDepth === 'inconnu') {
    return false // Conservative: unknown depth = not compatible
  }

  // Shield compatible only for shallow foundations
  return foundationDepth === '<0.80' || foundationDepth === '0.80-1.50'
}

/**
 * Get reason why Shield is not compatible
 *
 * @param foundationDepth - Foundation depth answer
 * @returns Explanation text in French
 */
function getShieldIncompatibilityReason(foundationDepth: string | undefined): string {
  if (!foundationDepth || foundationDepth === 'inconnu') {
    return 'Profondeur des fondations inconnue. TerraStab Shield nécessite des fondations ≤ 1,50m pour être efficace.'
  }

  if (foundationDepth === '>1.50') {
    return 'Fondations trop profondes (>1,50m). TerraStab Shield est efficace uniquement pour les fondations peu profondes (≤ 1,50m) situées dans la zone d\'influence hydrique du sol.'
  }

  return 'Non compatible avec vos fondations.'
}

/**
 * Generate priority actions based on answers
 *
 * @param answers - User answers
 * @param riskLevel - Risk level
 * @returns List of priority actions in French
 */
function generatePriorityActions(
  answers: Answers,
  riskLevel: RiskLevel
): string[] {
  const actions: string[] = []

  // CRITICAL: Active leak
  if (answers['q14_network_leaks'] === 'active') {
    actions.push('🚨 URGENT : Réparer immédiatement les fuites de réseaux actives')
  }

  // HIGH PRIORITY: Drainage
  if (answers['q11_drainage'] === 'non') {
    actions.push('Installer un drainage périphérique autour des fondations pour évacuer les eaux pluviales')
  }

  // HIGH PRIORITY: Gutters at foundation
  if (answers['q12_gutters'] === 'pied') {
    actions.push('Éloigner les descentes de gouttières à plus d\'1m des fondations (ou raccorder au réseau)')
  }

  // HIGH PRIORITY: Water stagnation
  if (answers['q13_water_stagnation'] === 'frequente' ||
      answers['q13_water_stagnation'] === 'permanente') {
    actions.push('Corriger les problèmes de stagnation d\'eau près des fondations (pente, drainage)')
  }

  // Trees too close
  if (answers['q9_trees_distance'] === '<5m' || answers['q9_trees_distance'] === '5-8m') {
    const distance = answers['q9_trees_distance'] === '<5m' ? 'très proches (<5m)' : 'trop proches (5-8m)'
    actions.push(`Élaguer ou supprimer les arbres ${distance}. Distance minimale requise : 1,5 × hauteur adulte de l'arbre`)
  }

  // Root barrier
  if (answers['q8_trees_present'] === 'oui' && answers['q10_root_barrier'] === 'non') {
    actions.push('Installer un écran anti-racines le long des fondations exposées aux arbres')
  }

  // Major cracks
  if (answers['q15_facade_cracks'] === '>5mm') {
    actions.push('Faire expertiser les lézardes (>5mm) par un professionnel du bâtiment')
  } else if (answers['q15_facade_cracks'] === '2-5mm') {
    actions.push('Surveiller l\'évolution des fissures et consulter un expert si aggravation')
  }

  // Frequent blocked openings
  if (answers['q16_blocked_openings'] === 'frequent') {
    actions.push('Faire diagnostiquer les déformations de structure causant le blocage des ouvertures')
  }

  // Pool near foundation
  if (answers['q18_pool'] === 'oui') {
    actions.push('Vérifier l\'étanchéité de la piscine et l\'absence d\'infiltrations vers les fondations')
  }

  // TerraStab recommendations based on risk level
  if (riskLevel === 'eleve' || riskLevel === 'tres_eleve') {
    actions.push('Réaliser un diagnostic hydrique complet (TerraStab Survey) pour identifier précisément les zones à risque')

    const foundationDepth = answers['q2_foundation_depth'] as string
    if (isShieldCompatible(foundationDepth)) {
      actions.push('Installer une surveillance continue en temps réel (TerraStab Shield) pour prévenir les désordres')
    }
  } else if (riskLevel === 'modere') {
    actions.push('Envisager un diagnostic TerraStab Survey pour identifier les points de vigilance')
  }

  // Default action if no specific issues
  if (actions.length === 0 && riskLevel === 'faible') {
    actions.push('Continuer la surveillance visuelle régulière de votre habitation')
    actions.push('Vérifier périodiquement l\'absence de nouvelles fissures ou déformations')
  }

  return actions
}

/**
 * Generate complete interpretation text
 *
 * @param riskLevel - Risk level
 * @param shieldCompatible - Whether Shield is compatible
 * @returns Complete interpretation in French
 */
function generateInterpretation(
  riskLevel: RiskLevel,
  shieldCompatible: boolean
): string {
  // Base interpretation from risk level
  const baseInterpretation = getRiskInterpretation(riskLevel)

  // TerraStab solutions section
  let recommendation = '\n\n**Solutions TerraStab recommandées :**\n\n'
  recommendation += '✅ **TerraStab Survey** : Diagnostic hydrique 3D complet\n'
  recommendation += '   → Toujours compatible avec votre habitation\n'
  recommendation += '   → Identification précise des zones à risque\n'
  recommendation += '   → Rapport détaillé avec recommandations personnalisées\n\n'

  if (shieldCompatible) {
    recommendation += '✅ **TerraStab Shield** : Surveillance continue en temps réel\n'
    recommendation += '   → Compatible avec vos fondations (≤ 1,50m)\n'
    recommendation += '   → Monitoring 24/7 de l\'humidité du sol\n'
    recommendation += '   → Alertes précoces et prévention active des désordres\n'
  } else {
    recommendation += '❌ **TerraStab Shield** : Non compatible\n'
    recommendation += '   → Vos fondations sont hors de la zone d\'efficacité (>1,50m ou inconnues)\n'
    recommendation += '   → TerraStab Survey reste la solution adaptée pour votre situation\n'
  }

  return baseInterpretation + recommendation
}

/**
 * Get urgency level based on risk and specific conditions
 *
 * @param answers - User answers
 * @param riskLevel - Risk level
 * @returns Urgency level
 */
export function getUrgencyLevel(
  answers: Answers,
  riskLevel: RiskLevel
): 'low' | 'medium' | 'high' | 'critical' {
  // Critical: Active leaks
  if (answers['q14_network_leaks'] === 'active') {
    return 'critical'
  }

  // Critical: Very high risk with major cracks
  if (riskLevel === 'tres_eleve' && answers['q15_facade_cracks'] === '>5mm') {
    return 'critical'
  }

  // High: Very high risk
  if (riskLevel === 'tres_eleve') {
    return 'high'
  }

  // High: High risk with visible damage
  if (riskLevel === 'eleve' &&
      (answers['q15_facade_cracks'] === '2-5mm' || answers['q15_facade_cracks'] === '>5mm')) {
    return 'high'
  }

  // Medium: Elevated risk or moderate with issues
  if (riskLevel === 'eleve' || riskLevel === 'modere') {
    return 'medium'
  }

  // Low: Faible risk
  return 'low'
}
