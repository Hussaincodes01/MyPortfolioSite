import React, { useRef, useState, useEffect } from 'react'
import { X, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react'

interface ShowreelModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ShowreelModal: React.FC<ShowreelModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isScrubbingByScroll, setIsScrubbingByScroll] = useState(false)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [isOpen])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const cur = videoRef.current.currentTime
    const dur = videoRef.current.duration || 1
    setCurrentTime(cur)
    setDuration(dur)
    setProgress((cur / dur) * 100)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const newTime = (parseFloat(e.target.value) / 100) * duration
    videoRef.current.currentTime = newTime
    setProgress(parseFloat(e.target.value))
  }

  // Mouse wheel scrollable scrubbing feature
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    e.preventDefault()
    setIsScrubbingByScroll(true)
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
    const delta = e.deltaY > 0 ? 0.3 : -0.3
    let newTime = videoRef.current.currentTime + delta
    if (newTime < 0) newTime = 0
    if (newTime > duration) newTime = duration
    videoRef.current.currentTime = newTime

    setTimeout(() => setIsScrubbingByScroll(false), 800)
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 md:p-10">
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        className="relative w-full max-w-5xl bg-[#090909] border border-white/20 rounded-xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs text-red-500 uppercase tracking-widest px-2 py-0.5 border border-red-500/30 rounded bg-red-500/10">
              Interactive Scrollable Video
            </span>
            <span className="font-pixel text-xs text-white/60">
              Scroll wheel anywhere on video to scrub frames
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            src="/Man_with_glowing_facial_lines_202608020100.mp4"
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
            onClick={togglePlay}
            loop
            playsInline
          />

          {/* Scroll Overlay Hint */}
          {isScrubbingByScroll && (
            <div className="absolute top-4 right-4 bg-black/80 text-white border border-white/20 px-3 py-1.5 rounded text-xs font-pixel animate-pulse flex items-center gap-2">
              <RotateCcw size={12} />
              SCROLL SCRUBBING ({formatTime(currentTime)})
            </div>
          )}

          {/* Play/Pause Overlay indicator */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="p-4 rounded-full bg-black/60 border border-white/30 backdrop-blur-sm text-white hover:scale-110 transition-transform">
              {isPlaying ? <Pause size={32} /> : <Play size={32} fill="white" className="ml-1" />}
            </div>
          </button>
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-[#090909] border-t border-white/10 flex flex-col gap-3">
          {/* Progress / Scrubbing slider */}
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs text-white/60 min-w-[36px]">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <span className="font-pixel text-xs text-white/60 min-w-[36px]">{formatTime(duration)}</span>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-pixel tracking-wider transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} fill="white" />}
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                onClick={toggleMute}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            <div className="text-xs font-pixel text-white/40">
              USE SCROLL WHEEL TO SCRUB TIMELINE
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
