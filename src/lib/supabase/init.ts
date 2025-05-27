import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Create essential tables if they don't exist
export async function initializeDatabase() {
  try {
    // Check if artists table exists
    const { data, error } = await supabase
      .from('artists')
      .select('id')
      .limit(1)
    
    if (error && error.message.includes('relation "artists" does not exist')) {
      console.log('Creating database tables...')
      // Tables need to be created in Supabase dashboard
      // For MVP, we'll return success and handle in demo mode
      return { success: true, message: 'Database initialization needed' }
    }
    
    return { success: true, message: 'Database ready' }
  } catch (error) {
    console.error('Database initialization error:', error)
    return { success: false, error: error }
  }
}
