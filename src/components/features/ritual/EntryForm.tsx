'use client'

import { useState, useEffect, useTransition } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { MOMENT_MAX_LENGTH, MOMENT_COUNT } from '@/config/constants'
import { submitEntry } from '@/actions/entry.actions'
import { useRouter } from 'next/navigation'
import TokenUpload from './TokenUpload'
import SealButton from './SealButton'
import SealAnimation from './SealAnimation'
import ShareCard from './ShareCard'

interface EntryFormProps {
  dayNumber: number
}

export default function EntryForm({ dayNumber }: EntryFormProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [dateKey, setDateKey] = useState('')
  const [formattedDate, setFormattedDate] = useState('')
  const [isLate, setIsLate] = useState(false)

  const [tokenFile, setTokenFile] = useState<File | null>(null)
  const [tokenFallback, setTokenFallback] = useState(false)
  
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSealing, setIsSealing] = useState(false)
  const [isSealed, setIsSealed] = useState(false) // Triggered after animation completes
  
  // Persist draft in localStorage
  const [draft, setDraft, removeDraft] = useLocalStorage<string[]>(
    dateKey ? `epoch-draft-${dateKey}` : 'epoch-draft-loading',
    Array(MOMENT_COUNT).fill('')
  )

  useEffect(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    
    setDateKey(`${yyyy}-${mm}-${dd}`)
    setFormattedDate(today.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }))
    
    // Check if it's 9:00 PM or later
    if (today.getHours() >= 21) {
      setIsLate(true)
    }
    
    setMounted(true)
  }, [])

  const handleMomentChange = (index: number, value: string) => {
    const truncated = value.slice(0, MOMENT_MAX_LENGTH)
    const newDraft = [...draft]
    newDraft[index] = truncated
    setDraft(newDraft)
  }

  const handleTokenReady = (file: File | null, fallback: boolean) => {
    setTokenFile(file)
    setTokenFallback(fallback)
  }

  const handleSealClick = async () => {
    setErrorMsg(null)
    
    // Check if the form is actually filled out
    const hasEmpty = draft.some(text => text.trim().length === 0)
    if (hasEmpty) {
      setErrorMsg('All moments must be filled out before sealing.')
      return
    }

    startTransition(async () => {
      const result = await submitEntry({
        moments: draft,
        tokenFile,
        tokenFallback
      })

      if (!result.success) {
        setErrorMsg(result.error)
      } else {
        // Success: play the animation and clear draft
        setIsSealing(true)
        removeDraft()
      }
    })
  }

  const handleSealComplete = () => {
    // Show the share screen
    setIsSealed(true)
  }

  if (!mounted || !dateKey) {
    return <div className="w-full max-w-md mx-auto min-h-screen bg-parchment" />
  }

  if (isSealed) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-parchment text-ink flex flex-col items-center justify-center p-6">
        <ShareCard dayNumber={dayNumber} dateStr={formattedDate} />
        
        <button 
          onClick={() => router.push('/archive')}
          className="mt-12 bg-transparent border border-ink/30 text-ink font-serif px-5 py-2.5 rounded-sm hover:bg-ink/5 active:bg-ink/10 transition-colors disabled:opacity-50"
        >
          View Archive
        </button>
      </div>
    )
  }

  const isFormDisabled = isPending || isSealing

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 flex flex-col min-h-screen bg-parchment text-ink">
      <SealAnimation isSealing={isSealing} onComplete={handleSealComplete}>
        <div className="flex-1 flex flex-col w-full h-full rounded-sm border border-ink/10 bg-parchment-deep shadow-sm p-2 sm:p-4">
          
          {/* Simulated Local Notification Banner */}
          {isLate && !isSealing && (
            <div className="bg-ink/5 border border-ink/10 rounded-md p-3 mb-6 text-center animate-pulse">
              <p className="text-sm font-sans text-ink/70">Your page is still open.</p>
            </div>
          )}

          <header className="mb-10 text-center">
            <h1 className="font-serif text-3xl italic font-medium tracking-wide">
              {formattedDate}
            </h1>
            <p className="text-xs text-ink/60 mt-3 uppercase tracking-widest">
              Daily Ledger
            </p>
          </header>

          <form className="flex-1 flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-6">
              {Array.from({ length: MOMENT_COUNT }).map((_, index) => {
                const text = draft[index] || ''
                const isNearLimit = text.length > MOMENT_MAX_LENGTH - 10
                
                return (
                  <div key={index} className="relative flex items-center">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => handleMomentChange(index, e.target.value)}
                      maxLength={MOMENT_MAX_LENGTH}
                      placeholder="A moment from today..."
                      disabled={isFormDisabled}
                      className="w-full bg-transparent border-b border-ink/20 focus:border-amber-accent outline-none py-3 pr-12 text-lg font-serif transition-colors placeholder:text-ink/30 placeholder:italic disabled:opacity-50"
                    />
                    <span 
                      className={`absolute right-0 text-xs transition-colors ${
                        isNearLimit ? 'text-amber-accent font-medium' : 'text-ink/40'
                      }`}
                    >
                      {text.length}/{MOMENT_MAX_LENGTH}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-8">
              <TokenUpload onFileReady={handleTokenReady} />
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-sm text-red-600 font-medium text-center">{errorMsg}</p>
              </div>
            )}

            <div className="mt-auto pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <SealButton 
                onClick={handleSealClick} 
                isLoading={isPending} 
                disabled={isSealing} 
              />
            </div>
          </form>
        </div>
      </SealAnimation>
    </div>
  )
}
