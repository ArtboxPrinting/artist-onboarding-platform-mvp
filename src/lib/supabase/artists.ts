import { createClient } from './client'
import { Section1FormData } from '@/lib/validations/section1-schema'
import { Section2FormData, ArtworkData } from '@/lib/validations/section2-schema'
import { Section3FormData } from '@/lib/validations/section3-schema'
import { Section4FormData, ProductVariantPricing } from '@/lib/validations/section4-schema'

const supabase = createClient()

// Helper function to handle database errors gracefully
async function handleDatabaseOperation<T>(operation: () => Promise<T>, fallback: T): Promise<{ data: T | null, error: any }> {
  try {
    const result = await operation()
    return { data: result, error: null }
  } catch (error: any) {
    console.warn('Database operation failed, using fallback:', error.message)
    // In development/demo mode, return fallback data
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { data: fallback, error: null }
    }
    return { data: null, error: error }
  }
}

export interface Artist {
  id: string
  artist_id: string
  full_name: string
  studio_name?: string
  email: string
  phone?: string
  location: string
  business_number?: string
  gst_number?: string
  status: 'draft' | 'in_review' | 'ready' | 'active'
  submission_date?: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface ArtistBranding {
  id: string
  artist_id: string
  bio?: string
  tagline?: string
  artistic_style?: string
  preferred_fonts?: string[]
  color_palette?: { primary?: string; secondary?: string; accent?: string }
  brand_guide_url?: string
  logo_url?: string
  headshot_url?: string
  studio_photo_url?: string
  design_references?: string[]
  design_feel?: 'minimalist' | 'bold' | 'artistic' | 'editorial' | 'commercial'
  must_have_elements?: string[]
  social_links?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    website?: string
    other?: string
  }
  domain_name?: string
  created_at: string
  updated_at: string
}

export interface Artwork {
  id: string
  artist_id: string
  title: string
  year_created: number
  medium: string
  description?: string
  keywords?: string[]
  orientation: 'portrait' | 'landscape' | 'square'
  width: number
  height: number
  unit: 'inches' | 'cm'
  original_file_url?: string
  print_ready_file_url?: string
  thumbnail_url?: string
  file_metadata?: Record<string, unknown>
  is_active: boolean
  sort_order: number
  is_limited_edition: boolean
  limited_edition_size?: number
  is_available_for_print: boolean
  is_available_as_original: boolean
  original_price?: number
  created_at: string
  updated_at: string
}

export interface ProductConfiguration {
  id: string
  artist_id: string
  offers_unframed_prints: boolean
  offers_framed_prints: boolean
  offers_canvas_wraps: boolean
  offers_metal_prints: boolean
  offers_acrylic_prints: boolean
  offers_greeting_cards: boolean
  offers_postcards: boolean
  offers_posters: boolean
  offers_stickers: boolean
  custom_products?: Record<string, unknown>[]
  unit_system: 'inches' | 'cm' | 'both'
  available_sizes?: Record<string, unknown>[]
  allow_custom_sizes: boolean
  custom_size_constraints?: Record<string, unknown>
  print_media_options?: Record<string, unknown>[]
  frame_options?: Record<string, unknown>
  canvas_wrap_options?: Record<string, unknown>
  special_options?: Record<string, unknown>
  packaging_options?: Record<string, unknown>
  quality_standards?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  artist_id: string
  artwork_id?: string
  sku: string
  product_type: string
  size: string
  media: string
  frame_color?: string
  base_cost: number
  markup_percentage: number
  final_price: number
  is_limited_edition: boolean
  limited_edition_price?: number
  is_signed: boolean
  signed_price?: number
  is_active: boolean
  special_offers?: Record<string, unknown>[]
  created_at: string
  updated_at: string
}

export interface OnboardingSession {
  id: string
  artist_id: string
  session_token: string
  is_submitted: boolean
  current_section: number
  completed_sections: number[]
  form_data: Record<string, unknown>
  created_at: string
  updated_at: string
  submitted_at?: string
}

