import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = await createClient()
    
    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    console.log('Fetching artists with params:', { search, status, page, limit })

    // Start with simple query - get all columns to avoid column name issues
    let artistsQuery = supabase
      .from('artists')
      .select('*')

    // Apply filters if provided
    if (search) {
      artistsQuery = artistsQuery.or(`full_name.ilike.%${search}%,studio_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      artistsQuery = artistsQuery.eq('status', status)
    }

    // Apply pagination and ordering
    artistsQuery = artistsQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    console.log('Executing query...')
    const { data: artists, error: artistsError, count } = await artistsQuery

    if (artistsError) {
      console.error('Database query error:', artistsError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed', 
          details: {
            message: artistsError.message,
            code: artistsError.code,
            hint: artistsError.hint
          }
        }, 
        { status: 500 }
      )
    }

    console.log('Query successful, found artists:', artists?.length || 0)

    // Transform data to match admin dashboard format
    const transformedData = artists?.map(artist => ({
      id: artist.artist_id || artist.id,
      firstName: artist.full_name?.split(' ')[0] || '',
      lastName: artist.full_name?.split(' ').slice(1).join(' ') || '',
      fullName: artist.full_name || '',
      studioName: artist.studio_name || '',
      email: artist.email || '',
      phone: artist.phone || '',
      location: artist.location || '',
      status: artist.status || 'draft',
      completedSections: [],
      artworkCount: 0,
      variantCount: 0,
      lastUpdated: artist.updated_at,
      submissionDate: artist.created_at,
      completionPercentage: 25, // Default for section 1 completed
      rawData: artist // Include raw data for debugging
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      debug: {
        queryExecuted: true,
        artistsFound: artists?.length || 0,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Unexpected error in artists API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: error instanceof Error ? error.constructor.name : 'Unknown',
          stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined
        }
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('Creating/updating artist:', body)

    // Simple insert/update logic
    if (body.artistId) {
      // Update existing artist
      const { data, error } = await supabase
        .from('artists')
        .update(body)
        .eq('artist_id', body.artistId)
        .select()
        .single()

      if (error) {
        console.error('Update error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to update artist', details: error }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        data,
        message: 'Artist updated successfully'
      })
    } else {
      // Create new artist
      const { data, error } = await supabase
        .from('artists')
        .insert(body)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to create artist', details: error }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        data,
        message: 'Artist created successfully'
      }, { status: 201 })
    }
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}