import React, { useEffect, useState } from 'react'
import { profile } from '../data'

const links = [
  { id: 'research', label: 'Research' },
  { id: 'stack', label: 'Stack' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export const Navbar: React.FC = () => {
  const [lifted, setLifted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 transition-all duration-500"
        style={{
          background: lifted ? 'rgba(4,7,10,0.72)' : 'transparent',
          backdropFilter: lifted ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: lifted ? 'blur(16px)' : 'none',
          borderBottom: `1px solid ${lifted ? 'var(--hair)' : 'transparent'}`,
        }}
      >
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8 lg:px-14">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="tap-nav flex items-baseline gap-2.5"
            aria-label="Jiyad Hussain — home"
          >
            <span className="font-data text-sm font-medium tracking-[0.3em] text-[var(--bone)]">
              JH
            </span>
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: 'var(--trace)' }}
            />
            <span className="hidden font-data text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--slate)] sm:inline">
              {profile.role}
            </span>
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="font-data text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--slate)] transition-colors duration-300 hover:text-[var(--trace)]"
              >
                {l.label}
              </button>
            ))}
            <a
              href={`mailto:${profile.email}`}
              className="font-data border border-[var(--hair-strong)] px-4 py-2 text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--bone)] transition-all duration-300 hover:border-[var(--trace)] hover:text-[var(--trace)]"
            >
              Get in touch
            </a>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            aria-label="Open menu"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <path d="M4 8h18M4 14h18M4 20h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        className="fixed inset-0 z-50 md:hidden"
        style={{
          pointerEvents: open ? 'auto' : 'none',
          opacity: open ? 1 : 0,
          transition: 'opacity 350ms ease',
        }}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(4,7,10,0.96)', backdropFilter: 'blur(20px)' }}
          onClick={() => setOpen(false)}
        />
        <div className="relative flex h-full flex-col px-6 py-6">
          <div className="flex items-center justify-between">
            <span className="font-data text-sm tracking-[0.3em]">JH</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="-mr-2 flex h-11 w-11 items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                <path d="M6 6l14 14M20 6L6 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mt-16 flex flex-col gap-1">
            {links.map((l, i) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="border-b border-[var(--hair)] py-5 text-left"
              >
                <span className="font-data mr-4 text-[0.625rem] text-[var(--trace)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-3xl">{l.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-2">
            <a href={`mailto:${profile.email}`} className="tap block font-data text-xs text-[var(--slate)]">
              {profile.email}
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="tap block font-data text-xs text-[var(--slate)]">
              github.com/{profile.githubHandle}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
