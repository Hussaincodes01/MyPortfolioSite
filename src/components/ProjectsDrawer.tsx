import React from 'react'
import { X, ExternalLink, Github, Star, GitFork, Terminal, Code } from 'lucide-react'

interface ProjectsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const projects = [
  {
    title: "HackPair",
    description: "Real-time code collaboration for hackathon teams. Self-hosted, zero-config VS Code extension with Socket.io, Y.js CRDT, and sql.js for conflict-free sync.",
    tags: ["TypeScript", "Socket.io", "Y.js", "VS Code Extension"],
    stars: 2,
    forks: 0,
    github: "https://github.com/Hussaincodes01/HackPair",
    featured: true
  },
  {
    title: "Outreach-OS",
    description: "Autonomous business lead agent: Scrapes leads, sends personalized emails, handles follow-ups, and books meetings automatically.",
    tags: ["Python", "AI Agent", "Automation", "NLP"],
    stars: 1,
    forks: 0,
    github: "https://github.com/Hussaincodes01/Outreach-OS",
    featured: true
  },
  {
    title: "Ai-Labs",
    description: "AI agent for lab experiment question generation that creates unique, equal-difficulty problems to prevent exam cheating.",
    tags: ["TypeScript", "Next.js", "AI Agent", "Vercel"],
    stars: 0,
    forks: 0,
    github: "https://github.com/Hussaincodes01/Ai-Labs",
    demo: "https://ai-lab-qqjk.vercel.app",
    featured: true
  },
  {
    title: "Extremism-Text-Detection",
    description: "Complete deep learning NLP pipeline for detecting extremist content in social media text using fine-tuned DeBERTa-v3-base models.",
    tags: ["Python", "DeBERTa", "PyTorch", "NLP"],
    stars: 1,
    forks: 0,
    github: "https://github.com/Hussaincodes01/Extremism-Text-Detection",
    featured: false
  },
  {
    title: "PCB-Defect-Detection",
    description: "Computer vision fault and defect detection system for printed circuit board manufacturing inspection.",
    tags: ["Python", "Computer Vision", "Inference", "Deep Learning"],
    stars: 0,
    forks: 0,
    github: "https://github.com/Hussaincodes01/PCB-Defect-Detection",
    featured: false
  },
  {
    title: "English-to-Akkadian Translation",
    description: "Byte-level transformer model for translating ancient cuneiform business records from Akkadian to English.",
    tags: ["Python", "Transformers", "Historical NLP", "Deep Learning"],
    stars: 1,
    forks: 0,
    github: "https://github.com/Hussaincodes01/English-to-akkadian-translation",
    featured: false
  }
]

export const ProjectsDrawer: React.FC<ProjectsDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-2xl bg-[#080808] border-l border-white/10 h-full flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Github size={18} className="text-white/80" />
              <h2 className="text-xl font-bold tracking-tight">Hussaincodes01 / Projects</h2>
            </div>
            <p className="font-pixel text-xs text-white/50 mt-1">
              Curated repositories & engineering systems by Jiyad
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="my-6 p-4 bg-white/5 border border-white/10 rounded-lg flex items-center gap-4">
          <img
            src="https://avatars.githubusercontent.com/u/129209917?v=4"
            alt="Jiyad GitHub Profile"
            className="w-14 h-14 rounded-full border border-white/20"
          />
          <div>
            <h3 className="font-bold text-white text-base">Jiyad (Hussaincodes01)</h3>
            <p className="text-xs text-white/70 mt-0.5 leading-relaxed font-pixel">
              "I spend my days cooking, kaggling, Colabing, and exploring video games apart from work."
            </p>
            <a
              href="https://github.com/Hussaincodes01"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:underline mt-1 font-pixel"
            >
              github.com/Hussaincodes01 <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4 flex-1">
          {projects.map((item, idx) => (
            <div
              key={idx}
              className="p-5 bg-[#0e0e0e] border border-white/10 hover:border-white/30 rounded-xl transition-all hover:translate-x-1 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-red-500" />
                  <h4 className="font-bold text-white text-lg tracking-wide group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  {item.demo && (
                    <a
                      href={item.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-pixel text-white/70 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded"
                    >
                      Demo <ExternalLink size={10} />
                    </a>
                  )}
                  <a
                    href={item.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Github size={18} />
                  </a>
                </div>
              </div>

              <p className="text-sm text-white/80 mt-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((t, i) => (
                    <span key={i} className="font-pixel text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs font-pixel text-white/40">
                  <span className="flex items-center gap-1"><Star size={12} /> {item.stars}</span>
                  <span className="flex items-center gap-1"><GitFork size={12} /> {item.forks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/10 mt-6 text-center font-pixel text-xs text-white/40">
          Integrated directly from GitHub • Hussaincodes01
        </div>
      </div>
    </div>
  )
}
