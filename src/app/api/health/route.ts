import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables missing',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          urlPreview: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'MISSING'
        }
      })
    }

    // Try to import and create Supabase client
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    // Simple connection test
    const { data, error } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint
        }
      })
    }

    return NextResponse.json({
      success: true,
      database: true,
      artistCount: data || 0,
      timestamp: new Date().toISOString(),
      connection: 'OK'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined
      }
    }, { status: 500 })
  }
}