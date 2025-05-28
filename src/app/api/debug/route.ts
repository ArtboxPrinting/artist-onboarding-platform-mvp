import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Step 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('ENV CHECK:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseAnonKey,
      urlStart: supabaseUrl?.substring(0, 20)
    })
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        step: 1,
        success: false,
        error: 'Environment variables missing',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey
        }
      })
    }

    // Step 2: Try to create Supabase client
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    console.log('CLIENT CREATED:', !!supabase)

    // Step 3: Test simple connection
    const { data: testData, error: testError } = await supabase
      .from('artists')
      .select('*')
      .limit(1)
    
    console.log('DB TEST:', { 
      hasData: !!testData, 
      error: testError?.message,
      errorCode: testError?.code 
    })

    if (testError) {
      return NextResponse.json({
        step: 3,
        success: false,
        error: 'Database query failed',
        details: {
          message: testError.message,
          code: testError.code,
          hint: testError.hint,
          details: testError.details
        }
      })
    }

    // Step 4: Return success with sample data
    return NextResponse.json({
      step: 4,
      success: true,
      message: 'Artists API debug successful',
      data: {
        artistCount: testData?.length || 0,
        sampleArtist: testData?.[0] || null,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('DEBUG ERROR:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error in debug',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
      }
    }, { status: 500 })
  }
}