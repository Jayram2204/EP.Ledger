import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  // Checking getUser() securely hits the Supabase auth API rather than just reading local cookies.
  // This guarantees the session is active and valid.
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-parchment text-ink font-sans">
      <main className="flex-grow pb-16">
        {children}
      </main>
      
      <nav className="fixed bottom-0 w-full bg-parchment border-t border-ink/10 flex justify-around p-3 pb-[max(1rem,env(safe-area-inset-bottom))] z-50">
        <Link 
          href="/ritual" 
          className="flex flex-col items-center text-ink/60 hover:text-amber-accent font-serif tracking-widest uppercase text-xs transition-colors"
        >
          <span>Today</span>
        </Link>
        <Link 
          href="/archive" 
          className="flex flex-col items-center text-ink/60 hover:text-amber-accent font-serif tracking-widest uppercase text-xs transition-colors"
        >
          <span>Archive</span>
        </Link>
      </nav>
    </div>
  )
}
