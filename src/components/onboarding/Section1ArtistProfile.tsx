"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Section1FormData, 
  section1Schema, 
  section1DefaultValues,
  designFeelOptions,
  commonWebsiteElements,
  commonFonts
} from "@/lib/validations/section1-schema"

interface Section1ArtistProfileProps {
  onSectionComplete?: (sectionId: number) => void
  onSaveProgress?: () => void
  artistId?: string // If editing existing artist
  initialData?: Partial<Section1FormData>
}

export default function Section1ArtistProfile({ 
  onSectionComplete, 
  onSaveProgress,
  artistId,
  initialData 
}: Section1ArtistProfileProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])
  
  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const headshotInputRef = useRef<HTMLInputElement>(null)
  const studioPhotoInputRef = useRef<HTMLInputElement>(null)
  const brandGuideInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<Section1FormData>({
    resolver: zodResolver(section1Schema),
    defaultValues: {
      ...section1DefaultValues,
      ...initialData,
      // Ensure arrays are always arrays
      designReferences: initialData?.designReferences || [],
      mustHaveElements: initialData?.mustHaveElements || [],
      preferredFonts: initialData?.preferredFonts || [],
    },
  })

  // Simplified state management for arrays instead of useFieldArray
  const [designReferences, setDesignReferences] = useState<string[]>(
    initialData?.designReferences || []
  )
  const [mustHaveElements, setMustHaveElements] = useState<string[]>(
    initialData?.mustHaveElements || []
  )
  const [preferredFonts, setPreferredFonts] = useState<string[]>(
    initialData?.preferredFonts || []
  )

  // Handle file upload (placeholder - implement file upload API later)
  const handleFileUpload = async (
    file: File,
    category: 'logo' | 'headshot' | 'studio_photo' | 'brand_guide'
  ) => {
    try {
      setUploadProgress(prev => ({ ...prev, [category]: 0 }))
      
      // For now, just simulate upload progress
      // TODO: Implement actual file upload to Supabase Storage via API
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const progress = (prev[category] || 0) + 20
          if (progress >= 100) {
            clearInterval(interval)
            return { ...prev, [category]: 100 }
          }
          return { ...prev, [category]: progress }
        })
      }, 200)
      
      // Set placeholder file info
      setTimeout(() => {
        form.setValue(`${category}FileName` as keyof Section1FormData, file.name)
      }, 1000)
      
      return {
        publicUrl: URL.createObjectURL(file),
        originalName: file.name,
        fileName: file.name,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error(`Error uploading ${category}:`, error)
      setErrors(prev => [...prev, `Failed to upload ${category}`])
      return null
    }
  }

  // Save as draft via API
  const handleSaveAsDraft = async () => {
    try {
      setIsSaving(true)
      setErrors([])
      
      const formData = form.getValues()
      
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          artistId,
          sectionNumber: 1,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setErrors([result.error || 'Failed to save draft'])
        return
      }

      // Save draft successfully
      console.log('Draft saved:', result.data)
      onSaveProgress?.()
    } catch (error) {
      console.error('Error saving draft:', error)
      setErrors(['Failed to save draft'])
    } finally {
      setIsSaving(false)
    }
  }

  // Submit section via API
  const handleSubmit = async (data: Section1FormData) => {
    try {
      setIsLoading(true)
      setErrors([])

      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          artistId, // Include artistId if updating existing artist
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setErrors([result.error || 'Failed to submit section'])
        return
      }

      // Clear local storage draft on successful submission
      localStorage.removeItem('onboarding_draft_section1')
      
      console.log('Section submitted successfully:', result.data)
      onSectionComplete?.(1)
    } catch (error) {
      console.error('Error submitting section:', error)
      setErrors(['Failed to submit section'])
    } finally {
      setIsLoading(false)
    }
  }

  // File input change handlers
  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    category: 'logo' | 'headshot' | 'studio_photo' | 'brand_guide'
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      await handleFileUpload(file, category)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Basic Information
            </CardTitle>
            <CardDescription>
              Tell us about yourself and your artistic practice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  placeholder="Your full name"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="studioName">Studio Name</Label>
                <Input
                  id="studioName"
                  {...form.register("studioName")}
                  placeholder="Your studio or business name"
                />
                {form.formState.errors.studioName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.studioName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="your@email.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="(555) 123-4567"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="City, State/Province, Country"
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessNumber">Business Number</Label>
                <Input
                  id="businessNumber"
                  {...form.register("businessNumber")}
                  placeholder="Business registration number"
                />
              </div>
              
              <div>
                <Label htmlFor="gstNumber">GST/Tax Number</Label>
                <Input
                  id="gstNumber"
                  {...form.register("gstNumber")}
                  placeholder="GST or tax identification number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artist Bio & Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✍️</span>
              Artist Statement & Bio
            </CardTitle>
            <CardDescription>
              Share your artistic vision and background
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bio">Artist Bio *</Label>
              <Textarea
                id="bio"
                {...form.register("bio")}
                placeholder="Tell us about your artistic journey, background, and what drives your creative practice..."
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Minimum 50 characters. This will appear on your website&apos;s About page.
              </p>
              {form.formState.errors.bio && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tagline">Tagline or Motto</Label>
              <Input
                id="tagline"
                {...form.register("tagline")}
                placeholder="A brief phrase that captures your artistic essence"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Optional. A short, memorable phrase that represents your work.
              </p>
            </div>

            <div>
              <Label htmlFor="artisticStyle">Artistic Style & Approach *</Label>
              <Textarea
                id="artisticStyle"
                {...form.register("artisticStyle")}
                placeholder="Describe your artistic style, techniques, themes, and what makes your work unique..."
                className="min-h-[100px]"
              />
              {form.formState.errors.artisticStyle && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.artisticStyle.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Brand Colors
            </CardTitle>
            <CardDescription>
              Choose colors that represent your brand identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    {...form.register("primaryColor")}
                    placeholder="#FF0000"
                    className="font-mono"
                  />
                  <Input
                    type="color"
                    value={form.watch("primaryColor") || "#000000"}
                    onChange={(e) => form.setValue("primaryColor", e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                </div>
                {form.formState.errors.primaryColor && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.primaryColor.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    {...form.register("secondaryColor")}
                    placeholder="#00FF00"
                    className="font-mono"
                  />
                  <Input
                    type="color"
                    value={form.watch("secondaryColor") || "#000000"}
                    onChange={(e) => form.setValue("secondaryColor", e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    {...form.register("accentColor")}
                    placeholder="#0000FF"
                    className="font-mono"
                  />
                  <Input
                    type="color"
                    value={form.watch("accentColor") || "#000000"}
                    onChange={(e) => form.setValue("accentColor", e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📁</span>
              Brand Assets & Photos
            </CardTitle>
            <CardDescription>
              Upload your logo, photos, and brand materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo Upload */}
              <div>
                <Label>Logo</Label>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {form.watch("logoFileName") ? (
                    <div>
                      <p className="text-sm font-medium">{form.watch("logoFileName")}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm">Click to upload logo</p>
                      <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  {uploadProgress.logo !== undefined && uploadProgress.logo < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress.logo}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileInputChange(e, 'logo')}
                  className="hidden"
                />
              </div>

              {/* Headshot Upload */}
              <div>
                <Label>Headshot/Portrait</Label>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => headshotInputRef.current?.click()}
                >
                  {form.watch("headshotFileName") ? (
                    <div>
                      <p className="text-sm font-medium">{form.watch("headshotFileName")}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm">Click to upload headshot</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                    </div>
                  )}
                  {uploadProgress.headshot !== undefined && uploadProgress.headshot < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress.headshot}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={headshotInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileInputChange(e, 'headshot')}
                  className="hidden"
                />
              </div>

              {/* Studio Photo Upload */}
              <div>
                <Label>Studio Photo</Label>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => studioPhotoInputRef.current?.click()}
                >
                  {form.watch("studioPhotoFileName") ? (
                    <div>
                      <p className="text-sm font-medium">{form.watch("studioPhotoFileName")}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm">Click to upload studio photo</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                    </div>
                  )}
                  {uploadProgress.studio_photo !== undefined && uploadProgress.studio_photo < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress.studio_photo}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={studioPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileInputChange(e, 'studio_photo')}
                  className="hidden"
                />
              </div>

              {/* Brand Guide Upload */}
              <div>
                <Label>Brand Guide</Label>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => brandGuideInputRef.current?.click()}
                >
                  {form.watch("brandGuideFileName") ? (
                    <div>
                      <p className="text-sm font-medium">{form.watch("brandGuideFileName")}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm">Click to upload brand guide</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF up to 10MB</p>
                    </div>
                  )}
                  {uploadProgress.brand_guide !== undefined && uploadProgress.brand_guide < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress.brand_guide}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={brandGuideInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileInputChange(e, 'brand_guide')}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔗</span>
              Social Media & Website
            </CardTitle>
            <CardDescription>
              Connect your social media profiles and website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...form.register("socialLinks.instagram")}
                  placeholder="https://instagram.com/yourusername"
                />
              </div>
              
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  {...form.register("socialLinks.facebook")}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              
              <div>
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  {...form.register("socialLinks.twitter")}
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...form.register("socialLinks.linkedin")}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  {...form.register("socialLinks.website")}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div>
                <Label htmlFor="domainName">Preferred Domain Name</Label>
                <Input
                  id="domainName"
                  {...form.register("domainName")}
                  placeholder="yourartname.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If you own a domain or have a preference
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Design Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Website Design Preferences
            </CardTitle>
            <CardDescription>
              Help us understand your design aesthetic and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="designFeel">Design Feel</Label>
              <Select 
                value={form.watch("designFeel") || ""} 
                onValueChange={(value) => form.setValue("designFeel", value as "minimalist" | "bold" | "artistic" | "editorial" | "commercial")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a design aesthetic" />
                </SelectTrigger>
                <SelectContent>
                  {designFeelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Design References */}
            <div>
              <Label>Design References</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add URLs to websites or designs you admire (max 5)
              </p>
              {designReferences.map((reference, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={reference}
                    onChange={(e) => {
                      const newReferences = [...designReferences]
                      newReferences[index] = e.target.value
                      setDesignReferences(newReferences)
                      form.setValue("designReferences", newReferences)
                    }}
                    placeholder="https://example.com"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newReferences = designReferences.filter((_, i) => i !== index)
                      setDesignReferences(newReferences)
                      form.setValue("designReferences", newReferences)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {designReferences.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newReferences = [...designReferences, ""]
                    setDesignReferences(newReferences)
                    form.setValue("designReferences", newReferences)
                  }}
                >
                  Add Reference
                </Button>
              )}
            </div>

            {/* Must-Have Elements */}
            <div>
              <Label>Must-Have Website Elements</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Select or add elements that are essential for your website
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonWebsiteElements.map((element) => (
                  <Badge
                    key={element}
                    variant={
                      mustHaveElements.includes(element) 
                        ? "default" 
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      const newElements = mustHaveElements.includes(element)
                        ? mustHaveElements.filter(e => e !== element)
                        : [...mustHaveElements, element]
                      setMustHaveElements(newElements)
                      form.setValue("mustHaveElements", newElements)
                    }}
                  >
                    {element}
                  </Badge>
                ))}
              </div>
              {mustHaveElements.filter(el => !commonWebsiteElements.includes(el as typeof commonWebsiteElements[number])).map((element, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={element}
                    onChange={(e) => {
                      const customElements = mustHaveElements.filter(el => !commonWebsiteElements.includes(el as typeof commonWebsiteElements[number]))
                      const commonElements = mustHaveElements.filter(el => commonWebsiteElements.includes(el as typeof commonWebsiteElements[number]))
                      customElements[index] = e.target.value
                      const newElements = [...commonElements, ...customElements]
                      setMustHaveElements(newElements)
                      form.setValue("mustHaveElements", newElements)
                    }}
                    placeholder="Custom element"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newElements = mustHaveElements.filter((_, i) => {
                        const customIndex = mustHaveElements.findIndex(el => !commonWebsiteElements.includes(el as typeof commonWebsiteElements[number]))
                        return i !== customIndex + index
                      })
                      setMustHaveElements(newElements)
                      form.setValue("mustHaveElements", newElements)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {mustHaveElements.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newElements = [...mustHaveElements, ""]
                    setMustHaveElements(newElements)
                    form.setValue("mustHaveElements", newElements)
                  }}
                >
                  Add Custom Element
                </Button>
              )}
            </div>

            {/* Preferred Fonts */}
            <div>
              <Label>Preferred Fonts</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Select or add fonts you&apos;d like to use (max 5)
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonFonts.map((font) => (
                  <Badge
                    key={font}
                    variant={
                      preferredFonts.includes(font) 
                        ? "default" 
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      if (preferredFonts.includes(font)) {
                        const newFonts = preferredFonts.filter(f => f !== font)
                        setPreferredFonts(newFonts)
                        form.setValue("preferredFonts", newFonts)
                      } else if (preferredFonts.length < 5) {
                        const newFonts = [...preferredFonts, font]
                        setPreferredFonts(newFonts)
                        form.setValue("preferredFonts", newFonts)
                      }
                    }}
                  >
                    {font}
                  </Badge>
                ))}
              </div>
              {preferredFonts.filter(font => !commonFonts.includes(font as typeof commonFonts[number])).map((font, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={font}
                    onChange={(e) => {
                      const customFonts = preferredFonts.filter(f => !commonFonts.includes(f as typeof commonFonts[number]))
                      const commonSelected = preferredFonts.filter(f => commonFonts.includes(f as typeof commonFonts[number]))
                      customFonts[index] = e.target.value
                      const newFonts = [...commonSelected, ...customFonts]
                      setPreferredFonts(newFonts)
                      form.setValue("preferredFonts", newFonts)
                    }}
                    placeholder="Custom font"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFonts = preferredFonts.filter((_, i) => {
                        const customIndex = preferredFonts.findIndex(f => !commonFonts.includes(f as typeof commonFonts[number]))
                        return i !== customIndex + index
                      })
                      setPreferredFonts(newFonts)
                      form.setValue("preferredFonts", newFonts)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {preferredFonts.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFonts = [...preferredFonts, ""]
                    setPreferredFonts(newFonts)
                    form.setValue("preferredFonts", newFonts)
                  }}
                >
                  Add Custom Font
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Complete Section 1"}
          </Button>
        </div>
      </form>
    </div>
  )
}
