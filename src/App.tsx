import React from 'react'
import { HeroVideo } from './components/HeroVideo'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Research } from './components/Research'
import { Stack, About, Contact } from './components/Sections'
import { ScrollRail } from './components/Primitives'

export const App: React.FC = () => (
  <>
    <HeroVideo />
    <ScrollRail />
    <Navbar />
    <main className="relative z-10">
      <Hero />
      {/* Below the fold the footage recedes behind a solid wash so text stays legible */}
      <div
        className="relative"
        style={{
          background:
            'linear-gradient(to bottom, rgba(4,7,10,0.86) 0%, rgba(4,7,10,0.96) 12%, #04070a 30%)',
        }}
      >
        <Research />
        <Stack />
        <About />
        <Contact />
      </div>
    </main>
  </>
)

export default App
