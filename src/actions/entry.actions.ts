'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { MOMENT_COUNT, MOMENT_MAX_LENGTH } from '@/config/constants'

// Define the expected shape of the Server Action input
export type SubmitEntryInput = {
  moments: string[]
  tokenFile?: File | Blob | null
  tokenFallback: boolean
}

// Zod schema for server-side validation
const EntrySchema = z.object({
  moments: z.array(
    z.string()
      .trim()
      .min(1, 'All moments must contain text.')
      .max(MOMENT_MAX_LENGTH, `Each moment is capped at ${MOMENT_MAX_LENGTH} characters.`)
  ).length(MOMENT_COUNT, `Exactly ${MOMENT_COUNT} moments are required.`),
  tokenFile: z.any().optional().nullable(),
  tokenFallback: z.boolean()
})

export async function submitEntry(payload: SubmitEntryInput) {
  try {
    // 1. Strict Server-Side Validation
    const validated = EntrySchema.safeParse(payload)
    if (!validated.success) {
      return { 
        success: false as const, 
        error: validated.error.errors[0]?.message || 'Validation failed.' 
      }
    }

    const { moments, tokenFile, tokenFallback: clientFallback } = validated.data

    // 2. Auth Check via server Supabase client
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return { success: false as const, error: 'Unauthorized: No active session.' }
    }
    const user = authData.user

    let token_url: string | null = null
    let token_fallback = clientFallback

    // Use current date for pathing
    const entryDate = new Date().toISOString().split('T')[0]

    // 3. Upload to Storage if provided and no client fallback
    if (tokenFile && !token_fallback) {
      const filePath = `${user.id}/${entryDate}.jpg`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tokens')
        .upload(filePath, tokenFile, {
          contentType: 'image/jpeg',
          upsert: true
        })
      
      if (uploadError) {
        console.error('[Server] Token upload failed, proceeding with fallback:', uploadError)
        // Fallback logic mirror: upload failed, continue text-only
        token_fallback = true
      } else {
        // We store the storage path to dynamically generate signed URLs later
        // because the 'tokens' bucket is strictly private.
        token_url = uploadData.path
      }
    }

    // 4. Insert into the database
    const { data: entryData, error: insertError } = await supabase.from('entries').insert({
      user_id: user.id,
      moments,
      token_url,
      token_fallback,
      sealed: true, // Always sealed immediately
      sealed_at: new Date().toISOString()
    }).select().single()

    // 5. Handle Unique Constraint Violations explicitly
    if (insertError) {
      if (insertError.code === '23505') {
        return { 
          success: false as const, 
          error: 'You have already sealed your ledger for today.' 
        }
      }
      console.error('[Server] Database insert failed:', insertError)
      return { success: false as const, error: 'Failed to save your entry to the ledger.' }
    }

    return { success: true as const, entry: entryData }

  } catch (err) {
    console.error('[Server] Unexpected error during submitEntry:', err)
    return { success: false as const, error: 'An unexpected server error occurred.' }
  }
}

export async function getArchiveEntries(startDate?: string, endDate?: string) {
  try {
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return { success: false as const, error: 'Unauthorized: No active session.' }
    }
    const user = authData.user

    // Default range: Last 30 days to today (inclusive)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date()
    if (!startDate) {
      start.setDate(end.getDate() - 30)
    }

    // Convert dates to YYYY-MM-DD strings for comparison using local time
    const yyyyEnd = end.getFullYear()
    const mmEnd = String(end.getMonth() + 1).padStart(2, '0')
    const ddEnd = String(end.getDate()).padStart(2, '0')
    const endStr = `${yyyyEnd}-${mmEnd}-${ddEnd}`

    const yyyyStart = start.getFullYear()
    const mmStart = String(start.getMonth() + 1).padStart(2, '0')
    const ddStart = String(start.getDate()).padStart(2, '0')
    const startStr = `${yyyyStart}-${mmStart}-${ddStart}`

    // Fetch entries in a single query (N+1 avoided)
    const { data: entries, error: fetchError } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', startStr)
      .lte('entry_date', endStr)
      .order('entry_date', { ascending: true })

    if (fetchError) {
      console.error('[Server] Failed to fetch archive entries:', fetchError)
      return { success: false as const, error: 'Failed to retrieve archive entries.' }
    }

    // Use our pure utility functions to build the dense array
    const { generateDateRange, mergeEntriesWithDates } = await import('@/lib/utils')
    const dateRange = generateDateRange(startStr, endStr)
    const denseArchive = mergeEntriesWithDates(dateRange, entries || [])

    return { success: true as const, data: denseArchive }
  } catch (err) {
    console.error('[Server] Unexpected error during getArchiveEntries:', err)
    return { success: false as const, error: 'An unexpected server error occurred.' }
  }
}
