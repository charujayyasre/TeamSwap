import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          skills_offered: string[]
          skills_learning: string[]
          location: string | null
          website: string | null
          github_url: string | null
          linkedin_url: string | null
          rating: number
          total_ratings: number
          projects_completed: number
          skills_taught: number
          skills_learned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          skills_offered?: string[]
          skills_learning?: string[]
          location?: string | null
          website?: string | null
          github_url?: string | null
          linkedin_url?: string | null
        }
        Update: {
          username?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          skills_offered?: string[]
          skills_learning?: string[]
          location?: string | null
          website?: string | null
          github_url?: string | null
          linkedin_url?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          required_skills: string[]
          tags: string[]
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          creator_id: string
          max_members: number
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration: string | null
          project_type: 'open_source' | 'startup' | 'learning' | 'freelance' | 'other'
          repository_url: string | null
          demo_url: string | null
          is_featured: boolean
          views_count: number
          applications_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          category: string
          required_skills?: string[]
          tags?: string[]
          creator_id: string
          max_members?: number
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration?: string | null
          project_type?: 'open_source' | 'startup' | 'learning' | 'freelance' | 'other'
          repository_url?: string | null
          demo_url?: string | null
        }
        Update: {
          title?: string
          description?: string
          category?: string
          required_skills?: string[]
          tags?: string[]
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          max_members?: number
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration?: string | null
          project_type?: 'open_source' | 'startup' | 'learning' | 'freelance' | 'other'
          repository_url?: string | null
          demo_url?: string | null
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'creator' | 'admin' | 'member'
          status: 'active' | 'left' | 'removed'
          skills_contributing: string[]
          contribution_level: 'minimal' | 'regular' | 'high' | 'lead'
          joined_at: string
          left_at: string | null
        }
        Insert: {
          project_id: string
          user_id: string
          role?: 'creator' | 'admin' | 'member'
          skills_contributing?: string[]
          contribution_level?: 'minimal' | 'regular' | 'high' | 'lead'
        }
        Update: {
          role?: 'creator' | 'admin' | 'member'
          status?: 'active' | 'left' | 'removed'
          skills_contributing?: string[]
          contribution_level?: 'minimal' | 'regular' | 'high' | 'lead'
          left_at?: string | null
        }
      }
      project_applications: {
        Row: {
          id: string
          project_id: string
          applicant_id: string
          message: string | null
          skills_offered: string[]
          experience_level: 'beginner' | 'intermediate' | 'advanced'
          availability: string | null
          portfolio_url: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          reviewed_by: string | null
          review_message: string | null
          created_at: string
          reviewed_at: string | null
        }
        Insert: {
          project_id: string
          applicant_id: string
          message?: string | null
          skills_offered?: string[]
          experience_level?: 'beginner' | 'intermediate' | 'advanced'
          availability?: string | null
          portfolio_url?: string | null
        }
        Update: {
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          reviewed_by?: string | null
          review_message?: string | null
          reviewed_at?: string | null
        }
      }
      skill_swaps: {
        Row: {
          id: string
          requester_id: string
          responder_id: string | null
          offered_skill: string
          requested_skill: string
          message: string | null
          session_duration: number
          session_time: string | null
          meeting_link: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
          requester_rating: number | null
          responder_rating: number | null
          requester_feedback: string | null
          responder_feedback: string | null
          swap_type: 'one_time' | 'recurring' | 'mentorship'
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          requester_id: string
          responder_id?: string | null
          offered_skill: string
          requested_skill: string
          message?: string | null
          session_duration?: number
          session_time?: string | null
          meeting_link?: string | null
          swap_type?: 'one_time' | 'recurring' | 'mentorship'
        }
        Update: {
          responder_id?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
          session_time?: string | null
          meeting_link?: string | null
          requester_rating?: number | null
          responder_rating?: number | null
          requester_feedback?: string | null
          responder_feedback?: string | null
          completed_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'project_application' | 'application_accepted' | 'application_rejected' | 'skill_swap_request' | 'skill_swap_accepted' | 'skill_swap_rejected' | 'project_update' | 'system'
          related_id: string | null
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          message: string
          type: 'project_application' | 'application_accepted' | 'application_rejected' | 'skill_swap_request' | 'skill_swap_accepted' | 'skill_swap_rejected' | 'project_update' | 'system'
          related_id?: string | null
          action_url?: string | null
        }
        Update: {
          is_read?: boolean
        }
      }
    }
  }
}
