import { createClient } from '@/lib/supabase/server'
import EntryForm from '@/components/features/ritual/EntryForm'
import Link from 'next/link'

export default async function RitualPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Use local time for date comparison to match exactly how client forms it
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const today = `${yyyy}-${mm}-${dd}`
  
  const { data } = await supabase.from('entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .maybeSingle()
    
  if (data) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
        <div className="bg-parchment-deep shadow-ledger p-10 max-w-sm w-full text-center border-l-4 border-ink">
          <h2 className="font-serif text-2xl italic text-ink mb-4">Ledger Sealed</h2>
          <p className="text-ink/70 font-sans mb-8">You have already sealed your page for today.</p>
          <Link href="/archive" className="inline-block bg-transparent border border-ink/30 text-ink font-serif px-5 py-2.5 rounded-sm hover:bg-ink/5 active:bg-ink/10 transition-colors">
            View Archive
          </Link>
        </div>
      </div>
    )
  }

  // Get total entries count to know what "Day {N}" we are on
  const { count } = await supabase.from('entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const dayNumber = (count || 0) + 1

  return <EntryForm dayNumber={dayNumber} />
}
