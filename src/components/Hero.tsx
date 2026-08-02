import React from 'react'
import { profile, heroMetrics, education } from '../data'
import { MetricPlate } from './Primitives'

export const Hero: React.FC = () => {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-8 pt-28 sm:px-8 sm:pb-10 lg:px-14"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        {/* Identity line */}
        <div className="mb-6 flex flex-wrap sm:mb-8 items-center gap-x-5 gap-y-2">
          <span className="eyebrow">{profile.role}</span>
          <span className="h-px w-10" style={{ background: 'var(--hair-strong)' }} />
          <span className="font-data text-[0.625rem] uppercase tracking-[0.18em] text-[var(--slate)]">
            {profile.location}
          </span>
        </div>

        {/* Thesis — the one place the Didone goes big */}
        <h1 className="font-display max-w-[16ch] text-[clamp(2.75rem,8.5vw,7.5rem)] leading-[0.92] tracking-[-0.02em]">
          Vision and language
          <br />
          models that survive
          <br />
          <span
            className="italic"
            style={{
              color: 'var(--trace)',
              textShadow: '0 0 42px rgba(79,224,214,0.28)',
            }}
          >
            the real world
          </span>
          .
        </h1>

        <div className="mt-8 grid gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <p className="max-w-[46ch] text-[1.0625rem] leading-[1.65] text-[var(--bone)]/85">
            {profile.statement}
          </p>

          <div className="flex flex-col justify-end gap-6">
            <MetricPlate metrics={heroMetrics} />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-data text-[0.625rem] uppercase tracking-[0.16em] text-[var(--slate)]">
                {education.degree} · {education.school}
              </span>
              <span className="font-data text-[0.625rem] uppercase tracking-[0.16em] text-[var(--slate)]">
                {education.graduating}
              </span>
            </div>
          </div>
        </div>

        {/* Scroll cue — the footage advances with the page */}
        <div className="mt-10 flex items-center gap-3 sm:mt-14">
          <span
            className="font-data text-[0.5625rem] uppercase tracking-[0.24em]"
            style={{ color: 'var(--slate)' }}
          >
            Scroll — the frame advances
          </span>
          <svg width="30" height="8" viewBox="0 0 30 8" fill="none" aria-hidden="true">
            <path
              d="M0 4h26M22 1l4 3-4 3"
              stroke="var(--trace-dim)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
