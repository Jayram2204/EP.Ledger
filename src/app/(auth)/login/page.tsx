'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // We pass the origin for the redirect URL if an auth/callback route is added later
    const redirectUrl = `${window.location.origin}/auth/callback`
    
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    setIsLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-parchment text-ink">
        <div className="bg-parchment-deep p-8 shadow-ledger max-w-md w-full text-center border-l-4 border-ink">
          <h1 className="text-2xl font-serif italic mb-4">Check your email</h1>
          <p className="text-ink/80 font-sans">
            We sent a secure link to <span className="font-medium text-ink">{email}</span>. 
            Click the link to open your ledger.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-parchment text-ink">
      <div className="bg-parchment-deep p-8 shadow-ledger max-w-md w-full border-l-4 border-ink">
        <h1 className="text-3xl font-serif italic mb-6 text-center text-ink">Epoch</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-sm font-sans tracking-wide uppercase text-ink/70 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-3 bg-parchment border-b border-ink/20 focus:outline-none focus:border-amber-accent font-sans transition-colors placeholder:text-ink/30"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-amber-accent text-sm font-medium font-sans">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ink text-parchment font-serif px-6 py-4 rounded-sm shadow-md hover:shadow-lg active:shadow-inner active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Sending...' : 'Open Ledger'}
          </button>
        </form>
      </div>
    </div>
  )
}
