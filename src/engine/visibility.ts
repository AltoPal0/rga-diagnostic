/**
 * Visibility Logic for Conditional Questions
 *
 * Questions can have visibility conditions based on answers to previous questions.
 * This module determines which questions should be visible based on current answers.
 */

import { Question, Answers, VisibilityCondition } from './types'

/**
 * Check if a question should be visible based on current answers
 *
 * @param question - The question to check
 * @param answers - Current user answers
 * @returns true if question should be visible, false otherwise
 */
export function isQuestionVisible(
  question: Question,
  answers: Answers
): boolean {
  // No conditions = always visible
  if (!question.visibilityConditions || question.visibilityConditions.length === 0) {
    return true
  }

  // All conditions must be satisfied (AND logic)
  return question.visibilityConditions.every(condition =>
    evaluateCondition(condition, answers)
  )
}

/**
 * Evaluate a single visibility condition
 *
 * @param condition - The condition to evaluate
 * @param answers - Current user answers
 * @returns true if condition is satisfied, false otherwise
 */
function evaluateCondition(
  condition: VisibilityCondition,
  answers: Answers
): boolean {
  const answer = answers[condition.questionId]

  // Question not answered yet = condition not satisfied
  if (answer === undefined) {
    return false
  }

  switch (condition.operator) {
    case 'equals':
      return answer === condition.value

    case 'not_equals':
      return answer !== condition.value

    case 'in':
      if (!Array.isArray(condition.value)) {
        return false
      }
      return condition.value.includes(answer as string)

    case 'not_in':
      if (!Array.isArray(condition.value)) {
        return false
      }
      return !condition.value.includes(answer as string)

    default:
      console.warn(`Unknown operator: ${condition.operator}`)
      return false
  }
}

/**
 * Get all visible questions based on current answers
 *
 * @param allQuestions - All questions in the questionnaire
 * @param answers - Current user answers
 * @returns Array of visible questions in order
 */
export function getVisibleQuestions(
  allQuestions: Question[],
  answers: Answers
): Question[] {
  return allQuestions.filter(q => isQuestionVisible(q, answers))
}

/**
 * Get the next visible question after the current one
 *
 * @param currentQuestionId - ID of current question
 * @param allQuestions - All questions
 * @param answers - Current answers
 * @returns Next visible question, or null if at end
 */
export function getNextVisibleQuestion(
  currentQuestionId: string,
  allQuestions: Question[],
  answers: Answers
): Question | null {
  const visibleQuestions = getVisibleQuestions(allQuestions, answers)
  const currentIndex = visibleQuestions.findIndex(q => q.id === currentQuestionId)

  if (currentIndex === -1 || currentIndex === visibleQuestions.length - 1) {
    return null // Not found or last question
  }

  return visibleQuestions[currentIndex + 1]
}

/**
 * Get the previous visible question before the current one
 *
 * @param currentQuestionId - ID of current question
 * @param allQuestions - All questions
 * @param answers - Current answers
 * @returns Previous visible question, or null if at start
 */
export function getPreviousVisibleQuestion(
  currentQuestionId: string,
  allQuestions: Question[],
  answers: Answers
): Question | null {
  const visibleQuestions = getVisibleQuestions(allQuestions, answers)
  const currentIndex = visibleQuestions.findIndex(q => q.id === currentQuestionId)

  if (currentIndex <= 0) {
    return null // Not found or first question
  }

  return visibleQuestions[currentIndex - 1]
}

/**
 * Get total count of visible questions
 *
 * @param allQuestions - All questions
 * @param answers - Current answers
 * @returns Number of visible questions
 */
export function getVisibleQuestionCount(
  allQuestions: Question[],
  answers: Answers
): number {
  return getVisibleQuestions(allQuestions, answers).length
}

/**
 * Check if a specific question has been answered
 *
 * @param questionId - Question ID to check
 * @param answers - Current answers
 * @returns true if question has been answered
 */
export function isQuestionAnswered(
  questionId: string,
  answers: Answers
): boolean {
  const answer = answers[questionId]
  if (answer === undefined || answer === null) {
    return false
  }
  if (Array.isArray(answer) && answer.length === 0) {
    return false
  }
  return true
}

/**
 * Get progress percentage
 *
 * @param allQuestions - All questions
 * @param answers - Current answers
 * @returns Progress as percentage (0-100)
 */
export function getProgress(
  allQuestions: Question[],
  answers: Answers
): number {
  const visibleQuestions = getVisibleQuestions(allQuestions, answers)
  const answeredCount = visibleQuestions.filter(q =>
    isQuestionAnswered(q.id, answers)
  ).length

  if (visibleQuestions.length === 0) {
    return 0
  }

  return Math.round((answeredCount / visibleQuestions.length) * 100)
}
