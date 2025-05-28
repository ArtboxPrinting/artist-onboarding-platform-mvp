import { NextRequest, NextResponse } from 'next/server'
import { createArtist, updateArtist } from '@/lib/supabase/artists'
import { section1Schema } from '@/lib/validations/section1-schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the form data
    const validationResult = section1Schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      )
    }

    const formData = validationResult.data

    // Check if artist already exists (update vs create)
    if (body.artistId) {
      // Update existing artist
      const result = await updateArtist(body.artistId, formData)
      
      if (result.error) {
        console.error('Error updating artist:', result.error)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update artist', 
            details: result.error 
          }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        data: result.data,
        message: 'Artist updated successfully'
      })
    } else {
      // Create new artist
      const result = await createArtist(formData)
      
      if (result.error) {
        console.error('Error creating artist:', result.error)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create artist', 
            details: result.error 
          }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        data: result.data,
        message: 'Artist created successfully'
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Unexpected error in artists API:', error)
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

export async function GET(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables not configured',
        details: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 500 })
    }

    // Import and create client
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Start with simple query to test connection
    let artistsQuery = supabase
      .from('artists')
      .select(`
        id,
        artist_id,
        full_name,
        studio_name,
        email,
        phone,
        location,
        status,
        created_at,
        updated_at
      `)

    // Apply filters
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

    const { data: artists, error: artistsError, count } = await artistsQuery

    if (artistsError) {
      console.error('Error fetching artists:', artistsError)
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

    // Transform data to match expected format
    const transformedData = artists?.map(artist => ({
      id: artist.artist_id || artist.id,
      firstName: artist.full_name?.split(' ')[0] || '',
      lastName: artist.full_name?.split(' ').slice(1).join(' ') || '',
      studioName: artist.studio_name || '',
      email: artist.email,
      phone: artist.phone,
      status: artist.status,
      completedSections: [], // Will be populated by separate query later
      artworkCount: 0,
      variantCount: 0,
      lastUpdated: artist.updated_at,
      submissionDate: artist.created_at,
      completionPercentage: 0
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error fetching artists:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      }, 
      { status: 500 }
    )
  }
}