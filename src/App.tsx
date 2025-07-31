import React, { useState, useEffect } from 'react'
import { Search, Filter, Users, Code } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { supabase, Database } from './lib/supabase'
import { Layout } from './components/Layout'
import { AuthForm } from './components/AuthForm'
import { ProjectCard } from './components/ProjectCard'
import { SkillSwapCard } from './components/SkillSwapCard'
import { ProjectDetails } from './components/ProjectDetails'
import { CreateProject } from './components/CreateProject'
import { CreateSkillSwap } from './components/CreateSkillSwap'
import { Profile } from './components/Profile'
import { DiscoverPage } from './components/DiscoverPage'

type Project = Database['public']['Tables']['projects']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  member_count: number
}

type SkillSwap = Database['public']['Tables']['skill_swaps']['Row'] & {
  requester: Database['public']['Tables']['profiles']['Row']
  responder?: Database['public']['Tables']['profiles']['Row'] | null
}

function App() {
  const { user, loading: authLoading } = useAuth()
  const [currentView, setCurrentView] = useState('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [skillSwaps, setSkillSwaps] = useState<SkillSwap[]>([])
  const [userApplications, setUserApplications] = useState<string[]>([])
  const [userMemberships, setUserMemberships] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProjects()
      fetchSkillSwaps()
      fetchUserApplications()
      fetchUserMemberships()
    }
  }, [user])

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          rating
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Get member counts
      const projectsWithCounts = await Promise.all(
        data.map(async (project) => {
          const { count } = await supabase
            .from('project_members')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .eq('status', 'active')

          return {
            ...project,
            member_count: count || 0
          }
        })
      )

      setProjects(projectsWithCounts as Project[])
    }
    setLoading(false)
  }

  const fetchSkillSwaps = async () => {
    const { data, error } = await supabase
      .from('skill_swaps')
      .select(`
        *,
        requester:profiles!skill_swaps_requester_id_fkey (
          id,
          username,
          full_name,
          rating
        ),
        responder:profiles!skill_swaps_responder_id_fkey (
          id,
          username,
          full_name,
          rating
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSkillSwaps(data as SkillSwap[])
    }
  }

  const fetchUserApplications = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('project_applications')
      .select('project_id')
      .eq('applicant_id', user.id)
      .eq('status', 'pending')

    if (!error && data) {
      setUserApplications(data.map(app => app.project_id))
    }
  }

  const fetchUserMemberships = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (!error && data) {
      setUserMemberships(data.map(member => member.project_id))
    }
  }

  const handleApplyToProject = async (projectId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('project_applications')
      .insert({
        project_id: projectId,
        applicant_id: user.id,
        message: '',
        skills_offered: []
      })

    if (!error) {
      setUserApplications(prev => [...prev, projectId])
    }
  }

  const handleAcceptSkillSwap = async (swapId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('skill_swaps')
      .update({
        responder_id: user.id,
        status: 'accepted'
      })
      .eq('id', swapId)

    if (!error) {
      fetchSkillSwaps()
    }
  }

  const handleRejectSkillSwap = async (swapId: string) => {
    const { error } = await supabase
      .from('skill_swaps')
      .update({ status: 'rejected' })
      .eq('id', swapId)

    if (!error) {
      fetchSkillSwaps()
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.required_skills.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    
    const matchesCategory = !categoryFilter || project.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Design',
    'Marketing',
    'DevOps',
    'AI/ML',
    'Blockchain',
    'Other'
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (currentView === 'create-project') {
    return (
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        <CreateProject
          onBack={() => setCurrentView('projects')}
          onSuccess={() => {
            setCurrentView('projects')
            fetchProjects()
            fetchUserMemberships()
          }}
        />
      </Layout>
    )
  }

  if (currentView === 'create-skill-swap') {
    return (
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        <CreateSkillSwap
          onBack={() => setCurrentView('skills')}
          onSuccess={() => {
            setCurrentView('skills')
            fetchSkillSwaps()
          }}
        />
      </Layout>
    )
  }

  if (currentView === 'profile') {
    return (
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        <Profile />
      </Layout>
    )
  }

  if (currentView === 'discover') {
    return (
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        <DiscoverPage
          onApplyToProject={handleApplyToProject}
          onViewProjectDetails={setSelectedProject}
          onAcceptSkillSwap={handleAcceptSkillSwap}
          onRejectSkillSwap={handleRejectSkillSwap}
          userApplications={userApplications}
          userMemberships={userMemberships}
        />
      </Layout>
    )
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'projects' && (
        <>
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects by title, description, or skills..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                >
                  <option value="" className="bg-slate-800">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-300">
                <Code className="w-5 h-5 mr-2" />
                <span>{filteredProjects.length} active projects</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onApply={handleApplyToProject}
                  onViewDetails={setSelectedProject}
                  isApplied={userApplications.includes(project.id)}
                  isOwner={user.id === project.creator_id}
                  isMember={userMemberships.includes(project.id)}
                />
              ))}
            </div>
          )}

          {!loading && filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}

          {selectedProject && (
            <ProjectDetails
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          )}
        </>
      )}

      {currentView === 'skills' && (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-300">
                <Users className="w-5 h-5 mr-2" />
                <span>{skillSwaps.length} skill swap opportunities</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillSwaps.map((skillSwap) => (
                <SkillSwapCard
                  key={skillSwap.id}
                  skillSwap={skillSwap}
                  onAccept={handleAcceptSkillSwap}
                  onReject={handleRejectSkillSwap}
                  currentUserId={user.id}
                />
              ))}
            </div>
          )}

          {!loading && skillSwaps.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No skill swaps yet</h3>
              <p className="text-gray-500">Be the first to create a skill exchange opportunity</p>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}

export default App
