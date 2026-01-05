/**
 * Types for the RGA Diagnostic Questionnaire Engine
 * All business logic is driven by configuration, not hardcoded in components
 */

// ============================================================================
// Question Types
// ============================================================================

/**
 * Supported question types
 */
export type QuestionType = 'single-choice' | 'multi-choice' | 'text' | 'info'

/**
 * An option for single-choice or multi-choice questions
 */
export interface QuestionOption {
  value: string
  label: string
  description?: string
}

/**
 * Visibility condition for conditional questions
 */
export interface VisibilityCondition {
  questionId: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in'
  value: string | string[]
}

/**
 * Scoring category
 */
export type ScoringCategory = 'exposure' | 'predisposition' | 'aggravating' | 'damage'

/**
 * Scoring rule for a question
 */
export interface ScoringRule {
  category: ScoringCategory
  conditions: Array<{
    value: string | string[]
    points: number
  }>
}

/**
 * A question in the questionnaire
 */
export interface Question {
  id: string
  section: string
  text: string
  description?: string
  type: QuestionType
  options?: QuestionOption[]
  required: boolean
  visibilityConditions?: VisibilityCondition[]
  scoringRules?: ScoringRule[]
}

/**
 * A section grouping questions
 */
export interface Section {
  id: string
  name: string
  order: number
}

// ============================================================================
// Answer Storage
// ============================================================================

/**
 * User answers storage
 * Key: question ID
 * Value: answer value(s)
 */
export interface Answers {
  [questionId: string]: string | string[]
}

// ============================================================================
// Scoring
// ============================================================================

/**
 * Score breakdown by category
 */
export interface ScoreBreakdown {
  exposure: number       // Max 20 points
  predisposition: number // Max 30 points
  aggravating: number    // Max 30 points
  damage: number         // Max 20 points
}

/**
 * Risk levels based on total score
 * - faible: 0-20 points
 * - modere: 21-40 points
 * - eleve: 41-60 points
 * - tres_eleve: 61-100 points
 */
export type RiskLevel = 'faible' | 'modere' | 'eleve' | 'tres_eleve'

// ============================================================================
// Recommendations
// ============================================================================

/**
 * TerraStab product recommendations
 */
export interface Recommendations {
  survey_compatible: boolean      // Always true
  shield_compatible: boolean       // True only if foundation depth ≤ 1.50m
  shield_reason?: string          // Reason if shield is not compatible
  priority_actions: string[]      // List of recommended actions based on answers
  interpretation: string          // Full interpretation text
}

// ============================================================================
// Diagnostic State
// ============================================================================

/**
 * Complete diagnostic state
 */
export interface DiagnosticState {
  // Current progress
  currentStep: number

  // User answers
  answers: Answers

  // Calculated results
  score: ScoreBreakdown | null
  totalScore: number | null
  riskLevel: RiskLevel | null
  recommendations: Recommendations | null

  // Metadata
  questionnaireVersion: string
  startedAt: Date | null
  completedAt: Date | null
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Result of score calculation
 */
export interface CalculateScoreResult {
  total: number
  breakdown: ScoreBreakdown
}
