import React from 'react'
import { Play } from 'lucide-react'

interface BottomSectionProps {
  onOpenShowreel: () => void
  onOpenSchedule: () => void
  onOpenProjects: () => void
}

export const BottomSection: React.FC<BottomSectionProps> = ({
  onOpenShowreel,
  onOpenSchedule,
  onOpenProjects,
}) => {
  return (
    <div className="pb-4">
      {/* ROW A */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-end">
        {/* LEFT — Hero headline */}
        <div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] tracking-wide uppercase font-normal"
            style={{ lineHeight: 0.72 }}
          >
            I BRING THE<br />
            <span className="font-pixel font-normal text-[1.25em] inline-block leading-none align-baseline">
              UNEXPECTED
            </span> TO<br />
            BRAND &amp; DIGITAL<br />
            <span className="font-pixel font-normal text-[1.25em] inline-block leading-none align-baseline">
              EXPERIENCES
            </span>
          </h1>
        </div>

        {/* RIGHT — column flex flex-col gap-4 sm:gap-6 justify-end */}
        <div className="flex flex-col gap-4 sm:gap-6 justify-end">
          {/* A) PLAY SHOWREEL button (self-start) */}
          <button
            onClick={onOpenShowreel}
            className="self-start flex items-center gap-3 border border-white/30 px-6 py-3 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <Play size={14} fill="white" className="group-hover:scale-110 transition-transform" />
            <span className="text-sm tracking-wider">PLAY SHOWREEL</span>
          </button>

          {/* B) Awards row (self-start on mobile, lg:self-end) */}
          <div className="self-start lg:self-end flex flex-wrap items-stretch gap-2 sm:gap-3 text-sm text-white/80">
            {/* Chip 1 */}
            <div className="bg-[#0B0B0B] px-3 sm:px-4 py-2 flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight">FWA</span>
              <span className="text-white/50 text-xs">x1</span>
            </div>

            {/* Chip 2 */}
            <div className="bg-[#0B0B0B] px-3 sm:px-4 py-2 flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl">W.</span>
              <span className="text-white/50 text-xs">x7</span>
            </div>

            {/* Chip 3 */}
            <div className="bg-[#0B0B0B] px-3 sm:px-4 py-2 flex items-center gap-2">
              <span className="font-bold text-[10px] sm:text-xs tracking-tight">CSSDesignAwards</span>
              <span className="text-white/50 text-xs">x22</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW B — footer strip */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-4 border-t border-white/10">
        {/* Left */}
        <div className="text-xs text-white/60">
          Open to freelance, contract or full-time.{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onOpenSchedule()
            }}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Schedule a call
          </a>
        </div>

        {/* Right */}
        <div
          onClick={onOpenProjects}
          className="text-xs text-white/60 sm:text-right cursor-pointer hover:text-white transition-colors"
        >
          5 full cases • 82 archive fragments • 22 catalog items
        </div>
      </div>
    </div>
  )
}
