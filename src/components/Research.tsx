import React, { useState } from 'react'
import { projects, type Project } from '../data'
import { MetricPlate, Reveal, SectionHead } from './Primitives'

const Entry: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const [open, setOpen] = useState(index === 0)
  const ongoing = project.status === 'ongoing'

  return (
    <Reveal delay={index * 90}>
      <article className="border-t border-[var(--hair-strong)]">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="group grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-5 py-8 text-left sm:gap-x-8"
        >
          {/* Record number — these are a real, dated sequence */}
          <span className="font-data pt-1.5 text-[0.625rem] tracking-[0.16em] text-[var(--slate)]">
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span
                className="font-data inline-flex items-center gap-2 text-[0.5625rem] uppercase tracking-[0.2em]"
                style={{ color: ongoing ? 'var(--ember)' : 'var(--slate)' }}
              >
                {ongoing && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--ember)' }}
                  />
                )}
                {ongoing ? 'Ongoing' : 'Complete'}
              </span>
              <span className="font-data text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--slate)]">
                {project.period}
              </span>
            </div>

            <h3 className="font-display text-[clamp(1.5rem,3.4vw,2.5rem)] leading-[1.06] transition-colors duration-300 group-hover:text-[var(--trace)]">
              {project.title}
            </h3>
            <p className="mt-2 font-data text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--slate)]">
              {project.subtitle}
            </p>
            <p className="mt-5 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--bone)]/75">
              {project.summary}
            </p>
          </div>

          <span
            className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center border transition-all duration-300"
            style={{
              borderColor: open ? 'var(--trace)' : 'var(--hair-strong)',
              color: open ? 'var(--trace)' : 'var(--slate)',
            }}
            aria-hidden="true"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 0v11" stroke="currentColor" strokeWidth="1.2"
                style={{
                  transform: open ? 'scaleY(0)' : 'scaleY(1)',
                  transformOrigin: 'center',
                  transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)',
                }}
              />
              <path d="M0 5.5h11" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
        </button>

        {/* Detail drawer — grid-rows trick animates height without JS measuring */}
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="grid gap-10 pb-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-16 lg:pl-[3.25rem]">
              <ul className="space-y-4">
                {project.detail.map((d, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="mt-[0.6rem] h-px w-4 shrink-0"
                      style={{ background: 'var(--trace-dim)' }}
                      aria-hidden="true"
                    />
                    <span className="text-[0.9375rem] leading-[1.7] text-[var(--bone)]/80">
                      {d}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-8">
                <MetricPlate metrics={project.metrics} />
                <div>
                  <div className="eyebrow eyebrow-muted mb-4">Built with</div>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((s) => (
                      <span
                        key={s}
                        className="font-data border border-[var(--hair)] px-2.5 py-1.5 text-[0.625rem] tracking-[0.06em] text-[var(--bone)]/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export const Research: React.FC = () => (
  <section id="research" className="px-5 py-24 sm:px-8 lg:px-14 lg:py-36">
    <div className="mx-auto max-w-[1400px]">
      <Reveal>
        <SectionHead
          eyebrow="Selected work · 2025—2026"
          title={
            <>
              Three problems,
              <br />
              <span style={{ color: 'var(--slate)' }}>measured honestly.</span>
            </>
          }
          note="Every number below comes from a leaderboard or a dataset I built myself. Open an entry for the method."
        />
      </Reveal>

      <div className="border-b border-[var(--hair-strong)]">
        {projects.map((p, i) => (
          <Entry key={p.id} project={p} index={i} />
        ))}
      </div>
    </div>
  </section>
)
