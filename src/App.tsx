import React, { useState } from 'react'
import { Navbar } from './components/Navbar'
import { MetaGrid } from './components/MetaGrid'
import { BottomSection } from './components/BottomSection'
import { MobileMenu } from './components/MobileMenu'
import { ShowreelModal } from './components/ShowreelModal'
import { ProjectsDrawer } from './components/ProjectsDrawer'
import { ScheduleModal } from './components/ScheduleModal'

export const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showreelOpen, setShowreelOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const cloudFrontVideoUrl =
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260725_114042_d2ed2a89-f2fa-449b-9609-da456344257b.mp4'

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Background Video (exact CloudFront URL) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        src={cloudFrontVideoUrl}
        className="absolute inset-0 h-full w-full object-cover lg:scale-[1.2]"
      />

      {/* UI Content Wrapper (z-10 above video) */}
      <div className="relative z-10 flex h-full flex-col px-5 sm:px-6 md:px-10 lg:px-14">
        {/* 1. Navbar */}
        <Navbar
          onOpenMenu={() => setMenuOpen(true)}
          onOpenProjects={() => setProjectsOpen(true)}
          onOpenSchedule={() => setScheduleOpen(true)}
          onOpenShowreel={() => setShowreelOpen(true)}
        />

        {/* 2. Four-Column Meta Grid */}
        <MetaGrid />

        {/* 3. Flex Spacer (pushes bottom section to viewport bottom) */}
        <div className="flex-1" />

        {/* 4. Bottom Section */}
        <BottomSection
          onOpenShowreel={() => setShowreelOpen(true)}
          onOpenSchedule={() => setScheduleOpen(true)}
          onOpenProjects={() => setProjectsOpen(true)}
        />
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProjects={() => setProjectsOpen(true)}
        onOpenSchedule={() => setScheduleOpen(true)}
        onOpenShowreel={() => setShowreelOpen(true)}
      />

      {/* Showreel Interactive Scrollable Video Modal */}
      <ShowreelModal
        isOpen={showreelOpen}
        onClose={() => setShowreelOpen(false)}
      />

      {/* Projects / GitHub Repositories Drawer */}
      <ProjectsDrawer
        isOpen={projectsOpen}
        onClose={() => setProjectsOpen(false)}
      />

      {/* Schedule a Call Modal */}
      <ScheduleModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
      />
    </div>
  )
}

export default App
