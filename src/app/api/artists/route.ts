import { NextRequest, NextResponse } from 'next/server'
import { createArtist, updateArtist } from '@/lib/supabase/artists'
import { section1Schema } from '@/lib/validations/section1-schema'
import { createClient } from '@/lib/supabase/server'

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
        error: 'Internal server error' 
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('artist_overview')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,studio_name.ilike.%${search}%,email.ilike.%${search}%,artist_id.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching artists:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch artists', 
          details: error 
        }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
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
        error: 'Internal server error' 
      }, 
      { status: 500 }
    )
  }
}
