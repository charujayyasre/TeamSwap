import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface CreateSkillSwapProps {
  onBack: () => void
  onSuccess: () => void
}

const swapTypes = [
  { value: 'one_time', label: 'One-time Session' },
  { value: 'recurring', label: 'Recurring Sessions' },
  { value: 'mentorship', label: 'Mentorship' }
]

export function CreateSkillSwap({ onBack, onSuccess }: CreateSkillSwapProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    offeredSkill: '',
    requestedSkill: '',
    message: '',
    sessionTime: '',
    sessionDuration: 60,
    swapType: 'one_time' as const,
    meetingLink: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    
    const { error } = await supabase
      .from('skill_swaps')
      .insert({
        requester_id: user.id,
        offered_skill: formData.offeredSkill,
        requested_skill: formData.requestedSkill,
        message: formData.message || null,
        session_time: formData.sessionTime || null,
        session_duration: formData.sessionDuration,
        swap_type: formData.swapType,
        meeting_link: formData.meetingLink || null
      })

    if (!error) {
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
          Create Skill Swap
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skill You're Offering *
            </label>
            <input
              type="text"
              required
              value={formData.offeredSkill}
              onChange={(e) => setFormData(prev => ({ ...prev, offeredSkill: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., React Development, UI Design, Python Programming"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skill You Want to Learn *
            </label>
            <input
              type="text"
              required
              value={formData.requestedSkill}
              onChange={(e) => setFormData(prev => ({ ...prev, requestedSkill: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="e.g., Node.js, Digital Marketing, Data Analysis"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Swap Type
            </label>
            <select
              value={formData.swapType}
              onChange={(e) => setFormData(prev => ({ ...prev, swapType: e.target.value as any }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {swapTypes.map(type => (
                <option key={type.value} value={type.value} className="bg-slate-800">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Duration (minutes)
              </label>
              <input
                type="number"
                min="30"
                max="180"
                step="15"
                value={formData.sessionDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Session Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.sessionTime}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionTime: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meeting Link (Optional)
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://meet.google.com/... or https://zoom.us/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Tell potential partners about your experience level, what you hope to learn, teaching style, or any specific requirements..."
            />
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Skill Swap'}
          </button>
        </div>
      </form>
    </div>
  )
}
