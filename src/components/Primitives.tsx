import React, { useEffect, useRef, useState } from 'react'

/** The signature element: hairline-divided monospace readout of real numbers. */
export const MetricPlate: React.FC<{
  metrics: { value: string; label: string }[]
  className?: string
}> = ({ metrics, className = '' }) => (
  <div className={`plate ${className}`}>
    {metrics.map((m) => (
      <div key={m.label} className="plate-cell">
        <div className="plate-value">{m.value}</div>
        <div className="plate-label">{m.label}</div>
      </div>
    ))}
  </div>
)

/** Fades content up once it enters view. IntersectionObserver, no library. */
export const Reveal: React.FC<{
  children: React.ReactNode
  delay?: number
  className?: string
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${seen ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/** Left-edge circuit trace tracking scroll progress. */
export const ScrollRail: React.FC = () => {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = fillRef.current
    if (!el) return
    let raf = 0

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      el.style.transform = `scaleY(${p})`
      raf = 0
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="rail" aria-hidden="true">
      <div ref={fillRef} className="rail-fill" style={{ transform: 'scaleY(0)' }} />
    </div>
  )
}

export const SectionHead: React.FC<{
  eyebrow: string
  title: React.ReactNode
  note?: string
}> = ({ eyebrow, title, note }) => (
  <div className="mb-14 max-w-3xl">
    <div className="eyebrow mb-5">{eyebrow}</div>
    <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02]">
      {title}
    </h2>
    {note && (
      <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--slate)]">
        {note}
      </p>
    )}
  </div>
)
