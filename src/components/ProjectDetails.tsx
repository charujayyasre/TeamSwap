import React, { useState, useEffect } from 'react'
import { X, Users, Calendar, Tag, User, Check, X as XIcon, Star, Clock, ExternalLink, Github, MapPin, Globe } from 'lucide-react'
import { supabase, Database } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

type Project = Database['public']['Tables']['projects']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

type Application = Database['public']['Tables']['project_applications']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

type Member = Database['public']['Tables']['project_members']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface ProjectDetailsProps {
  project: Project
  onClose: () => void
}

export function ProjectDetails({ project, onClose }: ProjectDetailsProps) {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const isOwner = user?.id === project.creator_id

  useEffect(() => {
    fetchApplications()
    fetchMembers()
  }, [project.id])

  const fetchApplications = async () => {
    if (!isOwner) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('project_applications')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          skills_offered,
          rating,
          projects_completed
        )
      `)
      .eq('project_id', project.id)
      .eq('status', 'pending')

    if (!error && data) {
      setApplications(data as Application[])
    }
    setLoading(false)
  }

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          skills_offered,
          rating,
          projects_completed
        )
      `)
      .eq('project_id', project.id)
      .eq('status', 'active')

    if (!error && data) {
      setMembers(data as Member[])
    }
  }

  const handleApplication = async (applicationId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('project_applications')
      .update({ 
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (!error) {
      if (status === 'accepted') {
        // Add to project members
        const application = applications.find(app => app.id === applicationId)
        if (application) {
          await supabase
            .from('project_members')
            .insert({
              project_id: project.id,
              user_id: application.applicant_id,
              role: 'member',
              skills_contributing: application.skills_offered
            })
        }
      }
      
      // Refresh data
      fetchApplications()
      fetchMembers()
    }
  }

  const categoryColors = {
    'Web Development': 'from-blue-500 to-cyan-500',
    'Mobile Development': 'from-green-500 to-teal-500',
    'Data Science': 'from-purple-500 to-pink-500',
    'Design': 'from-orange-500 to-red-500',
    'Marketing': 'from-yellow-500 to-orange-500',
    'DevOps': 'from-indigo-500 to-purple-500',
    'AI/ML': 'from-pink-500 to-rose-500',
    'Blockchain': 'from-emerald-500 to-cyan-500',
    'Other': 'from-gray-500 to-slate-500'
  }

  const difficultyColors = {
    'beginner': 'bg-green-500/20 text-green-300 border-green-500/30',
    'intermediate': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'advanced': 'bg-red-500/20 text-red-300 border-red-500/30'
  }

  const gradientClass = categoryColors[project.category as keyof typeof categoryColors] || categoryColors.Other
  const difficultyClass = difficultyColors[project.difficulty_level as keyof typeof difficultyColors]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${gradientClass}`}>
                  {project.category}
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${difficultyClass}`}>
                  {project.difficulty_level}
                </span>
                {project.is_featured && (
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                )}
              </div>
              <div className="flex items-center text-gray-300 text-sm mb-4 flex-wrap gap-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>Created by {project.profiles.username}</span>
                  {project.profiles.rating > 0 && (
                    <div className="flex items-center ml-2">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs ml-1">{project.profiles.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                {project.estimated_duration && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{project.estimated_duration}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>

            {(project.repository_url || project.demo_url) && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Links</h3>
                <div className="flex gap-3">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Repository
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            )}

            {project.required_skills.length > 0 && (
              <div>
                <div className="flex items-center mb-3">
                  <Tag className="w-5 h-5 mr-2 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Required Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm border border-cyan-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center text-gray-300">
              <Users className="w-5 h-5 mr-2" />
              <span>Team Size: {members.length} / {project.max_members} members</span>
            </div>

            {members.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white/5 rounded-lg border border-white/10 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium text-white">
                            {member.profiles.username}
                          </span>
                          {member.profiles.full_name && (
                            <span className="text-gray-400 ml-2 text-sm">
                              ({member.profiles.full_name})
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          member.role === 'creator' 
                            ? 'bg-green-500/20 text-green-300' 
                            : member.role === 'admin'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                      
                      {member.profiles.rating > 0 && (
                        <div className="flex items-center mb-2">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          <span className="text-xs text-gray-300">{member.profiles.rating.toFixed(1)} rating</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {member.profiles.projects_completed} projects completed
                          </span>
                        </div>
                      )}

                      {member.skills_contributing.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-400 mb-1 block">Contributing:</span>
                          <div className="flex flex-wrap gap-1">
                            {member.skills_contributing.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOwner && !loading && applications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Pending Applications</h3>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="bg-white/5 rounded-lg border border-white/10 p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium text-white">
                              {application.profiles.username}
                            </span>
                            {application.profiles.full_name && (
                              <span className="text-gray-400 ml-2">
                                ({application.profiles.full_name})
                              </span>
                            )}
                            {application.profiles.rating > 0 && (
                              <div className="flex items-center ml-2">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs ml-1 text-gray-300">{application.profiles.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                            <span>Experience: {application.experience_level}</span>
                            <span>Projects: {application.profiles.projects_completed}</span>
                          </div>

                          {application.skills_offered.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs text-gray-400 mb-1 block">Skills offered:</span>
                              <div className="flex flex-wrap gap-1">
                                {application.skills_offered.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {application.message && (
                            <div className="mb-3">
                              <span className="text-xs text-gray-400 mb-1 block">Message:</span>
                              <p className="text-gray-300 text-sm bg-white/5 p-2 rounded">
                                {application.message}
                              </p>
                            </div>
                          )}

                          {application.portfolio_url && (
                            <a
                              href={application.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Portfolio
                            </a>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleApplication(application.id, 'rejected')}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApplication(application.id, 'accepted')}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors border border-green-500/30"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
