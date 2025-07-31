/*
  # TeamSwap Complete Database Schema

  1. New Tables
    - `profiles` - Enhanced user profiles with skills and bio
    - `projects` - Collaboration projects with categories and requirements
    - `project_members` - Project team memberships with roles
    - `project_applications` - Applications to join projects
    - `skill_swaps` - Skill exchange requests and sessions
    - `notifications` - User notifications system

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data access
    - Secure user data based on ownership and membership

  3. Features
    - Multi-account project collaboration
    - Skill swap marketplace
    - Real-time notifications
    - Rating and review system
*/

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS skill_swaps CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create enhanced profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  bio text,
  avatar_url text,
  skills_offered text[] DEFAULT '{}',
  skills_learning text[] DEFAULT '{}',
  location text,
  website text,
  github_url text,
  linkedin_url text,
  rating numeric(3,2) DEFAULT 0.0,
  total_ratings integer DEFAULT 0,
  projects_completed integer DEFAULT 0,
  skills_taught integer DEFAULT 0,
  skills_learned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  required_skills text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_members integer DEFAULT 5,
  difficulty_level text DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration text,
  project_type text DEFAULT 'open_source' CHECK (project_type IN ('open_source', 'startup', 'learning', 'freelance', 'other')),
  repository_url text,
  demo_url text,
  is_featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_members table
CREATE TABLE project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'member')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
  skills_contributing text[] DEFAULT '{}',
  contribution_level text DEFAULT 'regular' CHECK (contribution_level IN ('minimal', 'regular', 'high', 'lead')),
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(project_id, user_id)
);

-- Create project_applications table
CREATE TABLE project_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  applicant_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text,
  skills_offered text[] DEFAULT '{}',
  experience_level text DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  availability text,
  portfolio_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  reviewed_by uuid REFERENCES profiles(id),
  review_message text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE(project_id, applicant_id)
);

-- Create skill_swaps table
CREATE TABLE skill_swaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  responder_id uuid REFERENCES profiles(id),
  offered_skill text NOT NULL,
  requested_skill text NOT NULL,
  message text,
  session_duration integer DEFAULT 60, -- in minutes
  session_time timestamptz,
  meeting_link text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  requester_rating integer CHECK (requester_rating >= 1 AND requester_rating <= 5),
  responder_rating integer CHECK (responder_rating >= 1 AND responder_rating <= 5),
  requester_feedback text,
  responder_feedback text,
  swap_type text DEFAULT 'one_time' CHECK (swap_type IN ('one_time', 'recurring', 'mentorship')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('project_application', 'application_accepted', 'application_rejected', 'skill_swap_request', 'skill_swap_accepted', 'skill_swap_rejected', 'project_update', 'system')),
  related_id uuid, -- Can reference project_id, skill_swap_id, etc.
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Anyone can view active projects"
  ON projects FOR SELECT
  TO authenticated
  USING (status IN ('active', 'completed'));

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Project members policies
CREATE POLICY "Anyone can view project members"
  ON project_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project creators and admins can manage members"
  ON project_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_members.project_id 
      AND projects.creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('creator', 'admin')
      AND pm.status = 'active'
    )
  );

CREATE POLICY "Users can leave projects"
  ON project_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Project applications policies
CREATE POLICY "Users can view applications for their projects or their own applications"
  ON project_applications FOR SELECT
  TO authenticated
  USING (
    applicant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_applications.project_id 
      AND projects.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications"
  ON project_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can update their own applications"
  ON project_applications FOR UPDATE
  TO authenticated
  USING (applicant_id = auth.uid())
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Project creators can update applications"
  ON project_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_applications.project_id 
      AND projects.creator_id = auth.uid()
    )
  );

-- Skill swaps policies
CREATE POLICY "Users can view skill swaps they're involved in or public pending swaps"
  ON skill_swaps FOR SELECT
  TO authenticated
  USING (
    requester_id = auth.uid() OR 
    responder_id = auth.uid() OR 
    (status = 'pending' AND responder_id IS NULL)
  );

CREATE POLICY "Users can create skill swap requests"
  ON skill_swaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Involved users can update skill swaps"
  ON skill_swaps FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid() OR responder_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_swaps_updated_at BEFORE UPDATE ON skill_swaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_creator_id ON projects(creator_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_status ON project_members(status);

CREATE INDEX idx_project_applications_project_id ON project_applications(project_id);
CREATE INDEX idx_project_applications_applicant_id ON project_applications(applicant_id);
CREATE INDEX idx_project_applications_status ON project_applications(status);

CREATE INDEX idx_skill_swaps_requester_id ON skill_swaps(requester_id);
CREATE INDEX idx_skill_swaps_responder_id ON skill_swaps(responder_id);
CREATE INDEX idx_skill_swaps_status ON skill_swaps(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create function to automatically create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_related_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, related_id, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_id, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle project application notifications
CREATE OR REPLACE FUNCTION handle_project_application_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_creator_id uuid;
  project_title text;
  applicant_username text;
BEGIN
  -- Get project creator and title
  SELECT creator_id, title INTO project_creator_id, project_title
  FROM projects WHERE id = NEW.project_id;
  
  -- Get applicant username
  SELECT username INTO applicant_username
  FROM profiles WHERE id = NEW.applicant_id;
  
  -- Create notification for project creator
  PERFORM create_notification(
    project_creator_id,
    'New Project Application',
    applicant_username || ' applied to join "' || project_title || '"',
    'project_application',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for project application notifications
CREATE TRIGGER project_application_notification_trigger
  AFTER INSERT ON project_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_project_application_notification();

-- Create function to handle skill swap notifications
CREATE OR REPLACE FUNCTION handle_skill_swap_notification()
RETURNS TRIGGER AS $$
DECLARE
  requester_username text;
BEGIN
  -- Get requester username
  SELECT username INTO requester_username
  FROM profiles WHERE id = NEW.requester_id;
  
  -- This will be called when someone accepts a skill swap
  IF OLD.status = 'pending' AND NEW.status = 'accepted' AND NEW.responder_id IS NOT NULL THEN
    -- Notify requester that their swap was accepted
    PERFORM create_notification(
      NEW.requester_id,
      'Skill Swap Accepted',
      'Your skill swap request for "' || NEW.requested_skill || '" has been accepted!',
      'skill_swap_accepted',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for skill swap notifications
CREATE TRIGGER skill_swap_notification_trigger
  AFTER UPDATE ON skill_swaps
  FOR EACH ROW
  EXECUTE FUNCTION handle_skill_swap_notification();
