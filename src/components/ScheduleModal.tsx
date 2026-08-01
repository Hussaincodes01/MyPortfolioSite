import React, { useState } from 'react'
import { X, Calendar, Send, CheckCircle2 } from 'lucide-react'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '', topic: 'Freelance / Contract' })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
    }, 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/20 rounded-xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 size={56} className="text-red-500 animate-bounce" />
            <h3 className="text-2xl font-bold">Call Request Received!</h3>
            <p className="font-pixel text-sm text-white/70">
              Thank you. I'll get back to you shortly to confirm our call slot.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-red-500 font-pixel text-xs uppercase tracking-widest mb-1">
                <Calendar size={14} />
                <span>Direct Booking</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Schedule a Call</h3>
              <p className="text-sm text-white/60 mt-1">
                Open to freelance, contract, or full-time opportunities.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block font-pixel text-xs uppercase text-white/60 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-white/5 border border-white/15 rounded px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-pixel text-xs uppercase text-white/60 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full bg-white/5 border border-white/15 rounded px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-pixel text-xs uppercase text-white/60 mb-1.5">Engagement Type</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-[#121212] border border-white/15 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Freelance / Contract">Freelance / Contract Project</option>
                  <option value="Full-time Engineering">Full-time Engineering Role</option>
                  <option value="AI / ML Advisory">AI / ML System Advisory</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-pixel text-xs uppercase text-white/60 mb-1.5">Project / Inquiry Brief</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell me a bit about your project or timelines..."
                  className="w-full bg-white/5 border border-white/15 rounded px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded text-sm tracking-wider uppercase transition-colors shadow-lg"
            >
              <Send size={14} />
              <span>Confirm Call Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
