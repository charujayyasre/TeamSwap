import React from 'react'
import { ArrowRightLeft, Clock, User, MessageCircle, Calendar, Star } from 'lucide-react'
import { Database } from '../lib/supabase'

type SkillSwap = Database['public']['Tables']['skill_swaps']['Row'] & {
  requester: Database['public']['Tables']['profiles']['Row']
  responder?: Database['public']['Tables']['profiles']['Row'] | null
}

interface SkillSwapCardProps {
  skillSwap: SkillSwap
  onAccept?: (swapId: string) => void
  onReject?: (swapId: string) => void
  currentUserId: string
}

export function SkillSwapCard({ skillSwap, onAccept, onReject, currentUserId }: SkillSwapCardProps) {
  const isRequester = skillSwap.requester_id === currentUserId
  const isResponder = skillSwap.responder_id === currentUserId
  const canRespond = !isRequester && !isResponder && skillSwap.status === 'pending' && !skillSwap.responder_id

  const statusColors = {
    pending: 'from-yellow-500 to-orange-500',
    accepted: 'from-green-500 to-emerald-500',
    rejected: 'from-red-500 to-pink-500',
    completed: 'from-blue-500 to-cyan-500',
    cancelled: 'from-gray-500 to-slate-500'
  }

  const swapTypeColors = {
    one_time: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    recurring: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    mentorship: 'bg-green-500/20 text-green-300 border-green-500/30'
  }

  const statusColor = statusColors[skillSwap.status as keyof typeof statusColors]
  const typeColor = swapTypeColors[skillSwap.swap_type as keyof typeof swapTypeColors]

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Skill Exchange</h3>
            <div className="flex items-center text-gray-300 text-sm">
              <User className="w-4 h-4 mr-1" />
              <span>by {skillSwap.requester.username}</span>
              {skillSwap.requester.rating > 0 && (
                <div className="flex items-center ml-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs ml-1">{skillSwap.requester.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${statusColor}`}>
            {skillSwap.status.toUpperCase()}
          </div>
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${typeColor}`}>
            {skillSwap.swap_type.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
          <div>
            <span className="text-cyan-300 text-sm font-medium">Offering</span>
            <p className="text-white font-semibold">{skillSwap.offered_skill}</p>
          </div>
          <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
          <div className="text-right">
            <span className="text-purple-300 text-sm font-medium">Seeking</span>
            <p className="text-white font-semibold">{skillSwap.requested_skill}</p>
          </div>
        </div>

        {skillSwap.message && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center mb-2">
              <MessageCircle className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-400 text-sm">Message</span>
            </div>
            <p className="text-gray-300 text-sm">{skillSwap.message}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-gray-300 text-sm">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{skillSwap.session_duration} minutes</span>
          </div>
          {skillSwap.session_time && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{new Date(skillSwap.session_time).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {skillSwap.responder && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-green-300 text-sm font-medium">Accepted by</span>
                <p className="text-white">{skillSwap.responder.username}</p>
              </div>
              {skillSwap.responder.rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm ml-1 text-gray-300">{skillSwap.responder.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {skillSwap.status === 'completed' && (skillSwap.requester_rating || skillSwap.responder_rating) && (
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <span className="text-blue-300 text-sm font-medium">Session Completed</span>
            <div className="flex items-center gap-4 mt-2">
              {skillSwap.requester_rating && (
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-1">Requester:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < skillSwap.requester_rating! ? 'text-yellow-400 fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {skillSwap.responder_rating && (
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-1">Responder:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < skillSwap.responder_rating! ? 'text-yellow-400 fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {canRespond && onAccept && onReject && (
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <button
            onClick={() => onReject(skillSwap.id)}
            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium border border-red-500/30"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept(skillSwap.id)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
          >
            Accept Swap
          </button>
        </div>
      )}

      {isRequester && skillSwap.status === 'pending' && !skillSwap.responder_id && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-gray-400 text-sm text-center">Waiting for someone to accept your swap request</p>
        </div>
      )}

      {(isRequester || isResponder) && skillSwap.status === 'accepted' && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-green-300 text-sm text-center font-medium">
            Swap accepted! Connect with your partner to schedule the session.
          </p>
        </div>
      )}
    </div>
  )
}
