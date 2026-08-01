import React from 'react'
import { X } from 'lucide-react'
import { Logo } from './Logo'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenProjects: () => void
  onOpenSchedule: () => void
  onOpenShowreel: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onOpenProjects,
  onOpenSchedule,
  onOpenShowreel,
}) => {
  const navItems = ['ABOUT', 'PROCESS', 'PROJECTS', 'CATALOG', 'D.O.T', 'TALK']

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, item: string) => {
    e.preventDefault()
    onClose()
    if (item === 'PROJECTS' || item === 'CATALOG' || item === 'ABOUT' || item === 'PROCESS') {
      onOpenProjects()
    } else if (item === 'TALK') {
      onOpenSchedule()
    } else if (item === 'D.O.T') {
      onOpenShowreel()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6">
        <Logo />
        <button
          onClick={onClose}
          className="p-2 hover:opacity-70 transition-opacity text-white"
          aria-label="Close Menu"
        >
          <X size={24} />
        </button>
      </div>

      {/* Nav links */}
      <div className="flex flex-col items-center justify-center flex-1 gap-8">
        {navItems.map((item, i) => (
          <a
            key={item}
            href="#"
            onClick={(e) => handleLinkClick(e, item)}
            style={{
              transitionDelay: isOpen ? `${100 + i * 60}ms` : '0ms',
            }}
            className={`text-2xl tracking-widest text-white hover:opacity-70 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  )
}
