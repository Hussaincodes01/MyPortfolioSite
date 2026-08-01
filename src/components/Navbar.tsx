import React from 'react'
import { Menu } from 'lucide-react'
import { Logo } from './Logo'

interface NavbarProps {
  onOpenMenu: () => void
  onOpenProjects: () => void
  onOpenSchedule: () => void
  onOpenShowreel: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMenu,
  onOpenProjects,
  onOpenSchedule,
  onOpenShowreel,
}) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: string) => {
    e.preventDefault()
    if (item === 'PROJECTS' || item === 'CATALOG' || item === 'ABOUT' || item === 'PROCESS') {
      onOpenProjects()
    } else if (item === 'TALK') {
      onOpenSchedule()
    } else if (item === 'D.O.T') {
      onOpenShowreel()
    }
  }

  const navItems = ['ABOUT', 'PROCESS', 'PROJECTS', 'CATALOG', 'D.O.T', 'TALK']

  return (
    <nav className="flex items-center justify-between py-6">
      {/* Left: logo SVG */}
      <a href="#" className="hover:opacity-80 transition-opacity" aria-label="Logo">
        <Logo />
      </a>

      {/* Right desktop (md+): horizontal links */}
      <div className="hidden md:flex items-center gap-8 text-sm tracking-wide">
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            onClick={(e) => handleNavClick(e, item)}
            className="hover:opacity-70 transition-opacity text-white"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Right mobile (<md): hamburger button */}
      <button
        onClick={onOpenMenu}
        className="md:hidden p-2 hover:opacity-70 transition-opacity text-white"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>
    </nav>
  )
}
