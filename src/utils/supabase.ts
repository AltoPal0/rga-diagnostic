import { createClient } from '@supabase/supabase-js'

// Types
export interface ScoreBreakdown {
  exposure: number      // Max 20
  predisposition: number // Max 30
  aggravating: number    // Max 30
  damage: number         // Max 20
}

export type RiskLevel = 'faible' | 'modere' | 'eleve' | 'tres_eleve'

export interface Recommendations {
  survey_compatible: boolean
  shield_compatible: boolean
  shield_reason?: string
  priority_actions: string[]
  interpretation: string
}

export interface DiagnosticSubmission {
  questionnaire_version: string
  answers: Record<string, string | string[]>
  score_total: number
  score_breakdown: ScoreBreakdown
  risk_level: RiskLevel
  recommendations: Recommendations
  user_identity?: {
    email?: string
    phone?: string
    name?: string
  }
  user_agent?: string
  ip_address?: string
  completion_time_seconds?: number
}

export interface DiagnosticSubmissionResult {
  success: boolean
  error?: string
  id?: string
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Submit a completed diagnostic to Supabase
 * @param data - The diagnostic data to submit
 * @returns Promise with success status, optional error message, and optional diagnostic ID
 */
export async function submitDiagnostic(
  data: DiagnosticSubmission
): Promise<DiagnosticSubmissionResult> {
  try {
    const { data: result, error } = await supabase
      .from('diagnostics')
      .insert([{
        questionnaire_version: data.questionnaire_version,
        answers: data.answers,
        score_total: data.score_total,
        score_breakdown: data.score_breakdown,
        risk_level: data.risk_level,
        recommendations: data.recommendations,
        user_identity: data.user_identity || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        completion_time_seconds: data.completion_time_seconds,
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase submission error:', error)
      return {
        success: false,
        error: `Erreur lors de l'enregistrement: ${error.message}`
      }
    }

    return {
      success: true,
      id: result?.id
    }
  } catch (error) {
    console.error('Unexpected error submitting diagnostic:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'enregistrement'
    }
  }
}

/**
 * Test the Supabase connection
 * @returns Promise<boolean> - true if connection successful, false otherwise
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // Try to query the diagnostics table (will fail due to RLS, but proves connection works)
    const { error } = await supabase
      .from('diagnostics')
      .select('id')
      .limit(1)

    // RLS will block SELECT for anon, but no error means connection is good
    // We expect an error here due to RLS, so we just check the connection didn't fail
    return !error || error.code === 'PGRST116' // PGRST116 = RLS policy violation (expected)
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return false
  }
}
