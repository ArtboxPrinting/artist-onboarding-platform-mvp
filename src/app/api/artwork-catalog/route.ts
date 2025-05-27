import { NextRequest, NextResponse } from "next/server"
import { createArtwork, updateArtwork, getArtworks } from "@/lib/supabase/artists"
import { section2Schema } from "@/lib/validations/section2-schema"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData, artistId, artworkId } = body

    // Validate the form data
    const validatedData = section2Schema.parse(formData)

    let result
    if (artworkId) {
      // Update existing artwork
      result = await updateArtwork(artworkId, validatedData)
    } else {
      // Create new artwork
      result = await createArtwork(artistId, validatedData)
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: artworkId ? "Artwork updated successfully" : "Artwork created successfully"
    })

  } catch (error) {
    console.error("Error in artwork-catalog API:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to process artwork catalog request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get("artistId")

    if (!artistId) {
      return NextResponse.json(
        { success: false, error: "Artist ID is required" },
        { status: 400 }
      )
    }

    const result = await getArtworks(artistId)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error("Error in artwork-catalog GET:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch artwork data" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { artworkId, formData } = body

    if (!artworkId) {
      return NextResponse.json(
        { success: false, error: "Artwork ID is required" },
        { status: 400 }
      )
    }

    // Validate the form data
    const validatedData = section2Schema.parse(formData)

    const result = await updateArtwork(artworkId, validatedData)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Artwork updated successfully"
    })

  } catch (error) {
    console.error("Error in artwork-catalog PUT:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update artwork" },
      { status: 500 }
    )
  }
}
