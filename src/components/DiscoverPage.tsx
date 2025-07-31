import React, { useState, useEffect } from 'react'
import { Search, Filter, TrendingUp, Users, Code, Star, Clock } from 'lucide-react'
import { supabase, Database } from '../lib/supabase'
import { ProjectCard } from './ProjectCard'
import { SkillSwapCard } from './SkillSwapCard'
import { useAuth } from '../hooks/useAuth'

type Project = Database['public']['Tables']['projects']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  member_count: number
}

type SkillSwap = Database['public']['Tables']['skill_swaps']['Row'] & {
  requester: Database['public']['Tables']['profiles']['Row']
  responder?: Database['public']['Tables']['profiles']['Row'] | null
}

interface DiscoverPageProps {
  onApplyToProject: (projectId: string) => void
  onViewProjectDetails: (project: Project) => void
  onAcceptSkillSwap: (swapId: string) => void
  onRejectSkillSwap: (swapId: string) => void
  userApplications: string[]
  userMemberships: string[]
}

export function DiscoverPage({ 
  onApplyToProject, 
  onViewProjectDetails, 
  onAcceptSkillSwap, 
  onRejectSkillSwap,
  userApplications,
  userMemberships
}: DiscoverPageProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'projects' | 'skills'>('projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [skillSwaps, setSkillSwaps] = useState<SkillSwap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    
    if (activeTab === 'projects') {
      await fetchFeaturedProjects()
    } else {
      await fetchPopularSkillSwaps()
    }
    
    setLoading(false)
  }

  const fetchFeaturedProjects = async () => {
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
      .order('views_count', { ascending: false })
      .limit(12)

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
  }

  const fetchPopularSkillSwaps = async () => {
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
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(12)

    if (!error && data) {
      setSkillSwaps(data as SkillSwap[])
    }
  }

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.required_skills.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    
    const matchesCategory = !categoryFilter || project.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const filteredSkillSwaps = skillSwaps.filter(swap => {
    const matchesSearch = swap.offered_skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swap.requested_skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (swap.message && swap.message.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Discover Amazing Projects & Skills
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Find exciting projects to join or discover new skills to learn from the community
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Featured Projects
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Popular Skill Swaps
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'projects' ? 'projects' : 'skill swaps'}...`}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        
        {activeTab === 'projects' && (
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
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 text-center">
          <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {activeTab === 'projects' ? filteredProjects.length : filteredSkillSwaps.length}
          </h3>
          <p className="text-gray-300">
            {activeTab === 'projects' ? 'Active Projects' : 'Available Swaps'}
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 text-center">
          <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {activeTab === 'projects' 
              ? filteredProjects.reduce((sum, p) => sum + p.member_count, 0)
              : filteredSkillSwaps.filter(s => s.status === 'accepted').length
            }
          </h3>
          <p className="text-gray-300">
            {activeTab === 'projects' ? 'Active Members' : 'Successful Matches'}
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 text-center">
          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {activeTab === 'projects' 
              ? filteredProjects.filter(p => p.is_featured).length
              : filteredSkillSwaps.filter(s => s.swap_type === 'mentorship').length
            }
          </h3>
          <p className="text-gray-300">
            {activeTab === 'projects' ? 'Featured Projects' : 'Mentorship Opportunities'}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'projects' ? (
            filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onApply={onApplyToProject}
                  onViewDetails={onViewProjectDetails}
                  isApplied={userApplications.includes(project.id)}
                  isOwner={user?.id === project.creator_id}
                  isMember={userMemberships.includes(project.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )
          ) : (
            filteredSkillSwaps.length > 0 ? (
              filteredSkillSwaps.map((skillSwap) => (
                <SkillSwapCard
                  key={skillSwap.id}
                  skillSwap={skillSwap}
                  onAccept={onAcceptSkillSwap}
                  onReject={onRejectSkillSwap}
                  currentUserId={user?.id || ''}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No skill swaps found</h3>
                <p className="text-gray-500">Try adjusting your search</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
