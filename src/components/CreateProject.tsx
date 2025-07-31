import React, { useState } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface CreateProjectProps {
  onBack: () => void
  onSuccess: () => void
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

const projectTypes = [
  { value: 'open_source', label: 'Open Source' },
  { value: 'startup', label: 'Startup' },
  { value: 'learning', label: 'Learning Project' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'other', label: 'Other' }
]

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

export function CreateProject({ onBack, onSuccess }: CreateProjectProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    projectType: 'open_source' as const,
    difficultyLevel: 'intermediate' as const,
    maxMembers: 5,
    estimatedDuration: '',
    repositoryUrl: '',
    demoUrl: '',
    requiredSkills: [] as string[],
    tags: [] as string[]
  })
  const [newSkill, setNewSkill] = useState('')
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        project_type: formData.projectType,
        difficulty_level: formData.difficultyLevel,
        max_members: formData.maxMembers,
        estimated_duration: formData.estimatedDuration || null,
        repository_url: formData.repositoryUrl || null,
        demo_url: formData.demoUrl || null,
        required_skills: formData.requiredSkills,
        tags: formData.tags,
        creator_id: user.id
      })
      .select()
      .single()

    if (!error && data) {
      // Add creator as first member
      await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'creator'
        })

      onSuccess()
    }

    setLoading(false)
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Create New Project
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter your project title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="Describe your project in detail. What are you building? What's the goal? What technologies will you use?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category} className="bg-slate-800">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Type
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value as any }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {projectTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-slate-800">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, difficultyLevel: e.target.value as any }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {difficultyLevels.map(level => (
                  <option key={level.value} value={level.value} className="bg-slate-800">
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Team Members
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Duration
              </label>
              <input
                type="text"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="e.g., 2-3 months, 6 weeks"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Repository URL
              </label>
              <input
                type="url"
                value={formData.repositoryUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, repositoryUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Demo URL
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="https://your-demo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Required Skills
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Add a required skill"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm border border-cyan-500/30"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-cyan-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-purple-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-white/10 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
