import React from 'react'

export const MetaGrid: React.FC = () => {
  return (
    <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {/* COL 1 (left) */}
      <div>
        <h2 className="text-lg md:text-xl tracking-wide leading-tight">
          <div className="font-normal">ADAM</div>
          <div className="font-pixel text-2xl md:text-3xl">ROBERTS</div>
        </h2>
        <div className="text-[10px] text-white/50 mt-3">*</div>
        <p className="font-pixel mt-1 text-xs text-white/60 leading-relaxed">
          Grilled Pixels is my<br />
          personal brand - I came up<br />
          with it in 2004 based on<br />
          "cooking up ideas"
        </p>
      </div>

      {/* COL 2 (text-right on mobile 2-col, text-left on lg) */}
      <div className="text-right lg:text-left">
        <h2 className="text-lg md:text-xl tracking-wide leading-tight">
          <div className="font-normal">DESIGN &amp;</div>
          <div className="font-pixel text-2xl md:text-3xl">ENGINEERING</div>
        </h2>
      </div>

      {/* COL 3 */}
      <div>
        <div className="text-base tracking-widest text-white/50 uppercase mb-3 font-pixel">
          What I Do
        </div>
        <p className="text-sm text-white/90 leading-relaxed max-w-[220px]">
          I create the top 1% of experiences for brands and digital products
        </p>
      </div>

      {/* COL 4 (text-right on mobile 2-col, text-left on lg) */}
      <div className="text-right lg:text-left">
        <div className="text-base tracking-widest text-white/50 uppercase mb-3 font-pixel">
          Services
        </div>
        <ul className="text-sm text-white/90 leading-relaxed space-y-0.5">
          <li>Branding</li>
          <li>Creative Direction &amp; Strategy</li>
          <li>UX/UI Design</li>
          <li>Web Development (React/Nextjs)</li>
          <li>3D, WebGL / Photography</li>
          <li>Video &amp; Animation</li>
        </ul>
      </div>
    </div>
  )
}
