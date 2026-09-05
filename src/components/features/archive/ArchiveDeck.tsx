'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArchivePage, { ArchiveEntry } from './ArchivePage'

interface ArchiveDeckProps {
  entries: ArchiveEntry[]
}

// Framer Motion variants that mimic a page turning
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    rotateY: direction > 0 ? 45 : -45,
    rotateZ: direction > 0 ? 5 : -5,
    scale: 0.9,
    boxShadow: '0 0 0 rgba(0,0,0,0)'
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    rotateY: direction < 0 ? 45 : -45,
    rotateZ: direction < 0 ? 5 : -5,
    scale: 0.9,
    boxShadow: '0 0 0 rgba(0,0,0,0)'
  })
}

// Calculate velocity and offset for drag gesture
const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

export default function ArchiveDeck({ entries }: ArchiveDeckProps) {
  // Start at the most recent entry (end of the dense array)
  const [[page, direction], setPage] = useState([entries.length - 1, 0])

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection
    if (newPage >= 0 && newPage < entries.length) {
      setPage([newPage, newDirection])
    }
  }

  const currentEntry = entries[page]

  if (!entries || entries.length === 0) {
    return <div className="flex items-center justify-center h-full text-ink/40">No history available.</div>
  }

  return (
    <div 
      className="relative w-full h-full max-w-md mx-auto flex items-center justify-center overflow-hidden bg-parchment"
      style={{ perspective: 1200 }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            rotateY: { type: "spring", stiffness: 200, damping: 20 },
            rotateZ: { type: "spring", stiffness: 200, damping: 20 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)
            
            // Swipe Left (Go Forward in time)
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } 
            // Swipe Right (Go Backward in time)
            else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
          className="absolute inset-x-4 top-12 bottom-24 sm:inset-4 origin-bottom"
        >
          <ArchivePage entry={currentEntry} />
        </motion.div>
      </AnimatePresence>

      {/* Tap Zones for easier desktop/mobile non-swipe navigation */}
      <div 
        className={`absolute top-0 bottom-0 left-0 w-1/4 z-10 ${page > 0 ? 'cursor-pointer' : ''}`}
        onClick={() => paginate(-1)} 
      />
      <div 
        className={`absolute top-0 bottom-0 right-0 w-1/4 z-10 ${page < entries.length - 1 ? 'cursor-pointer' : ''}`}
        onClick={() => paginate(1)} 
      />

      {/* Visible Arrows for clarity */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 pointer-events-none z-20">
        <button 
          className={`pointer-events-auto bg-transparent border border-ink/30 text-ink font-serif px-5 py-2.5 rounded-sm hover:bg-ink/5 active:bg-ink/10 transition-colors disabled:opacity-50 ${page === 0 ? 'opacity-0' : 'opacity-100'}`}
          onClick={() => paginate(-1)}
          disabled={page === 0}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          className={`pointer-events-auto bg-transparent border border-ink/30 text-ink font-serif px-5 py-2.5 rounded-sm hover:bg-ink/5 active:bg-ink/10 transition-colors disabled:opacity-50 ${page === entries.length - 1 ? 'opacity-0' : 'opacity-100'}`}
          onClick={() => paginate(1)}
          disabled={page === entries.length - 1}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
