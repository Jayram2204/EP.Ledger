'use client'

export type ArchiveEntry = {
  entry_date: string
  moments?: string[]
  token_url?: string | null
  token_fallback?: boolean
  isBlank?: boolean
}

interface ArchivePageProps {
  entry: ArchiveEntry
}

export default function ArchivePage({ entry }: ArchivePageProps) {
  // Format date nicely. Using UTC keeps it locked to the YYYY-MM-DD string visually
  const d = new Date(entry.entry_date)
  const dateStr = d.toLocaleDateString(undefined, {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long', 
    day: 'numeric' 
  })

  // Visual state 1: Blank textured page
  if (entry.isBlank) {
    return (
      <div className="w-full h-full rounded-sm border border-ink/10 bg-parchment-deep shadow-sm relative overflow-hidden flex flex-col items-center justify-center">

        <div className="absolute bottom-6 right-6 text-ink/30 text-xs font-sans tracking-widest uppercase">
          {dateStr}
        </div>
      </div>
    )
  }

  // Visual state 2: Real entry
  return (
    <div className="w-full h-full rounded-sm border border-ink/10 bg-parchment-deep shadow-sm relative overflow-hidden flex flex-col p-6 sm:p-8">
      <header className="mb-8 text-center flex-shrink-0">
        <h2 className="font-serif text-2xl italic font-medium tracking-wide text-ink">
          {dateStr}
        </h2>
      </header>
      
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-4">
        {/* Moments */}
        <div className="flex flex-col gap-6">
          {entry.moments?.map((moment, i) => (
            <div key={i} className="border-b border-ink/10 pb-2">
              <p className="font-serif text-xl sm:text-2xl text-ink leading-relaxed" style={{ fontStyle: 'italic' }}>
                {moment}
              </p>
            </div>
          ))}
        </div>

        {/* Token Area */}
        <div className="mt-auto pt-6 flex flex-col items-center">
          {entry.token_fallback || !entry.token_url ? (
            <div className="w-16 h-16 rounded-full border border-ink/10 flex items-center justify-center bg-ink/5">
              <span className="text-[10px] text-ink/40 uppercase tracking-widest text-center leading-tight">
                Text<br/>Only
              </span>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-ink/20 shadow-sm">
              {/* Note: The bucket is private. If accessing without signed URLs from a client component, 
                  we require the browser to pass the Supabase session cookie to a Next.js route,
                  or we can proxy it, or we rely on signed urls. 
                  For now, we render a placeholder block with a file icon to satisfy the visual requirement 
                  until the signed URL pipeline is implemented. */}
              <div className="w-full h-full bg-ink/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
