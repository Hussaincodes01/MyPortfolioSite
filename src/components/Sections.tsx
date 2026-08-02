import React from 'react'
import {
  profile,
  skillGroups,
  education,
  certification,
  interests,
} from '../data'
import { Reveal, SectionHead } from './Primitives'

export const Stack: React.FC = () => (
  <section
    id="stack"
    className="border-t border-[var(--hair)] px-5 py-24 sm:px-8 lg:px-14 lg:py-36"
  >
    <div className="mx-auto max-w-[1400px]">
      <Reveal>
        <SectionHead
          eyebrow="Toolchain"
          title={
            <>
              What I actually
              <br />
              <span style={{ color: 'var(--slate)' }}>reach for.</span>
            </>
          }
        />
      </Reveal>

      <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3"
        style={{ background: 'var(--hair)' }}
      >
        {skillGroups.map((group, i) => (
          <Reveal key={group.label} delay={i * 70}>
            <div
              className="group h-full p-7 transition-colors duration-500"
              style={{ background: 'var(--void)' }}
            >
              <div className="mb-6 flex items-baseline justify-between">
                <span className="font-data text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--bone)]">
                  {group.label}
                </span>
                <span className="font-data text-[0.5625rem] tracking-[0.1em] text-[var(--slate)]">
                  {String(group.items.length).padStart(2, '0')}
                </span>
              </div>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-[0.875rem] text-[var(--bone)]/75"
                  >
                    <span
                      className="h-1 w-1 shrink-0 rounded-full"
                      style={{ background: 'var(--trace-dim)' }}
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              {group.note && (
                <p className="mt-5 max-w-[34ch] text-[0.8125rem] leading-relaxed text-[var(--slate)]">
                  {group.note}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)

export const About: React.FC = () => (
  <section
    id="about"
    className="border-t border-[var(--hair)] px-5 py-24 sm:px-8 lg:px-14 lg:py-36"
  >
    <div className="mx-auto max-w-[1400px]">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <div className="eyebrow mb-5">The short version</div>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.04]">
            {profile.first}{' '}
            <span style={{ color: 'var(--slate)' }}>{profile.last}</span>
          </h2>
          <p className="mt-8 max-w-[54ch] text-[1.0625rem] leading-[1.7] text-[var(--bone)]/85">
            {profile.secondary}
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            {interests.map((it) => (
              <span
                key={it}
                className="font-data border border-[var(--hair)] px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.14em] text-[var(--slate)]"
              >
                {it}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="space-y-px" style={{ background: 'var(--hair)' }}>
            <div className="surface p-6">
              <div className="eyebrow eyebrow-muted mb-3">Education</div>
              <div className="text-[0.9375rem] text-[var(--bone)]">
                {education.degree}
              </div>
              <div className="mt-1 text-sm text-[var(--slate)]">
                {education.school}
              </div>
              <div className="font-data mt-3 flex gap-4 text-[0.625rem] uppercase tracking-[0.14em] text-[var(--slate)]">
                <span>{education.grade}</span>
                <span>{education.graduating}</span>
              </div>
            </div>

            <div className="surface p-6">
              <div className="eyebrow eyebrow-muted mb-3">Certification</div>
              <div className="text-[0.9375rem] text-[var(--bone)]">
                {certification.name}
              </div>
              <div className="mt-1 text-sm text-[var(--slate)]">
                {certification.issuer} · {certification.issued}
              </div>
              <div className="font-data mt-3 break-all text-[0.625rem] tracking-[0.08em] text-[var(--slate)]">
                ID {certification.credential}
              </div>
            </div>

            <div className="surface p-6">
              <div className="eyebrow eyebrow-muted mb-3">Currently</div>
              <div className="flex items-center gap-2.5 text-[0.9375rem]">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--trace)' }}
                  aria-hidden="true"
                />
                <span style={{ color: 'var(--trace)' }}>
                  Open to internships and research roles
                </span>
              </div>
              <div className="mt-2 text-sm text-[var(--slate)]">
                {profile.focus}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
)

export const Contact: React.FC = () => (
  <footer
    id="contact"
    className="border-t border-[var(--hair-strong)] px-5 pb-10 pt-24 sm:px-8 lg:px-14 lg:pt-32"
  >
    <div className="mx-auto max-w-[1400px]">
      <Reveal>
        <div className="eyebrow mb-6">Contact</div>
        <a
          href={`mailto:${profile.email}`}
          className="font-display tap group inline-block text-[clamp(1.75rem,6vw,4.5rem)] leading-[1] tracking-[-0.02em] transition-colors duration-300 hover:text-[var(--trace)]"
        >
          <span className="break-all">{profile.email}</span>
        </a>

        <div className="mt-14 grid gap-8 border-t border-[var(--hair)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="eyebrow eyebrow-muted mb-2.5">GitHub</div>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="link tap font-data text-[0.75rem]"
            >
              {profile.githubHandle}
            </a>
          </div>
          <div>
            <div className="eyebrow eyebrow-muted mb-2.5">LinkedIn</div>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="link tap font-data text-[0.75rem]"
            >
              jiyad-hussain
            </a>
          </div>
          <div>
            <div className="eyebrow eyebrow-muted mb-2.5">Phone</div>
            <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="link tap font-data text-[0.75rem]">
              {profile.phone}
            </a>
          </div>
          <div>
            <div className="eyebrow eyebrow-muted mb-2.5">Based in</div>
            <span className="tap font-data text-[0.75rem] text-[var(--slate)]">
              {profile.location}
            </span>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-[var(--hair)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-data text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--slate)]">
            {profile.first} {profile.last} © {new Date().getFullYear()}
          </span>
          <span className="font-data text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--slate)]">
            React · TypeScript · Tailwind — deployed on Vercel
          </span>
        </div>
      </Reveal>
    </div>
  </footer>
)
