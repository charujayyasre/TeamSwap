import React from 'react'
import { Calendar, Users, Tag, User, Star, Clock, ExternalLink, Github } from 'lucide-react'
import { Database } from '../lib/supabase'

type Project = Database['public']['Tables']['projects']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  member_count: number
}

interface ProjectCardProps {
  project: Project
  onApply: (projectId: string) => void
  onViewDetails: (project: Project) => void
  isApplied?: boolean
  isOwner?: boolean
  isMember?: boolean
}

export function ProjectCard({ project, onApply, onViewDetails, isApplied, isOwner, isMember }: ProjectCardProps) {
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

  const typeColors = {
    'open_source': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'startup': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'learning': 'bg-green-500/20 text-green-300 border-green-500/30',
    'freelance': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'other': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  const gradientClass = categoryColors[project.category as keyof typeof categoryColors] || categoryColors.Other
  const difficultyClass = difficultyColors[project.difficulty_level as keyof typeof difficultyColors]
  const typeClass = typeColors[project.project_type as keyof typeof typeColors]

  return (
    <div className="group bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {project.title}
            </h3>
            {project.is_featured && (
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            )}
          </div>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {project.description}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${gradientClass}`}>
          {project.category}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${difficultyClass}`}>
          {project.difficulty_level}
        </span>
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${typeClass}`}>
          {project.project_type.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-300 text-sm">
          <User className="w-4 h-4 mr-2" />
          <span>Created by {project.profiles.username}</span>
        </div>

        <div className="flex items-center text-gray-300 text-sm">
          <Users className="w-4 h-4 mr-2" />
          <span>{project.member_count} / {project.max_members} members</span>
        </div>

        <div className="flex items-center text-gray-300 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
        </div>

        {project.estimated_duration && (
          <div className="flex items-center text-gray-300 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>{project.estimated_duration}</span>
          </div>
        )}
      </div>

      {project.required_skills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Tag className="w-4 h-4 mr-2 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Required Skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.required_skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-md text-xs border border-cyan-500/30"
              >
                {skill}
              </span>
            ))}
            {project.required_skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-md text-xs border border-gray-500/30">
                +{project.required_skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {project.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs border border-purple-500/30"
              >
                #{tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-md text-xs border border-gray-500/30">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {(project.repository_url || project.demo_url) && (
        <div className="flex gap-2 mb-4">
          {project.repository_url && (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-gray-500/20 text-gray-300 rounded-md text-xs hover:bg-gray-500/30 transition-colors"
            >
              <Github className="w-3 h-3 mr-1" />
              Code
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs hover:bg-blue-500/30 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Demo
            </a>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-white/10">
        <button
          onClick={() => onViewDetails(project)}
          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
        >
          View Details
        </button>
        
        {!isOwner && !isApplied && !isMember && project.member_count < project.max_members && (
          <button
            onClick={() => onApply(project.id)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
          >
            Apply to Join
          </button>
        )}
        
        {isApplied && (
          <div className="flex-1 px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm font-medium text-center border border-yellow-500/30">
            Application Pending
          </div>
        )}
        
        {isMember && !isOwner && (
          <div className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium text-center border border-blue-500/30">
            Team Member
          </div>
        )}
        
        {isOwner && (
          <div className="flex-1 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium text-center border border-green-500/30">
            Your Project
          </div>
        )}
      </div>
    </div>
  )
}
