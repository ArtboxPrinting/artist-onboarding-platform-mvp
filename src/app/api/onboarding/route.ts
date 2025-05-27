import { NextRequest, NextResponse } from 'next/server'
import { createArtist, saveOnboardingSession, getArtist } from '@/lib/supabase/artists'
import { section1Schema } from '@/lib/validations/section1-schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the form data
    const validationResult = section1Schema.safeParse(body.formData || body)
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
    let artistId = body.artistId

    // If no artistId provided, create a new artist first
    if (!artistId) {
      const createResult = await createArtist(formData)
      
      if (createResult.error) {
        console.error('Error creating artist for draft:', createResult.error)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create artist for draft', 
            details: createResult.error 
          }, 
          { status: 500 }
        )
      }

      artistId = createResult.data?.artist.id
    } else {
      // Verify artist exists
      const artistResult = await getArtist(artistId)
      if (artistResult.error) {
        console.error('Error verifying artist:', artistResult.error)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Artist not found', 
            details: artistResult.error 
          }, 
          { status: 404 }
        )
      }
    }

    // Save the onboarding session
    const sessionResult = await saveOnboardingSession(
      artistId!,
      body.sectionNumber || 1,
      formData,
      body.sessionToken
    )

    if (sessionResult.error) {
      console.error('Error saving draft session:', sessionResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save draft', 
          details: sessionResult.error 
        }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        artistId: artistId,
        sessionToken: sessionResult.data?.session_token,
        message: 'Draft saved successfully'
      }
    })
  } catch (error) {
    console.error('Unexpected error saving draft:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    )
  }
}
