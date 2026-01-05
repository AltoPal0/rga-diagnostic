import { useState } from 'react'
import { questions } from '../engine/config'
import { getVisibleQuestions, getProgress } from '../engine/visibility'
import { calculateScore } from '../engine/scoring'
import { getRiskLevel, getRiskEmoji, getRiskLabel } from '../engine/riskTier'
import { generateRecommendations } from '../engine/recommendations'
import { Answers } from '../engine/types'

export default function Diagnostic() {
  const [answers, setAnswers] = useState<Answers>({})
  const [showResults, setShowResults] = useState(false)

  const visibleQuestions = getVisibleQuestions(questions, answers)
  const progress = getProgress(questions, answers)

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleCalculate = () => {
    setShowResults(true)
  }

  const { total, breakdown } = calculateScore(answers, questions)
  const riskLevel = getRiskLevel(total)
  const recommendations = generateRecommendations(answers, riskLevel)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Questionnaire RGA - Test Moteur</h1>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {visibleQuestions.length} questions visibles sur {questions.length} totales
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {visibleQuestions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
                  Q{index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{question.text}</h3>
                  {question.description && (
                    <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                  )}
                </div>
              </div>

              {question.type === 'single-choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(question.id, option.value)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        answers[question.id] === option.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Calculate Button */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <button
            onClick={handleCalculate}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Calculer le score
          </button>
        </div>

        {/* Results */}
        {showResults && (
          <div className="mt-6 space-y-6">
            {/* Score */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Résultats</h2>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {total} / 100
                </div>
                <div className="text-2xl">
                  {getRiskEmoji(riskLevel)} Risque {getRiskLabel(riskLevel)}
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Exposition</div>
                  <div className="text-2xl font-bold">{breakdown.exposure} / 20</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Prédisposition</div>
                  <div className="text-2xl font-bold">{breakdown.predisposition} / 30</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Facteurs aggravants</div>
                  <div className="text-2xl font-bold">{breakdown.aggravating} / 30</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Désordres</div>
                  <div className="text-2xl font-bold">{breakdown.damage} / 20</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recommandations TerraStab</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">✅</span>
                  <div>
                    <div className="font-semibold">TerraStab Survey</div>
                    <div className="text-sm text-gray-600">Toujours compatible</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">{recommendations.shield_compatible ? '✅' : '❌'}</span>
                  <div>
                    <div className="font-semibold">TerraStab Shield</div>
                    <div className="text-sm text-gray-600">
                      {recommendations.shield_compatible
                        ? 'Compatible avec vos fondations'
                        : recommendations.shield_reason}
                    </div>
                  </div>
                </div>
              </div>

              {recommendations.priority_actions.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Actions prioritaires:</h3>
                  <ul className="space-y-2">
                    {recommendations.priority_actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Debug Info */}
            <div className="bg-gray-800 text-gray-100 rounded-lg shadow p-6 font-mono text-xs">
              <div className="font-bold mb-2">Debug - Réponses:</div>
              <pre className="overflow-auto">{JSON.stringify(answers, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
