'use client'

import { useState, useEffect } from 'react'
import { compressImage } from '@/lib/image-compress'

interface TokenUploadProps {
  onFileReady: (file: File | null, fallback: boolean) => void
}

export default function TokenUpload({ onFileReady }: TokenUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [fallbackActive, setFallbackActive] = useState(false)

  // Cleanup object URL on unmount or preview URL change to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      // User cancelled selection
      setPreviewUrl(null)
      setFallbackActive(false)
      onFileReady(null, false)
      return
    }

    setIsCompressing(true)
    setFallbackActive(false)

    try {
      const compressedFile = await compressImage(file)
      
      const newPreviewUrl = URL.createObjectURL(compressedFile)
      setPreviewUrl(newPreviewUrl)
      
      onFileReady(compressedFile, false)
    } catch (error) {
      console.error('Image compression failed:', error)
      setPreviewUrl(null)
      setFallbackActive(true)
      onFileReady(null, true)
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className={`
          cursor-pointer inline-flex items-center justify-center 
          bg-transparent border border-ink/30 text-ink font-serif px-5 py-2.5 rounded-sm hover:bg-ink/5 active:bg-ink/10 transition-colors
          ${isCompressing ? 'opacity-50 pointer-events-none' : ''}
        `}>
          {isCompressing ? 'Processing...' : 'Capture Token'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            disabled={isCompressing}
          />
        </label>
        
        {fallbackActive && (
          <p className="text-sm text-amber-accent font-medium italic">
            Photo unavailable — continuing with text only.
          </p>
        )}
      </div>

      {previewUrl && !fallbackActive && (
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-ink/20 shadow-sm mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={previewUrl} 
            alt="Token preview" 
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  )
}