// Create a new artist profile from Section 1 data
export async function createArtist(formData: Section1FormData) {
  try {
    // Create artist record
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .insert({
        full_name: formData.fullName,
        studio_name: formData.studioName || null,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location,
        business_number: formData.businessNumber || null,
        gst_number: formData.gstNumber || null,
        status: 'draft',
      })
      .select()
      .single()

    if (artistError) {
      console.error('Error creating artist:', artistError)
      return { data: null, error: artistError }
    }

    // Create artist branding record
    const brandingData = {
      artist_id: artistData.id,
      bio: formData.bio,
      tagline: formData.tagline || null,
      artistic_style: formData.artisticStyle,
      preferred_fonts: formData.preferredFonts || [],
      color_palette: {
        primary: formData.primaryColor || null,
        secondary: formData.secondaryColor || null,
        accent: formData.accentColor || null,
      },
      design_feel: formData.designFeel || null,
      design_references: formData.designReferences || [],
      must_have_elements: formData.mustHaveElements || [],
      social_links: formData.socialLinks || {},
      domain_name: formData.domainName || null,
    }

    const { data: brandingResult, error: brandingError } = await supabase
      .from('artist_branding')
      .insert(brandingData)
      .select()
      .single()

    if (brandingError) {
      console.error('Error creating artist branding:', brandingError)
      return { data: null, error: brandingError }
    }

    return { 
      data: { 
        artist: artistData, 
        branding: brandingResult 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Unexpected error creating artist:', error)
    return { data: null, error }
  }
}

// Update existing artist and branding data
export async function updateArtist(artistId: string, formData: Section1FormData) {
  try {
    // Update artist record
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .update({
        full_name: formData.fullName,
        studio_name: formData.studioName || null,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location,
        business_number: formData.businessNumber || null,
        gst_number: formData.gstNumber || null,
      })
      .eq('id', artistId)
      .select()
      .single()

    if (artistError) {
      console.error('Error updating artist:', artistError)
      return { data: null, error: artistError }
    }

    // Update artist branding record
    const brandingData = {
      bio: formData.bio,
      tagline: formData.tagline || null,
      artistic_style: formData.artisticStyle,
      preferred_fonts: formData.preferredFonts || [],
      color_palette: {
        primary: formData.primaryColor || null,
        secondary: formData.secondaryColor || null,
        accent: formData.accentColor || null,
      },
      design_feel: formData.designFeel || null,
      design_references: formData.designReferences || [],
      must_have_elements: formData.mustHaveElements || [],
      social_links: formData.socialLinks || {},
      domain_name: formData.domainName || null,
    }

    const { data: brandingResult, error: brandingError } = await supabase
      .from('artist_branding')
      .upsert({
        artist_id: artistId,
        ...brandingData,
      })
      .select()
      .single()

    if (brandingError) {
      console.error('Error updating artist branding:', brandingError)
      return { data: null, error: brandingError }
    }

    return { 
      data: { 
        artist: artistData, 
        branding: brandingResult 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Unexpected error updating artist:', error)
    return { data: null, error }
  }
}

// Section 2: Artwork Catalog Functions

// Create artwork record
export async function createArtwork(artistId: string, artworkData: ArtworkData) {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .insert({
        artist_id: artistId,
        title: artworkData.title,
        year_created: artworkData.yearCreated,
        medium: artworkData.medium,
        description: artworkData.description || null,
        keywords: artworkData.keywords || [],
        orientation: artworkData.orientation,
        width: artworkData.dimensions.width,
        height: artworkData.dimensions.height,
        unit: artworkData.dimensions.unit,
        original_file_url: artworkData.originalFile?.url || null,
        print_ready_file_url: artworkData.printReadyFile?.url || null,
        thumbnail_url: artworkData.thumbnailUrl || null,
        is_active: artworkData.isActive,
        sort_order: artworkData.sortOrder,
        is_limited_edition: artworkData.isLimitedEdition,
        limited_edition_size: artworkData.limitedEditionSize || null,
        is_available_for_print: artworkData.isAvailableForPrint,
        is_available_as_original: artworkData.isAvailableAsOriginal,
        original_price: artworkData.originalPrice || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating artwork:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error creating artwork:', error)
    return { data: null, error }
  }
}

// Get all artworks for an artist
export async function getArtworks(artistId: string) {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('artist_id', artistId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching artworks:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching artworks:', error)
    return { data: null, error }
  }
}

// Update artwork
export async function updateArtwork(artworkId: string, artworkData: Partial<ArtworkData>) {
  try {
    const updateData: any = {}

    if (artworkData.title !== undefined) updateData.title = artworkData.title
    if (artworkData.yearCreated !== undefined) updateData.year_created = artworkData.yearCreated
    if (artworkData.medium !== undefined) updateData.medium = artworkData.medium
    if (artworkData.description !== undefined) updateData.description = artworkData.description || null
    if (artworkData.keywords !== undefined) updateData.keywords = artworkData.keywords
    if (artworkData.orientation !== undefined) updateData.orientation = artworkData.orientation
    if (artworkData.dimensions) {
      if (artworkData.dimensions.width !== undefined) updateData.width = artworkData.dimensions.width
      if (artworkData.dimensions.height !== undefined) updateData.height = artworkData.dimensions.height
      if (artworkData.dimensions.unit !== undefined) updateData.unit = artworkData.dimensions.unit
    }
    if (artworkData.isActive !== undefined) updateData.is_active = artworkData.isActive
    if (artworkData.sortOrder !== undefined) updateData.sort_order = artworkData.sortOrder

    const { data, error } = await supabase
      .from('artworks')
      .update(updateData)
      .eq('id', artworkId)
      .select()
      .single()

    if (error) {
      console.error('Error updating artwork:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error updating artwork:', error)
    return { data: null, error }
  }
}

// Delete artwork
export async function deleteArtwork(artworkId: string) {
  try {
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', artworkId)

    if (error) {
      console.error('Error deleting artwork:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error deleting artwork:', error)
    return { error }
  }
}

// Section 3: Product Configuration Functions

// Save product configuration
export async function saveProductConfiguration(artistId: string, formData: Section3FormData) {
  try {
    const configData = {
      artist_id: artistId,
      offers_unframed_prints: formData.productOfferings.unframedPrints,
      offers_framed_prints: formData.productOfferings.framedPrints,
      offers_canvas_wraps: formData.productOfferings.canvasWraps,
      offers_metal_prints: formData.productOfferings.metalPrints,
      offers_acrylic_prints: formData.productOfferings.acrylicPrints,
      offers_greeting_cards: formData.productOfferings.greetingCards,
      offers_postcards: formData.productOfferings.postcards,
      offers_posters: formData.productOfferings.posters,
      offers_stickers: formData.productOfferings.stickers,
      custom_products: formData.productOfferings.customProducts || [],
      unit_system: formData.unitSystem,
      available_sizes: formData.availableSizes,
      allow_custom_sizes: formData.allowCustomSizes,
      custom_size_constraints: formData.customSizeConstraints || null,
      print_media_options: formData.printMediaOptions,
      frame_options: formData.frameOptions,
      canvas_wrap_options: formData.canvasWrapOptions,
      special_options: formData.specialOptions,
      packaging_options: formData.packagingOptions,
      quality_standards: formData.qualityStandards,
    }

    const { data, error } = await supabase
      .from('product_configurations')
      .upsert(configData)
      .select()
      .single()

    if (error) {
      console.error('Error saving product configuration:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error saving product configuration:', error)
    return { data: null, error }
  }
}

// Get product configuration
export async function getProductConfiguration(artistId: string) {
  try {
    const { data, error } = await supabase
      .from('product_configurations')
      .select('*')
      .eq('artist_id', artistId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching product configuration:', error)
      return { data: null, error }
    }

    return { data: data || null, error: null }
  } catch (error) {
    console.error('Unexpected error fetching product configuration:', error)
    return { data: null, error }
  }
}

// Section 4: Pricing Functions

// Save product variant pricing
export async function saveProductVariant(artistId: string, variantData: ProductVariantPricing) {
  try {
    const data = {
      artist_id: artistId,
      artwork_id: null, // Can be set later when linking to specific artworks
      sku: variantData.sku,
      product_type: variantData.productType,
      size: variantData.size,
      media: variantData.media,
      frame_color: variantData.frameColor || null,
      base_cost: variantData.baseCost,
      markup_percentage: variantData.markupPercentage,
      final_price: variantData.finalPrice,
      is_limited_edition: variantData.isLimitedEdition,
      limited_edition_price: variantData.limitedEditionPrice || null,
      is_signed: variantData.isSigned,
      signed_price: variantData.signedPrice || null,
      is_active: variantData.isActive,
      special_offers: variantData.specialOffers || [],
    }

    const { data: result, error } = await supabase
      .from('product_variants')
      .upsert(data)
      .select()
      .single()

    if (error) {
      console.error('Error saving product variant:', error)
      return { data: null, error }
    }

    return { data: result, error: null }
  } catch (error) {
    console.error('Unexpected error saving product variant:', error)
    return { data: null, error }
  }
}

// Get all product variants for an artist
export async function getProductVariants(artistId: string) {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching product variants:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching product variants:', error)
    return { data: null, error }
  }
}

// Delete product variant
export async function deleteProductVariant(variantId: string) {
  try {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId)

    if (error) {
      console.error('Error deleting product variant:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error deleting product variant:', error)
    return { error }
  }
}

// Get artist and branding data by ID
export async function getArtist(artistId: string) {
  try {
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single()

    if (artistError) {
      return { data: null, error: artistError }
    }

    const { data: brandingData, error: brandingError } = await supabase
      .from('artist_branding')
      .select('*')
      .eq('artist_id', artistId)
      .single()

    if (brandingError && brandingError.code !== 'PGRST116') { // PGRST116 = not found
      return { data: null, error: brandingError }
    }

    return { 
      data: { 
        artist: artistData, 
        branding: brandingData || null 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Unexpected error getting artist:', error)
    return { data: null, error }
  }
}

// Get complete artist profile with all sections
export async function getCompleteArtistProfile(artistId: string) {
  try {
    // Get artist and branding data
    const { data: artistData, error: artistError } = await getArtist(artistId)
    if (artistError) return { data: null, error: artistError }

    // Get artworks
    const { data: artworks, error: artworkError } = await getArtworks(artistId)
    if (artworkError) return { data: null, error: artworkError }

    // Get product configuration
    const { data: productConfig, error: configError } = await getProductConfiguration(artistId)
    if (configError) return { data: null, error: configError }

    // Get product variants
    const { data: productVariants, error: variantError } = await getProductVariants(artistId)
    if (variantError) return { data: null, error: variantError }

    return {
      data: {
        ...artistData,
        artworks: artworks || [],
        productConfiguration: productConfig,
        productVariants: productVariants || [],
      },
      error: null
    }
  } catch (error) {
    console.error('Unexpected error getting complete artist profile:', error)
    return { data: null, error }
  }
}

// Create or update onboarding session for save-as-draft functionality
export async function saveOnboardingSession(
  artistId: string, 
  sectionNumber: number,
  formData: Record<string, unknown>,
  sessionToken?: string
) {
  try {
    // First, check if a session already exists for this artist
    const { data: existingSession } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('artist_id', artistId)
      .single()

    if (existingSession) {
      // Update existing session
      const { data: sessionResult, error } = await supabase
        .from('onboarding_sessions')
        .update({
          current_section: sectionNumber,
          form_data: formData,
          session_token: sessionToken || existingSession.session_token,
        })
        .eq('id', existingSession.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating onboarding session:', error)
        return { data: null, error }
      }

      return { data: sessionResult, error: null }
    } else {
      // Create new session
      const sessionData = {
        artist_id: artistId,
        session_token: sessionToken || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        current_section: sectionNumber,
        form_data: formData,
      }

      const { data: sessionResult, error } = await supabase
        .from('onboarding_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        console.error('Error creating onboarding session:', error)
        return { data: null, error }
      }

      return { data: sessionResult, error: null }
    }
  } catch (error) {
    console.error('Unexpected error saving session:', error)
    return { data: null, error }
  }
}

// Get onboarding session by artist ID
export async function getOnboardingSession(artistId: string) {
  try {
    const { data, error } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('artist_id', artistId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      return { data: null, error }
    }

    return { data: data || null, error: null }
  } catch (error) {
    console.error('Unexpected error getting session:', error)
    return { data: null, error }
  }
}

// Upload file to Supabase Storage
export async function uploadFile(
  file: File, 
  bucket: 'artwork-files' | 'brand-assets' | 'profile-images',
  folder: string = ''
) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) {
      console.error('Error uploading file:', error)
      return { data: null, error }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { 
      data: {
        path: filePath,
        publicUrl: publicUrlData.publicUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Unexpected error uploading file:', error)
    return { data: null, error }
  }
}

// Record file upload in database
export async function recordFileUpload(
  artistId: string,
  fileData: {
    path: string
    publicUrl: string
    fileName: string
    originalName: string
    size: number
    type: string
  },
  category: 'artwork' | 'logo' | 'brand_guide' | 'headshot' | 'studio_photo' | 'other',
  artworkId?: string
) {
  try {
    const { data: fileRecord, error } = await supabase
      .from('file_uploads')
      .insert({
        artist_id: artistId,
        artwork_id: artworkId || null,
        original_filename: fileData.originalName,
        stored_filename: fileData.fileName,
        file_path: fileData.path,
        file_type: fileData.type,
        file_size: fileData.size,
        mime_type: fileData.type,
        category: category,
        processing_status: 'completed',
      })
      .select()
      .single()

    if (error) {
      console.error('Error recording file upload:', error)
      return { data: null, error }
    }

    return { data: fileRecord, error: null }
  } catch (error) {
    console.error('Unexpected error recording file:', error)
    return { data: null, error }
  }
}
