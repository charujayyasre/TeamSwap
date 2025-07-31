import React, { useState, useEffect } from 'react'
import { User, Plus, X, Save, Star, Award, Code, BookOpen, MapPin, Globe, Github, Linkedin } from 'lucide-react'
import { supabase, Database } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

type Profile = Database['public']['Tables']['profiles']['Row']

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
    location: '',
    website: '',
    githubUrl: '',
    linkedinUrl: '',
    skillsOffered: [] as string[],
    skillsLearning: [] as string[]
  })
  const [newOfferedSkill, setNewOfferedSkill] = useState('')
  const [newLearningSkill, setNewLearningSkill] = useState('')

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setProfile(data)
      setFormData({
        username: data.username || '',
        fullName: data.full_name || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        githubUrl: data.github_url || '',
        linkedinUrl: data.linkedin_url || '',
        skillsOffered: data.skills_offered || [],
        skillsLearning: data.skills_learning || []
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        full_name: formData.fullName,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        github_url: formData.githubUrl,
        linkedin_url: formData.linkedinUrl,
        skills_offered: formData.skillsOffered,
        skills_learning: formData.skillsLearning
      })
      .eq('id', user.id)

    if (!error) {
      await fetchProfile()
    }

    setSaving(false)
  }

  const addOfferedSkill = () => {
    if (newOfferedSkill.trim() && !formData.skillsOffered.includes(newOfferedSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newOfferedSkill.trim()]
      }))
      setNewOfferedSkill('')
    }
  }

  const removeOfferedSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter(s => s !== skill)
    }))
  }

  const addLearningSkill = () => {
    if (newLearningSkill.trim() && !formData.skillsLearning.includes(newLearningSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsLearning: [...prev.skillsLearning, newLearningSkill.trim()]
      }))
      setNewLearningSkill('')
    }
  }

  const removeLearningSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillsLearning: prev.skillsLearning.filter(s => s !== skill)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            My Profile
          </h1>
          {profile && (
            <div className="flex items-center gap-4 mt-2">
              {profile.rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-gray-300">{profile.rating.toFixed(1)} rating</span>
                </div>
              )}
              <div className="flex items-center">
                <Award className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-gray-300">{profile.projects_completed} projects completed</span>
              </div>
              <div className="flex items-center">
                <Code className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-gray-300">{profile.skills_taught} skills taught</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 text-purple-400 mr-1" />
                <span className="text-gray-300">{profile.skills_learned} skills learned</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="Tell others about yourself, your experience, and what you're passionate about..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Github className="w-4 h-4 inline mr-1" />
                GitHub URL
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Linkedin className="w-4 h-4 inline mr-1" />
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skills I Can Offer
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newOfferedSkill}
                onChange={(e) => setNewOfferedSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOfferedSkill())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add a skill you can teach or help with"
              />
              <button
                type="button"
                onClick={addOfferedSkill}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skillsOffered.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm border border-green-500/30"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeOfferedSkill(skill)}
                    className="ml-2 hover:text-green-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skills I Want to Learn
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newLearningSkill}
                onChange={(e) => setNewLearningSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningSkill())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a skill you want to learn"
              />
              <button
                type="button"
                onClick={addLearningSkill}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skillsLearning.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeLearningSkill(skill)}
                    className="ml-2 hover:text-blue-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
