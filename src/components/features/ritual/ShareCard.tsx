'use client'

import { useEffect, useRef, useState } from 'react'

interface ShareCardProps {
  dayNumber: number
  dateStr: string
}

export default function ShareCard({ dayNumber, dateStr }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [blob, setBlob] = useState<Blob | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Create a high-res square image (1080x1080) for sharing
    canvas.width = 1080
    return drawCard(canvas)
  }, [dayNumber, dateStr])

  const drawCard = (canvas: HTMLCanvasElement) => {
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background: parchment
    ctx.fillStyle = '#F7F5F0'
    ctx.fillRect(0, 0, 1080, 1080)

    // Inner border: ink
    ctx.strokeStyle = '#1A1918'
    ctx.lineWidth = 12
    ctx.strokeRect(60, 60, 960, 960)

    // Center E Logo block
    ctx.fillStyle = '#EAE7DF' // parchment-deep
    ctx.fillRect(440, 240, 200, 200)

    ctx.fillStyle = '#1A1918' // ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Next.js uses Newsreader but canvas doesn't easily have it unless it's loaded system-wide
    // We fall back to standard serif for the canvas
    ctx.font = 'italic 100px serif'
    ctx.fillText('E', 540, 355)

    // Main text
    ctx.fillStyle = '#1A1918'
    ctx.font = 'italic 65px serif'
    ctx.fillText(`Epoch // Day ${dayNumber}`, 540, 620)
    ctx.fillText('— Sealed —', 540, 720)

    // Date
    ctx.fillStyle = '#B8895F' // amber-accent
    ctx.font = '45px sans-serif'
    ctx.fillText(dateStr.toUpperCase(), 540, 880)

    canvas.toBlob((b) => {
      if (b) setBlob(b)
    }, 'image/jpeg', 0.9)
  }

  const handleShare = async () => {
    if (!blob) return

    const file = new File([blob], `epoch-day-${dayNumber}.jpg`, { type: 'image/jpeg' })
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Epoch',
          text: `Day ${dayNumber} is sealed.`,
          files: [file]
        })
      } catch (err) {
        // User cancelled or share failed silently, which is fine
        console.log('Share aborted or failed', err)
      }
    } else {
      // Fallback for browsers that don't support file sharing
      alert("Your device doesn't support direct file sharing, but you can long-press or right-click the image to save it!")
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[280px] aspect-square rounded-sm border border-ink/10 bg-parchment-deep shadow-sm overflow-hidden mb-8">
        {/* We display the canvas scaled down via CSS for the user to see what they are sharing */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-contain bg-parchment"
        />
      </div>

      <button 
        onClick={handleShare}
        disabled={!blob}
        className="w-full bg-transparent border border-ink/30 text-ink font-serif px-5 py-2.5 rounded-sm hover:bg-ink/5 active:bg-ink/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Card
      </button>
    </div>
  )
}
