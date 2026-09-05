'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIosStandalone } from '@/hooks/use-ios-standalone'

export default function LandingOrInstallGate() {
  const router = useRouter()
  const isStandalone = useIosStandalone()
  const [isIosBrowser, setIsIosBrowser] = useState<boolean | null>(null)
  const [formattedDate, setFormattedDate] = useState('')
  
  useEffect(() => {
    // Detect iOS Browser (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    setIsIosBrowser(isIOS)

    const today = new Date()
    setFormattedDate(today.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }))
  }, [])

  // Show a blank theme-matching screen while evaluating to prevent flicker
  if (isIosBrowser === null || !formattedDate) {
    return <div className="min-h-screen bg-parchment" />
  }

  const skipGate = process.env.NEXT_PUBLIC_SKIP_INSTALL_GATE === 'true'
  
  // Install Gate for iOS Safari not in standalone mode
  if (!skipGate && isIosBrowser && !isStandalone) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-parchment text-ink p-6 z-50">
        <div className="max-w-sm w-full flex flex-col items-center text-center relative h-full justify-center">
          <div className="w-20 h-20 bg-parchment-deep rounded-sm shadow-ledger border-l-2 border-ink/20 flex items-center justify-center mb-6 text-4xl font-serif">
            E
          </div>
          <h1 className="text-2xl font-serif italic mb-4 text-ink">Install Epoch</h1>
          <p className="text-lg text-ink/70 mb-12 font-sans">
            Add Epoch to your Home Screen to open your ledger.
          </p>
          
          {/* Pointer to the iOS Share button */}
          <div className="absolute bottom-12 flex flex-col items-center gap-3 text-amber-accent animate-bounce">
            <p className="font-sans font-medium text-sm">Tap Share, then Add to Home Screen</p>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  // Post-Install-Gate State: Landing Hero
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-parchment text-ink">
      <div className="bg-parchment-deep shadow-ledger p-10 max-w-sm w-full border-l-[12px] border-ink/90 flex flex-col items-center text-center">
        <h1 className="text-3xl font-serif italic mb-8 text-ink">
          {formattedDate}
        </h1>
        
        <button
          onClick={() => router.push('/ritual')}
          className="w-full bg-ink text-parchment font-serif px-6 py-4 rounded-sm shadow-md hover:shadow-lg active:shadow-inner active:scale-[0.98] transition-all disabled:opacity-50"
        >
          Open Today&apos;s Page
        </button>
      </div>
    </div>
  )
}
