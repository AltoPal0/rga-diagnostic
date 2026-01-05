/**
 * Scoring Algorithm
 *
 * Calculates the RGA risk score based on user answers.
 * Score breakdown:
 * - Exposure: max 20 points (Géorisques risk level)
 * - Predisposition: max 30 points (foundations, construction year, levels)
 * - Aggravating factors: max 30 points (trees, drainage, water, leaks, pool)
 * - Damage: max 20 points (cracks, blocked openings)
 *
 * Total: max 100 points
 *
 * Based on CEREMA recommendations and DTU 13.12
 * Reference: knowledge/04-QUESTIONNAIRE-RGA-GUIDE-COMPLET.md
 */

import { Answers, ScoreBreakdown, Question, CalculateScoreResult } from './types'

/**
 * Calculate the complete RGA risk score
 *
 * @param answers - User answers
 * @param questions - All questions with scoring rules
 * @returns Total score and breakdown by category
 */
export function calculateScore(
  answers: Answers,
  questions: Question[]
): CalculateScoreResult {
  const breakdown: ScoreBreakdown = {
    exposure: 0,
    predisposition: 0,
    aggravating: 0,
    damage: 0,
  }

  // Iterate through all questions and apply scoring rules
  questions.forEach(question => {
    const answer = answers[question.id]

    // Skip if question not answered or has no scoring rules
    if (!answer || !question.scoringRules) {
      return
    }

    // Apply each scoring rule
    question.scoringRules.forEach(rule => {
      const matchingCondition = rule.conditions.find(cond => {
        // Handle array values (multi-choice questions)
        if (Array.isArray(cond.value)) {
          return cond.value.includes(answer as string)
        }
        // Handle single value
        return cond.value === answer
      })

      if (matchingCondition) {
        breakdown[rule.category] += matchingCondition.points
      }
    })
  })

  // Apply limits to each category
  // Note: aggravating can have negative bonuses (écran anti-racines)
  // so we use Math.max(0, ...) to prevent negative scores
  breakdown.exposure = clamp(breakdown.exposure, 0, 20)
  breakdown.predisposition = clamp(breakdown.predisposition, 0, 30)
  breakdown.aggravating = clamp(breakdown.aggravating, 0, 30)
  breakdown.damage = clamp(breakdown.damage, 0, 20)

  // Calculate total score
  const total = clamp(
    breakdown.exposure +
    breakdown.predisposition +
    breakdown.aggravating +
    breakdown.damage,
    0,
    100
  )

  return { total, breakdown }
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Validate that score breakdown doesn't exceed category limits
 *
 * @param breakdown - Score breakdown to validate
 * @returns true if valid, false otherwise
 */
export function validateScoreBreakdown(breakdown: ScoreBreakdown): boolean {
  return (
    breakdown.exposure >= 0 && breakdown.exposure <= 20 &&
    breakdown.predisposition >= 0 && breakdown.predisposition <= 30 &&
    breakdown.aggravating >= 0 && breakdown.aggravating <= 30 &&
    breakdown.damage >= 0 && breakdown.damage <= 20
  )
}

/**
 * Get maximum possible score for each category
 */
export function getMaxScores(): ScoreBreakdown {
  return {
    exposure: 20,
    predisposition: 30,
    aggravating: 30,
    damage: 20,
  }
}

/**
 * Get category label in French
 */
export function getCategoryLabel(category: keyof ScoreBreakdown): string {
  const labels = {
    exposure: 'Exposition RGA',
    predisposition: 'Prédisposition',
    aggravating: 'Facteurs aggravants',
    damage: 'Désordres',
  }
  return labels[category]
}

/**
 * Calculate score percentage for a specific category
 *
 * @param score - Category score
 * @param category - Category name
 * @returns Percentage (0-100)
 */
export function getCategoryPercentage(
  score: number,
  category: keyof ScoreBreakdown
): number {
  const maxScores = getMaxScores()
  const max = maxScores[category]
  if (max === 0) return 0
  return Math.round((score / max) * 100)
}
